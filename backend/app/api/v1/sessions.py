from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, Response, status

from app.api.deps import CurrentUser, DbSession, Now
from app.schemas.sessions import (
    AttemptCreate,
    AttemptOut,
    Heartbeat,
    MessageCreate,
    MessageOut,
    RecapOut,
    SessionCreate,
    SessionDetail,
    SessionSummary,
)
from app.services import sessions

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("", summary="Sessions, most recently active first")
async def list_sessions(
    db: DbSession, user: CurrentUser, limit: Annotated[int, Query(ge=1, le=100)] = 50
) -> list[SessionSummary]:
    return await sessions.list_summaries(db, user.id, limit=limit)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Start a session",
    description="Starting from a block that already has an active session resumes it with `200`.",
)
async def start_session(
    body: SessionCreate, response: Response, db: DbSession, user: CurrentUser, now: Now
) -> SessionDetail:
    session, created = await sessions.start(db, user.id, body, now)
    if not created:
        response.status_code = status.HTTP_200_OK
    return await sessions.detail(db, session)


@router.get("/{session_id}", summary="A session with its recap, transcript and attempts")
async def read_session(session_id: UUID, db: DbSession, user: CurrentUser) -> SessionDetail:
    return await sessions.detail(db, await sessions.get_owned(db, user.id, session_id))


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a session")
async def delete_session(session_id: UUID, db: DbSession, user: CurrentUser) -> None:
    await sessions.remove(db, user.id, session_id)


@router.post(
    "/{session_id}/messages",
    status_code=status.HTTP_201_CREATED,
    summary="Append a transcript message",
    description="Idempotent on `clientId`: a replay returns the stored message with `200`.",
)
async def add_message(
    session_id: UUID, body: MessageCreate, response: Response, db: DbSession, user: CurrentUser, now: Now
) -> MessageOut:
    message, created = await sessions.add_message(db, user.id, session_id, body, now)
    if not created:
        response.status_code = status.HTTP_200_OK
    return MessageOut.model_validate(message)


@router.post("/{session_id}/heartbeat", status_code=status.HTTP_204_NO_CONTENT, summary="Add active learning time")
async def heartbeat(session_id: UUID, body: Heartbeat, db: DbSession, user: CurrentUser, now: Now) -> None:
    await sessions.heartbeat(db, user.id, session_id, body.seconds, now)


@router.post(
    "/{session_id}/attempts",
    status_code=status.HTTP_201_CREATED,
    summary="Record an activity attempt",
    description="Idempotent on `clientId`. A correct solve counts as practice for the block's concepts.",
)
async def add_attempt(
    session_id: UUID, body: AttemptCreate, response: Response, db: DbSession, user: CurrentUser, now: Now
) -> AttemptOut:
    attempt, created = await sessions.add_attempt(db, user.id, session_id, body, now)
    if not created:
        response.status_code = status.HTTP_200_OK
    return attempt


@router.post("/{session_id}/finish", summary="End a session and queue its recap")
async def finish_session(session_id: UUID, db: DbSession, user: CurrentUser, now: Now) -> SessionDetail:
    return await sessions.detail(db, await sessions.finish(db, user.id, session_id, now))


@router.post("/{session_id}/recap", status_code=status.HTTP_202_ACCEPTED, summary="Regenerate the recap")
async def regenerate_recap(session_id: UUID, db: DbSession, user: CurrentUser, now: Now) -> RecapOut:
    return await sessions.regenerate_recap(db, user.id, session_id, now)
