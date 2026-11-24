import base64
from collections.abc import Sequence
from datetime import datetime
from uuid import UUID

from sqlalchemy.dialects.postgresql import insert
from sqlmodel import and_, col, delete, or_, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.errors import AppError
from app.models import (
    Activity,
    BlockConcept,
    BlockEvent,
    BlockSource,
    Concept,
    LearningBlock,
    SavedBlock,
    Topic,
)
from app.models.enums import BlockEventKind, BlockStatus
from app.schemas.activities import activity_out
from app.schemas.blocks import Block, BlockCard, ConceptRef, SavedBlockOut, Source
from app.schemas.common import Image, Page


def encode_cursor(published_at: datetime, block_id: UUID) -> str:
    return base64.urlsafe_b64encode(f"{published_at.isoformat()}|{block_id}".encode()).decode()


def decode_cursor(cursor: str) -> tuple[datetime, UUID]:
    try:
        stamp, raw_id = base64.urlsafe_b64decode(cursor.encode()).decode().split("|")
        return datetime.fromisoformat(stamp), UUID(raw_id)
    except ValueError as exc:
        raise AppError(400, "invalid_cursor", "That page cursor is not valid.") from exc


def card(block: LearningBlock, topic: Topic, saved: bool) -> BlockCard:
    return BlockCard(
        id=block.id,
        slug=block.slug,
        topic=topic.name,
        topic_slug=topic.slug,
        question=block.question,
        teaser=block.teaser,
        minutes=block.minutes,
        image=Image(src=block.image_src, alt=block.image_alt),
        saved=saved,
        published_at=block.published_at,
    )


async def saved_ids(db: AsyncSession, user_id: str, block_ids: Sequence[UUID]) -> set[UUID]:
    if not block_ids:
        return set()
    rows = await db.exec(
        select(SavedBlock.block_id).where(SavedBlock.user_id == user_id, col(SavedBlock.block_id).in_(block_ids))
    )
    return set(rows.all())


async def list_cards(
    db: AsyncSession, user_id: str, *, limit: int, cursor: str | None, topic: str | None
) -> Page[BlockCard]:
    query = (
        select(LearningBlock, Topic)
        .join(Topic, col(Topic.id) == LearningBlock.topic_id)
        .where(LearningBlock.status == BlockStatus.published, col(LearningBlock.published_at).is_not(None))
        .order_by(col(LearningBlock.published_at).desc(), col(LearningBlock.id).desc())
        .limit(limit + 1)
    )
    if topic:
        query = query.where(Topic.slug == topic)
    if cursor:
        at, last_id = decode_cursor(cursor)
        query = query.where(
            or_(
                col(LearningBlock.published_at) < at,
                and_(col(LearningBlock.published_at) == at, col(LearningBlock.id) < last_id),
            )
        )
    rows = list((await db.exec(query)).all())
    page, more = rows[:limit], len(rows) > limit
    saved = await saved_ids(db, user_id, [b.id for b, _ in page])
    last = page[-1][0] if page else None
    return Page(
        items=[card(b, t, b.id in saved) for b, t in page],
        next_cursor=encode_cursor(last.published_at, last.id) if more and last and last.published_at else None,
    )


async def get_published(db: AsyncSession, slug: str) -> tuple[LearningBlock, Topic]:
    row = (
        await db.exec(
            select(LearningBlock, Topic)
            .join(Topic, col(Topic.id) == LearningBlock.topic_id)
            .where(LearningBlock.slug == slug, LearningBlock.status == BlockStatus.published)
        )
    ).first()
    if row is None:
        raise AppError(404, "block_not_found", "That learning block does not exist.")
    return row


async def block_concepts(db: AsyncSession, block_ids: Sequence[UUID]) -> dict[UUID, list[Concept]]:
    out: dict[UUID, list[Concept]] = {bid: [] for bid in block_ids}
    if not block_ids:
        return out
    rows = await db.exec(
        select(BlockConcept.block_id, Concept)
        .join(Concept, col(Concept.id) == BlockConcept.concept_id)
        .where(col(BlockConcept.block_id).in_(block_ids))
        .order_by(col(BlockConcept.position), col(Concept.label))
    )
    for block_id, concept in rows.all():
        out[block_id].append(concept)
    return out


async def detail(db: AsyncSession, user_id: str, slug: str) -> Block:
    block, topic = await get_published(db, slug)
    sources = (
        await db.exec(select(BlockSource).where(BlockSource.block_id == block.id).order_by(col(BlockSource.position)))
    ).all()
    activity = (
        await db.exec(
            select(Activity)
            .where(Activity.block_id == block.id, col(Activity.session_id).is_(None))
            .order_by(col(Activity.created_at))
        )
    ).first()
    concepts = (await block_concepts(db, [block.id]))[block.id]
    saved = block.id in await saved_ids(db, user_id, [block.id])
    return Block(
        **card(block, topic, saved).model_dump(),
        body=block.body or [],
        sources=[Source(title=s.title, publisher=s.publisher, url=s.url) for s in sources],
        activity=activity_out(activity) if activity else None,
        concepts=[ConceptRef(id=c.id, slug=c.slug, label=c.label) for c in concepts],
    )


async def save(db: AsyncSession, user_id: str, slug: str, now: datetime) -> None:
    block, _ = await get_published(db, slug)
    result = await db.exec(
        insert(SavedBlock)
        .values(user_id=user_id, block_id=block.id, created_at=now)
        .on_conflict_do_nothing(index_elements=["user_id", "block_id"])
    )
    if result.rowcount:
        db.add(BlockEvent(user_id=user_id, block_id=block.id, kind=BlockEventKind.save, created_at=now))
    await db.commit()


async def unsave(db: AsyncSession, user_id: str, slug: str, now: datetime) -> None:
    block, _ = await get_published(db, slug)
    result = await db.exec(
        delete(SavedBlock).where(col(SavedBlock.user_id) == user_id, col(SavedBlock.block_id) == block.id)
    )
    if result.rowcount:
        db.add(BlockEvent(user_id=user_id, block_id=block.id, kind=BlockEventKind.unsave, created_at=now))
    await db.commit()


async def list_saved(db: AsyncSession, user_id: str) -> list[SavedBlockOut]:
    rows = await db.exec(
        select(SavedBlock, LearningBlock, Topic)
        .join(LearningBlock, col(LearningBlock.id) == SavedBlock.block_id)
        .join(Topic, col(Topic.id) == LearningBlock.topic_id)
        .where(SavedBlock.user_id == user_id, LearningBlock.status == BlockStatus.published)
        .order_by(col(SavedBlock.created_at).desc())
    )
    return [SavedBlockOut(block=card(b, t, True), saved_at=s.created_at) for s, b, t in rows.all()]


async def record_event(db: AsyncSession, user_id: str, slug: str, kind: BlockEventKind, now: datetime) -> None:
    if kind in (BlockEventKind.save, BlockEventKind.unsave):
        raise AppError(422, "use_save_endpoint", "Save and unsave through PUT/DELETE /blocks/{slug}/save.")
    block, _ = await get_published(db, slug)
    db.add(BlockEvent(user_id=user_id, block_id=block.id, kind=kind, created_at=now))
    await db.commit()
