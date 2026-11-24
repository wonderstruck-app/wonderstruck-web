from collections import defaultdict
from collections.abc import Sequence
from datetime import datetime
from uuid import UUID

from sqlalchemy.dialects.postgresql import insert
from sqlmodel import col, func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.errors import AppError
from app.models import (
    Activity,
    ActivityAttempt,
    Concept,
    Job,
    LearningBlock,
    LearningSession,
    Recap,
    SessionConcept,
    SessionMessage,
    Topic,
)
from app.models.base import uuid7
from app.models.enums import (
    AttemptOutcome,
    BlockStatus,
    EvidenceKind,
    EvidenceSource,
    MessageRole,
    RecapStatus,
    SessionStatus,
)
from app.schemas.activities import activity_out
from app.schemas.common import Image
from app.schemas.sessions import (
    AttemptCreate,
    AttemptOut,
    KeyIdea,
    MessageCreate,
    MessageOut,
    RecapOut,
    SessionConceptOut,
    SessionCreate,
    SessionDetail,
    SessionSummary,
)
from app.services import evidence
from app.services.blocks import block_concepts

RECAP_JOB = "recap.generate"
OPEN_SESSION_TITLE = "Ask Mira anything"


async def get_owned(db: AsyncSession, user_id: str, session_id: UUID, *, lock: bool = False) -> LearningSession:
    query = select(LearningSession).where(LearningSession.id == session_id, LearningSession.user_id == user_id)
    if lock:
        query = query.with_for_update()
    session = (await db.exec(query)).first()
    if session is None:
        raise AppError(404, "session_not_found", "That session does not exist.")
    return session


def _require_active(session: LearningSession) -> None:
    if session.status is not SessionStatus.active:
        raise AppError(409, "session_ended", "This session has ended. Start a new one to keep exploring.")


async def summaries(db: AsyncSession, sessions: Sequence[LearningSession]) -> list[SessionSummary]:
    if not sessions:
        return []
    session_ids = [s.id for s in sessions]
    block_ids = list({s.block_id for s in sessions if s.block_id})

    blocks: dict[UUID, tuple[LearningBlock, Topic]] = {}
    if block_ids:
        for block, topic in (
            await db.exec(
                select(LearningBlock, Topic)
                .join(Topic, col(Topic.id) == LearningBlock.topic_id)
                .where(col(LearningBlock.id).in_(block_ids))
            )
        ).all():
            blocks[block.id] = (block, topic)
    taught = await block_concepts(db, block_ids)

    touched: dict[UUID, list[tuple[SessionConcept, Concept]]] = defaultdict(list)
    for sc, concept in (
        await db.exec(
            select(SessionConcept, Concept)
            .join(Concept, col(Concept.id) == SessionConcept.concept_id)
            .where(col(SessionConcept.session_id).in_(session_ids))
            .order_by(col(SessionConcept.created_at), col(Concept.label))
        )
    ).all():
        touched[sc.session_id].append((sc, concept))

    topic_ids = {c.topic_id for rows in touched.values() for _, c in rows if c.topic_id}
    topic_names: dict[UUID, str] = {}
    if topic_ids:
        topic_names = {t.id: t.name for t in (await db.exec(select(Topic).where(col(Topic.id).in_(topic_ids)))).all()}

    latest: dict[UUID, RecapStatus] = {
        sid: RecapStatus(status)
        for sid, status in (
            await db.exec(
                select(Recap.session_id, Recap.status)
                .where(col(Recap.session_id).in_(session_ids))
                .distinct(col(Recap.session_id))
                .order_by(col(Recap.session_id), col(Recap.version).desc())
            )
        ).all()
    }

    out: list[SessionSummary] = []
    for s in sessions:
        block_row = blocks.get(s.block_id) if s.block_id else None
        topics: list[str] = [block_row[1].name] if block_row else []
        concepts: list[SessionConceptOut] = []
        seen: set[UUID] = set()
        for sc, concept in touched[s.id]:
            seen.add(concept.id)
            concepts.append(
                SessionConceptOut(concept_id=concept.id, slug=concept.slug, name=concept.label, state=sc.state)
            )
            name = topic_names.get(concept.topic_id) if concept.topic_id else None
            if name and name not in topics:
                topics.append(name)
        for concept in taught.get(s.block_id, []) if s.block_id else []:
            if concept.id not in seen:
                concepts.append(
                    SessionConceptOut(concept_id=concept.id, slug=concept.slug, name=concept.label, state="next")
                )
        out.append(
            SessionSummary(
                id=s.id,
                block_id=s.block_id,
                block_slug=block_row[0].slug if block_row else None,
                title=s.title,
                topics=topics,
                status=s.status,
                started_at=s.started_at,
                last_activity_at=s.last_activity_at,
                ended_at=s.ended_at,
                minutes=max(round(s.active_seconds / 60), 1) if s.active_seconds else 0,
                message_count=s.message_count,
                image=Image(src=block_row[0].image_src, alt=block_row[0].image_alt) if block_row else None,
                concepts=concepts,
                recap_status=latest.get(s.id, "none"),
            )
        )
    return out


def _recap_out(recap: Recap) -> RecapOut:
    return RecapOut(
        version=recap.version,
        status=recap.status,
        summary=recap.summary,
        key_ideas=[KeyIdea.model_validate(k) for k in recap.key_ideas or []],
        open_questions=recap.open_questions or [],
        next_steps=recap.next_steps or [],
        created_at=recap.created_at,
        completed_at=recap.completed_at,
    )


async def detail(db: AsyncSession, session: LearningSession) -> SessionDetail:
    (summary,) = await summaries(db, [session])
    recap = (
        await db.exec(
            select(Recap)
            .where(Recap.session_id == session.id, Recap.status == RecapStatus.ready)
            .order_by(col(Recap.version).desc())
        )
    ).first()
    messages = (
        await db.exec(
            select(SessionMessage).where(SessionMessage.session_id == session.id).order_by(col(SessionMessage.seq))
        )
    ).all()
    attempts = (
        await db.exec(
            select(ActivityAttempt, Activity.title)
            .join(Activity, col(Activity.id) == ActivityAttempt.activity_id)
            .where(ActivityAttempt.session_id == session.id)
            .order_by(col(ActivityAttempt.created_at))
        )
    ).all()
    activities = await _session_activities(db, session)
    return SessionDetail(
        **summary.model_dump(),
        recap=_recap_out(recap) if recap else None,
        transcript=[MessageOut.model_validate(m) for m in messages],
        attempts=[
            AttemptOut(
                id=a.id,
                activity_id=a.activity_id,
                title=title,
                outcome=a.outcome,
                correct=a.correct,
                note=a.note,
                created_at=a.created_at,
            )
            for a, title in attempts
        ],
        activities=[activity_out(a) for a in activities],
    )


async def _session_activities(db: AsyncSession, session: LearningSession) -> Sequence[Activity]:
    """The block's authored activity plus anything Mira generated during this session."""
    owner = col(Activity.session_id) == session.id
    if session.block_id:
        owner = owner | ((col(Activity.block_id) == session.block_id) & col(Activity.session_id).is_(None))
    return (await db.exec(select(Activity).where(owner).order_by(col(Activity.created_at)))).all()


async def list_summaries(db: AsyncSession, user_id: str, *, limit: int) -> list[SessionSummary]:
    sessions = (
        await db.exec(
            select(LearningSession)
            .where(LearningSession.user_id == user_id)
            .order_by(col(LearningSession.last_activity_at).desc())
            .limit(limit)
        )
    ).all()
    return await summaries(db, sessions)


async def latest_for_block(db: AsyncSession, user_id: str, block_id: UUID) -> LearningSession | None:
    return (
        await db.exec(
            select(LearningSession)
            .where(LearningSession.user_id == user_id, LearningSession.block_id == block_id)
            .order_by(col(LearningSession.last_activity_at).desc())
        )
    ).first()


async def start(db: AsyncSession, user_id: str, body: SessionCreate, now: datetime) -> tuple[LearningSession, bool]:
    """Returns (session, created). Re-entering a block resumes its active session."""
    block: LearningBlock | None = None
    if body.block_slug:
        block = (
            await db.exec(
                select(LearningBlock).where(
                    LearningBlock.slug == body.block_slug, LearningBlock.status == BlockStatus.published
                )
            )
        ).first()
        if block is None:
            raise AppError(404, "block_not_found", "That learning block does not exist.")
        active = (
            await db.exec(
                select(LearningSession)
                .where(
                    LearningSession.user_id == user_id,
                    LearningSession.block_id == block.id,
                    LearningSession.status == SessionStatus.active,
                )
                .order_by(col(LearningSession.last_activity_at).desc())
            )
        ).first()
        if active is not None:
            return active, False

    session = LearningSession(
        user_id=user_id,
        block_id=block.id if block else None,
        title=body.title or (block.question if block else OPEN_SESSION_TITLE),
        started_at=now,
        last_activity_at=now,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session, True


async def add_message(
    db: AsyncSession, user_id: str, session_id: UUID, body: MessageCreate, now: datetime
) -> tuple[SessionMessage, bool]:
    """Idempotent on `clientId`. The row lock serialises `seq` across concurrent writers."""
    session = await get_owned(db, user_id, session_id, lock=True)
    existing = (
        await db.exec(
            select(SessionMessage).where(
                SessionMessage.session_id == session.id, SessionMessage.client_id == body.client_id
            )
        )
    ).first()
    if existing is not None:
        await db.commit()  # Only releases the row lock; a rollback would expire the loaded rows.
        return existing, False
    _require_active(session)

    last_seq = (
        await db.exec(
            select(func.coalesce(func.max(SessionMessage.seq), 0)).where(SessionMessage.session_id == session.id)
        )
    ).one()
    message = SessionMessage(
        session_id=session.id,
        seq=last_seq + 1,
        role=body.role,
        via=body.via,
        text=body.text,
        client_id=body.client_id,
        interrupted=body.interrupted,
        created_at=now,
    )
    db.add(message)
    session.message_count += 1
    session.last_activity_at = now
    if body.role is MessageRole.learner and session.message_count == 1 and session.block_id is None:
        session.title = body.text[:120]
    await db.commit()
    await db.refresh(message)
    return message, True


async def heartbeat(db: AsyncSession, user_id: str, session_id: UUID, seconds: int, now: datetime) -> None:
    session = await get_owned(db, user_id, session_id, lock=True)
    _require_active(session)
    session.active_seconds += seconds
    session.last_activity_at = now
    await db.commit()


async def add_attempt(
    db: AsyncSession, user_id: str, session_id: UUID, body: AttemptCreate, now: datetime
) -> tuple[AttemptOut, bool]:
    session = await get_owned(db, user_id, session_id)
    activity = next((a for a in await _session_activities(db, session) if a.id == body.activity_id), None)
    if activity is None:
        raise AppError(404, "activity_not_found", "That activity is not part of this session.")

    existing = (
        await db.exec(
            select(ActivityAttempt).where(
                ActivityAttempt.user_id == user_id, ActivityAttempt.client_id == body.client_id
            )
        )
    ).first()
    created = existing is None
    if existing is None:
        _require_active(session)
        existing = ActivityAttempt(
            user_id=user_id,
            activity_id=activity.id,
            session_id=session.id,
            outcome=body.outcome,
            response=body.response,
            correct=body.correct,
            note=body.note,
            client_id=body.client_id,
            created_at=now,
        )
        db.add(existing)
        session.last_activity_at = now
        await db.flush()
        if body.outcome is AttemptOutcome.solved and body.correct:
            block_id = activity.block_id or session.block_id
            concepts = (await block_concepts(db, [block_id]))[block_id] if block_id else []
            await evidence.record(
                db,
                user_id=user_id,
                concept_ids=[c.id for c in concepts],
                kind=EvidenceKind.practiced,
                source=EvidenceSource.activity,
                source_id=existing.id,
                session_id=session.id,
                now=now,
                note=activity.title,
            )
        await db.commit()
        await db.refresh(existing)
    out = AttemptOut(
        id=existing.id,
        activity_id=existing.activity_id,
        title=activity.title,
        outcome=existing.outcome,
        correct=existing.correct,
        note=existing.note,
        created_at=existing.created_at,
    )
    return out, created


async def _enqueue_recap(db: AsyncSession, session: LearningSession, now: datetime) -> Recap:
    version = (
        await db.exec(select(func.coalesce(func.max(Recap.version), 0)).where(Recap.session_id == session.id))
    ).one() + 1
    recap = Recap(session_id=session.id, version=version, created_at=now)
    db.add(recap)
    await db.flush()
    await db.exec(
        insert(Job)
        .values(
            id=uuid7(),
            kind=RECAP_JOB,
            payload={"sessionId": str(session.id), "recapId": str(recap.id), "version": version},
            dedupe_key=f"recap:{session.id}:v{version}",
            run_at=now,
            created_at=now,
            updated_at=now,
        )
        .on_conflict_do_nothing(index_elements=["dedupe_key"])
    )
    return recap


async def finish(db: AsyncSession, user_id: str, session_id: UUID, now: datetime) -> LearningSession:
    """Idempotent: finishing an ended session returns it unchanged."""
    session = await get_owned(db, user_id, session_id, lock=True)
    if session.status is SessionStatus.active:
        session.status = SessionStatus.finished
        session.ended_at = now
        session.last_activity_at = now
        if session.message_count > 0:
            await _enqueue_recap(db, session, now)
        await db.commit()
        await db.refresh(session)
    else:
        await db.commit()  # Already finished: release the lock without expiring `session`.
    return session


async def regenerate_recap(db: AsyncSession, user_id: str, session_id: UUID, now: datetime) -> RecapOut:
    session = await get_owned(db, user_id, session_id, lock=True)
    if session.status is SessionStatus.active:
        raise AppError(409, "session_active", "Finish the session before asking for a recap.")
    if session.message_count == 0:
        raise AppError(409, "session_empty", "There is nothing to recap in this session yet.")
    latest = (
        await db.exec(select(Recap).where(Recap.session_id == session.id).order_by(col(Recap.version).desc()))
    ).first()
    if latest is not None and latest.status is RecapStatus.generating:
        raise AppError(409, "recap_generating", "A recap for this session is already being written.")
    recap = await _enqueue_recap(db, session, now)
    await db.commit()
    await db.refresh(recap)
    return _recap_out(recap)


async def remove(db: AsyncSession, user_id: str, session_id: UUID) -> None:
    session = await get_owned(db, user_id, session_id)
    await db.delete(session)
    await db.commit()
