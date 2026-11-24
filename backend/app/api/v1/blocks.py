from typing import Annotated

from fastapi import APIRouter, Query, status

from app.api.deps import CurrentUser, DbSession, Now
from app.core.errors import AppError
from app.schemas.blocks import Block, BlockCard, BlockEventIn, SavedBlockOut
from app.schemas.common import Page
from app.schemas.sessions import SessionDetail
from app.services import blocks, sessions

router = APIRouter(prefix="/blocks", tags=["blocks"])
saved_router = APIRouter(prefix="/saved", tags=["blocks"])


@router.get("", summary="The Discover feed, newest first")
async def list_blocks(
    db: DbSession,
    user: CurrentUser,
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    cursor: Annotated[str | None, Query(max_length=200)] = None,
    topic: Annotated[str | None, Query(max_length=80, description="Topic slug")] = None,
) -> Page[BlockCard]:
    return await blocks.list_cards(db, user.id, limit=limit, cursor=cursor, topic=topic)


@router.get("/{slug}", summary="A learning block with sources, activity and concepts")
async def read_block(slug: str, db: DbSession, user: CurrentUser) -> Block:
    return await blocks.detail(db, user.id, slug)


@router.put("/{slug}/save", status_code=status.HTTP_204_NO_CONTENT, summary="Save a block")
async def save_block(slug: str, db: DbSession, user: CurrentUser, now: Now) -> None:
    await blocks.save(db, user.id, slug, now)


@router.delete("/{slug}/save", status_code=status.HTTP_204_NO_CONTENT, summary="Unsave a block")
async def unsave_block(slug: str, db: DbSession, user: CurrentUser, now: Now) -> None:
    await blocks.unsave(db, user.id, slug, now)


@router.post("/{slug}/events", status_code=status.HTTP_204_NO_CONTENT, summary="Record a feed interaction")
async def record_block_event(slug: str, body: BlockEventIn, db: DbSession, user: CurrentUser, now: Now) -> None:
    await blocks.record_event(db, user.id, slug, body.kind, now)


@router.get("/{slug}/session", summary="The learner's latest session for this block")
async def read_block_session(slug: str, db: DbSession, user: CurrentUser) -> SessionDetail:
    block, _ = await blocks.get_published(db, slug)
    session = await sessions.latest_for_block(db, user.id, block.id)
    if session is None:
        raise AppError(404, "session_not_found", "You have not explored this block yet.")
    return await sessions.detail(db, session)


@saved_router.get("", summary="Saved blocks, most recent first")
async def list_saved(db: DbSession, user: CurrentUser) -> list[SavedBlockOut]:
    return await blocks.list_saved(db, user.id)
