"""Mira's live voice: Gemini Live through Google ADK on Vertex AI.

One ADK `Runner` serves every connection. Each live socket gets its own ADK session whose state
carries the grounding (the block, its sources and the conversation so far), so the agent's
instruction is built per learner without a runner per socket.
"""

import os
from dataclasses import dataclass
from datetime import datetime
from typing import Any
from uuid import UUID

from google.adk.agents import Agent
from google.adk.agents._streaming_mode import StreamingMode
from google.adk.agents.readonly_context import ReadonlyContext
from google.adk.agents.run_config import RunConfig
from google.adk.events import Event
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from sqlmodel import col, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import Settings
from app.core.errors import AppError
from app.models import BlockSource, LearningBlock, SessionMessage
from app.models.enums import MessageRole, SessionStatus, VoicePace
from app.services import knowledge, sessions
from app.services.blocks import block_concepts

APP_NAME = "wonderstruck-mira"
INPUT_AUDIO = "audio/pcm;rate=16000"
HISTORY_TURNS = 24
MAX_MESSAGE = 8000

# Settings voice ids → Gemini prebuilt voices.
VOICE_NAMES = {"warm": "Sulafat", "bright": "Laomedeia", "calm": "Achernar"}

PACE = {
    VoicePace.relaxed: "Speak slowly and leave room to think.",
    VoicePace.natural: "Speak at a natural, conversational pace.",
    VoicePace.brisk: "Keep a brisk pace and get to the point quickly.",
}

PERSONA = """\
You are Mira, the owl who guides learners in Wonderstruck, an app that turns curiosity into understanding.
You are talking out loud with one learner, in real time.

How you talk:
- Warm, curious and plain-spoken. Sound like a thoughtful friend, not a lecturer.
- Keep each turn short: one to three sentences, then hand the conversation back.
- Speech only. No lists, headings, markdown, emoji, or URLs read aloud.
- {pace}

How you teach:
- Help the learner work things out. Ask what they already think, then build on it.
- Use one vivid analogy or everyday example at a time.
- When they get something wrong, say so kindly and show why, then let them try again.
- Check understanding now and then with a quick question.

Honesty:
- If you are not sure, say so. Never invent facts, numbers, studies or sources.
- Prefer the material below; you may mention a listed source by name.
- Gently steer away from anything unsafe or unrelated to learning."""


@dataclass(frozen=True)
class LiveContext:
    instruction: str
    voice_name: str
    interruptible: bool
    keep_transcripts: bool


def configure_vertex(settings: Settings) -> None:
    """ADK builds its Gen AI client from the environment, so mirror the settings into it."""
    if settings.google_cloud_project:
        os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "TRUE"
        os.environ["GOOGLE_CLOUD_PROJECT"] = settings.google_cloud_project
        os.environ["GOOGLE_CLOUD_LOCATION"] = settings.google_cloud_location


def _instruction(ctx: ReadonlyContext) -> str:
    value = ctx.state.get("instruction")
    return value if isinstance(value, str) else PERSONA.format(pace=PACE[VoicePace.natural])


def create_runner(settings: Settings) -> Runner:
    agent = Agent(
        name="mira",
        model=settings.mira_live_model,
        description="Wonderstruck's voice tutor.",
        instruction=_instruction,
    )
    return Runner(app_name=APP_NAME, agent=agent, session_service=InMemorySessionService())


def build_instruction(
    *,
    pace: VoicePace,
    title: str,
    block: LearningBlock | None,
    sources: list[BlockSource],
    concepts: list[tuple[str, str]],
    history: list[SessionMessage],
) -> str:
    parts = [PERSONA.format(pace=PACE[pace])]
    if block is not None:
        material = [f"Today's question: {block.question}", block.teaser, *block.body]
        parts.append("The learning block you are exploring together:\n" + "\n\n".join(p for p in material if p))
        if concepts:
            parts.append("Key ideas:\n" + "\n".join(f"- {label}: {summary}" for label, summary in concepts))
        if sources:
            parts.append("Sources:\n" + "\n".join(f"- {s.title} ({s.publisher})" for s in sources))
    else:
        parts.append(f"This is an open session titled “{title}”. Follow the learner's curiosity wherever it goes.")
    if history:
        lines = [f"{'Mira' if m.role is MessageRole.mira else 'Learner'}: {m.text}" for m in history]
        parts.append(
            "The conversation so far (continue it; do not greet again or repeat yourself):\n" + "\n".join(lines)
        )
    else:
        parts.append("This is the start of the conversation. Open with a short, inviting question.")
    return "\n\n".join(parts)


async def load_context(db: AsyncSession, user_id: str, session_id: UUID, now: datetime) -> LiveContext:
    session = await sessions.get_owned(db, user_id, session_id)
    if session.status is not SessionStatus.active:
        raise AppError(409, "session_ended", "This session has ended. Start a new one to keep exploring.")
    prefs = await knowledge.settings(db, user_id, now)

    block = await db.get(LearningBlock, session.block_id) if session.block_id else None
    sources: list[BlockSource] = []
    concepts: list[tuple[str, str]] = []
    if block is not None:
        sources = list(
            (
                await db.exec(
                    select(BlockSource).where(BlockSource.block_id == block.id).order_by(col(BlockSource.position))
                )
            ).all()
        )
        concepts = [(c.label, c.summary) for c in (await block_concepts(db, [block.id]))[block.id]]
    recent = (
        await db.exec(
            select(SessionMessage)
            .where(SessionMessage.session_id == session.id)
            .order_by(col(SessionMessage.seq).desc())
            .limit(HISTORY_TURNS)
        )
    ).all()
    return LiveContext(
        instruction=build_instruction(
            pace=prefs.voice.pace,
            title=session.title,
            block=block,
            sources=sources,
            concepts=concepts,
            history=list(reversed(recent)),
        ),
        voice_name=VOICE_NAMES.get(prefs.voice.voice_id, VOICE_NAMES["warm"]),
        interruptible=prefs.voice.interruptible,
        keep_transcripts=prefs.privacy.keep_transcripts,
    )


def run_config(ctx: LiveContext) -> RunConfig:
    return RunConfig(
        streaming_mode=StreamingMode.BIDI,
        response_modalities=["AUDIO"],
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=ctx.voice_name))
        ),
        input_audio_transcription=types.AudioTranscriptionConfig(),
        output_audio_transcription=types.AudioTranscriptionConfig(),
        realtime_input_config=types.RealtimeInputConfig(
            activity_handling=(
                types.ActivityHandling.START_OF_ACTIVITY_INTERRUPTS
                if ctx.interruptible
                else types.ActivityHandling.NO_INTERRUPTION
            )
        ),
        # Lets ADK reconnect past the Live API's connection limit and keep long sessions going.
        session_resumption=types.SessionResumptionConfig(),
        context_window_compression=types.ContextWindowCompressionConfig(sliding_window=types.SlidingWindow()),
    )


Outgoing = bytes | dict[str, Any]


class LiveTranslator:
    """Turns ADK live events into the socket protocol the web client speaks.

    Binary frames carry Mira's 24 kHz PCM audio. JSON frames carry captions — `transcript` with the
    text so far for a turn, then once more with `final: true` — plus `interrupted`, `turn_complete`
    and `error`. Final captions are what gets saved.
    """

    def __init__(self) -> None:
        self._text = {MessageRole.learner: "", MessageRole.mira: ""}
        self._turn = {MessageRole.learner: 0, MessageRole.mira: 0}
        self._interrupted = False

    def _caption(self, role: MessageRole, *, final: bool) -> dict[str, Any]:
        out: dict[str, Any] = {
            "type": "transcript",
            "id": f"{role.value}-{self._turn[role]}",
            "role": role.value,
            "text": self._text[role].strip()[:MAX_MESSAGE],
            "final": final,
        }
        if final:
            out["interrupted"] = role is MessageRole.mira and self._interrupted
        return out

    def _finish(self, role: MessageRole) -> list[Outgoing]:
        if not self._text[role].strip():
            self._text[role] = ""
            return []
        out = self._caption(role, final=True)
        self._text[role] = ""
        self._turn[role] += 1
        if role is MessageRole.mira:
            self._interrupted = False
        return [out]

    def _transcription(self, role: MessageRole, t: types.Transcription, partial: bool | None) -> list[Outgoing]:
        if t.finished or partial is False:
            # The closing event repeats the whole turn, so it replaces what was streamed.
            if t.text:
                self._text[role] = t.text
            return self._finish(role)
        if not t.text:
            return []
        self._text[role] += t.text
        return [self._caption(role, final=False)]

    def feed(self, event: Event) -> list[Outgoing]:
        out: list[Outgoing] = []
        if event.error_code:
            out.append({"type": "error", "code": "mira_error", "message": "Mira hit a problem. Try again."})
        if event.input_transcription:
            out += self._transcription(MessageRole.learner, event.input_transcription, event.partial)
        if event.output_transcription:
            # The learner has finished speaking once Mira answers.
            out += self._finish(MessageRole.learner)
            out += self._transcription(MessageRole.mira, event.output_transcription, event.partial)
        if event.content and event.content.parts:
            for part in event.content.parts:
                blob = part.inline_data
                if blob and blob.data and (blob.mime_type or "").startswith("audio/pcm"):
                    out.append(blob.data)
        if event.interrupted:
            self._interrupted = True
            out.append({"type": "interrupted"})
        if event.turn_complete:
            out += self._finish(MessageRole.learner)
            out += self._finish(MessageRole.mira)
            out.append({"type": "turn_complete"})
        return out

    def flush(self) -> list[Outgoing]:
        """Captions still open when the socket closes."""
        if self._text[MessageRole.mira].strip():
            self._interrupted = True
        return self._finish(MessageRole.learner) + self._finish(MessageRole.mira)
