from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from google.adk.events import Event
from google.genai import types
from pydantic import SecretStr
from starlette.websockets import WebSocketDisconnect

from app.core.config import Settings
from app.main import create_app
from app.services.auth import sign_live_ticket, verify_live_ticket
from app.services.mira import LiveTranslator

SECRET = "test-secret"  # noqa: S105
NOW = datetime(2026, 1, 1, tzinfo=UTC)


def test_live_ticket_round_trips_and_expires() -> None:
    session_id = uuid4()
    ticket = sign_live_ticket("user_1", session_id, NOW + timedelta(seconds=60), SECRET)
    assert verify_live_ticket(ticket, SECRET, NOW) == ("user_1", session_id)
    assert verify_live_ticket(ticket, SECRET, NOW + timedelta(seconds=60)) is None
    assert verify_live_ticket(ticket, "other-secret", NOW) is None


@pytest.mark.parametrize("ticket", ["", ".", "garbage", "abc.def", "!!.sig"])
def test_live_ticket_rejects_garbage(ticket: str) -> None:
    assert verify_live_ticket(ticket, SECRET, NOW) is None


@pytest.mark.parametrize("valid_ticket", [False, True])
def test_live_socket_refuses_bad_tickets(valid_ticket: bool) -> None:
    app = create_app(
        Settings(_env_file=None, environment="test", database_url=None, better_auth_secret=SecretStr(SECRET))
    )
    session_id = uuid4()
    # A valid ticket for a different session must not open this one.
    ticket = (
        sign_live_ticket("user_1", uuid4(), datetime.now(UTC) + timedelta(seconds=60), SECRET) if valid_ticket else "x"
    )
    with TestClient(app) as client, pytest.raises(WebSocketDisconnect) as closed:
        with client.websocket_connect(f"/api/v1/sessions/{session_id}/live?ticket={ticket}"):
            pass
    assert closed.value.code == 1008


def _msgs(out: list[bytes | dict[str, Any]]) -> list[dict[str, Any]]:
    assert all(isinstance(o, dict) for o in out)
    return [o for o in out if isinstance(o, dict)]


def _said(text: str, *, partial: bool, finished: bool = False, mira: bool = True) -> Event:
    t = types.Transcription(text=text, finished=finished)
    return Event(
        author="mira",
        partial=partial,
        output_transcription=t if mira else None,
        input_transcription=None if mira else t,
    )


def test_translator_streams_captions_then_one_final() -> None:
    tr = LiveTranslator()
    assert _msgs(tr.feed(_said("Why is", partial=True, mira=False)))[0]["text"] == "Why is"
    first = _msgs(tr.feed(_said("Sky blue", partial=True)))
    # Mira answering closes the learner's turn.
    assert first[0] == {
        "type": "transcript",
        "id": "learner-0",
        "role": "learner",
        "text": "Why is",
        "final": True,
        "interrupted": False,
    }
    assert first[1]["text"] == "Sky blue"
    assert _msgs(tr.feed(_said(" because", partial=True)))[0]["text"] == "Sky blue because"
    final = tr.feed(_said("Sky blue because of scattering.", partial=False, finished=True))
    assert final == [
        {
            "type": "transcript",
            "id": "mira-0",
            "role": "mira",
            "text": "Sky blue because of scattering.",
            "final": True,
            "interrupted": False,
        }
    ]
    assert tr.feed(Event(author="mira", turn_complete=True)) == [{"type": "turn_complete"}]


def test_translator_marks_interrupted_turns_and_passes_audio() -> None:
    tr = LiveTranslator()
    tr.feed(_said("Let me explain", partial=True))
    audio = Event(
        author="mira",
        content=types.Content(
            parts=[types.Part(inline_data=types.Blob(mime_type="audio/pcm;rate=24000", data=b"\x01"))]
        ),
    )
    assert tr.feed(audio) == [b"\x01"]
    assert tr.feed(Event(author="mira", interrupted=True)) == [{"type": "interrupted"}]
    out = _msgs(tr.feed(Event(author="mira", turn_complete=True)))
    assert out[0]["interrupted"] is True
    assert out[0]["text"] == "Let me explain"
    assert tr.flush() == []
