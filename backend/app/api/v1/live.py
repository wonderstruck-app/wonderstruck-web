"""Live voice with Mira over a WebSocket, bridged to Gemini Live through Google ADK.

The browser first asks for a ticket over the same-origin proxy (cookie auth), then opens
`/sessions/{id}/live?ticket=…` straight to the API. Binary frames up are 16 kHz 16-bit mono PCM from
the mic; binary frames down are Mira's 24 kHz PCM. JSON frames carry text turns and captions (see
`LiveTranslator`). Send `{"type":"end"}` to hang up: the server saves the last turns, then
closes. Raw audio is never stored; only final captions are, when the learner keeps transcripts.
"""

import asyncio
import contextlib
import json
from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

import structlog
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from google.adk.agents.live_request_queue import LiveRequestQueue
from google.adk.runners import Runner
from google.genai import types
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import CurrentUser, DbSession, Now, SettingsDep
from app.core.errors import AppError
from app.models.base import utcnow
from app.models.enums import MessageRole, MessageVia
from app.schemas.common import ApiModel
from app.schemas.sessions import MessageCreate
from app.services import mira, sessions
from app.services.auth import LIVE_TICKET_TTL, sign_live_ticket, verify_live_ticket

log = structlog.get_logger("mira.live")

router = APIRouter(prefix="/sessions", tags=["live"])
ws_router = APIRouter(prefix="/sessions", tags=["live"])

MAX_AUDIO_FRAME = 64 * 1024
WRITER_GRACE_SECONDS = 10


class LiveTicket(ApiModel):
    ticket: str
    expires_at: datetime


@router.post(
    "/{session_id}/live-ticket",
    summary="A short-lived ticket for the live voice socket",
    description="Open `/api/v1/sessions/{id}/live?ticket=…` with it within a minute.",
)
async def live_ticket(
    session_id: UUID, db: DbSession, user: CurrentUser, now: Now, settings: SettingsDep
) -> LiveTicket:
    if not settings.mira_live_enabled:
        raise AppError(503, "voice_unavailable", "Mira's voice isn't set up on this server yet.")
    session = await sessions.get_owned(db, user.id, session_id)
    secret = settings.better_auth_secret
    if secret is None:
        raise AppError(401, "unauthenticated", "Sign in to continue.")
    expires_at = now + LIVE_TICKET_TTL
    return LiveTicket(
        ticket=sign_live_ticket(user.id, session.id, expires_at, secret.get_secret_value()), expires_at=expires_at
    )


async def _send(websocket: WebSocket, out: mira.Outgoing) -> None:
    if isinstance(out, bytes):
        await websocket.send_bytes(out)
    else:
        await websocket.send_text(json.dumps(out))


async def _fail(websocket: WebSocket, code: str, message: str) -> None:
    with contextlib.suppress(Exception):
        await websocket.send_text(json.dumps({"type": "error", "code": code, "message": message}))
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)


async def _writer(
    maker: async_sessionmaker[AsyncSession],
    user_id: str,
    session_id: UUID,
    queue: "asyncio.Queue[MessageCreate | None]",
) -> None:
    """Saves turns in arrival order without holding up the audio stream."""
    while (message := await queue.get()) is not None:
        try:
            async with maker() as db:
                await sessions.add_message(db, user_id, session_id, message, utcnow())
        except Exception:
            log.exception("live.save_failed", session_id=str(session_id))


@ws_router.websocket("/{session_id}/live")
async def live(websocket: WebSocket, session_id: UUID, settings: SettingsDep, ticket: str = "") -> None:
    origin = websocket.headers.get("origin")
    secret = settings.better_auth_secret
    claims = verify_live_ticket(ticket, secret.get_secret_value(), utcnow()) if secret and ticket else None
    if claims is None or claims[1] != session_id or (origin and origin.rstrip("/") not in settings.cors_origins):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    user_id = claims[0]

    await websocket.accept()
    runner: Runner | None = getattr(websocket.app.state, "mira_runner", None)
    maker: async_sessionmaker[AsyncSession] | None = websocket.app.state.sessionmaker
    if runner is None or maker is None:
        await _fail(websocket, "voice_unavailable", "Mira's voice isn't set up on this server yet.")
        return
    try:
        async with maker() as db:
            ctx = await mira.load_context(db, user_id, session_id, utcnow())
    except AppError as e:
        await _fail(websocket, e.code, e.message)
        return

    adk = await runner.session_service.create_session(
        app_name=mira.APP_NAME, user_id=user_id, state={"instruction": ctx.instruction}
    )
    live_queue = LiveRequestQueue()
    saves: asyncio.Queue[MessageCreate | None] = asyncio.Queue()
    translator = mira.LiveTranslator()
    connection = uuid4().hex[:12]

    def keep(out: mira.Outgoing) -> None:
        if ctx.keep_transcripts and isinstance(out, dict) and out.get("type") == "transcript" and out["final"]:
            saves.put_nowait(
                MessageCreate(
                    client_id=f"live:{connection}:{out['id']}",
                    role=MessageRole(out["role"]),
                    via=MessageVia.voice,
                    text=out["text"],
                    interrupted=out["interrupted"],
                )
            )

    async def upstream() -> None:
        while True:
            message = await websocket.receive()
            if message["type"] == "websocket.disconnect":
                return
            if (data := message.get("bytes")) is not None:
                if 0 < len(data) <= MAX_AUDIO_FRAME:
                    live_queue.send_realtime(types.Blob(mime_type=mira.INPUT_AUDIO, data=data))
                continue
            try:
                payload: Any = json.loads(message.get("text") or "")
            except ValueError:
                continue
            kind = payload.get("type") if isinstance(payload, dict) else None
            if kind == "text" and isinstance(text := payload.get("text"), str) and text.strip():
                text = text.strip()[: mira.MAX_MESSAGE]
                client_id = str(payload.get("clientId") or uuid4())[:100]
                if ctx.keep_transcripts:
                    saves.put_nowait(
                        MessageCreate(client_id=client_id, role=MessageRole.learner, via=MessageVia.text, text=text)
                    )
                live_queue.send_content(types.Content(role="user", parts=[types.Part(text=text)]))
            elif kind == "audio_end":
                live_queue.send_audio_stream_end()
            elif kind == "end":
                return

    async def downstream() -> None:
        async for event in runner.run_live(
            user_id=user_id, session_id=adk.id, live_request_queue=live_queue, run_config=mira.run_config(ctx)
        ):
            for out in translator.feed(event):
                keep(out)
                await _send(websocket, out)

    writer = asyncio.create_task(_writer(maker, user_id, session_id, saves))
    tasks = [asyncio.create_task(upstream()), asyncio.create_task(downstream())]
    log.info("live.open", session_id=str(session_id), voice=ctx.voice_name)
    try:
        await _send(websocket, {"type": "ready"})
        done, _ = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
        for task in done:
            if (error := task.exception()) is not None and not isinstance(error, WebSocketDisconnect):
                log.error("live.failed", session_id=str(session_id), error=repr(error))
                await _fail(websocket, "mira_error", "Mira lost the connection. Try again.")
    except WebSocketDisconnect:
        pass
    finally:
        live_queue.close()
        for task in tasks:
            task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)
        for out in translator.flush():
            keep(out)
        saves.put_nowait(None)
        with contextlib.suppress(Exception):
            await asyncio.wait_for(writer, WRITER_GRACE_SECONDS)
        await runner.session_service.delete_session(app_name=mira.APP_NAME, user_id=user_id, session_id=adk.id)
        with contextlib.suppress(Exception):
            await websocket.close()
        log.info("live.close", session_id=str(session_id))
