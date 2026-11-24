from collections import defaultdict
from datetime import datetime, timedelta
from itertools import pairwise
from uuid import UUID

from sqlalchemy.dialects.postgresql import insert
from sqlmodel import col, delete, func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.errors import AppError
from app.models import (
    Concept,
    ConceptEdge,
    ConceptEvidence,
    LearnerMemory,
    LearnerSettings,
    LearningSession,
    RecallItem,
    RecallReview,
    SessionConcept,
    Topic,
    UserConcept,
    UserInterest,
)
from app.models.enums import ConceptEdgeKind, EvidenceKind, EvidenceSource, RecallState, ReviewOutcome
from app.schemas.activities import Choice
from app.schemas.knowledge import (
    GraphConcept,
    GraphLink,
    GraphSession,
    Interest,
    LearningGraph,
    MemoryItemOut,
    PrivacySettings,
    RecallItemOut,
    ReviewCreate,
    ReviewRecord,
    ReviewResult,
    SettingsOut,
    SettingsUpdate,
    VoiceOption,
    VoiceSettings,
    WeeklyStats,
)
from app.services import evidence, fsrs
from app.services.graph_layout import layout

RECENT = timedelta(hours=72)
SESSION_LINK_WEIGHT = 0.6
VOICES = (
    VoiceOption(id="warm", label="Warm", detail="Gentle and unhurried"),
    VoiceOption(id="bright", label="Bright", detail="Lively and upbeat"),
    VoiceOption(id="calm", label="Calm", detail="Low and steady"),
)
DEFAULT_VOICE = VOICES[0].id


# Recall


async def recall_queue(db: AsyncSession, user_id: str, now: datetime, *, limit: int) -> list[RecallItemOut]:
    rows = await db.exec(
        select(RecallItem, Concept, LearningSession.title)
        .join(Concept, col(Concept.id) == RecallItem.concept_id)
        .outerjoin(LearningSession, col(LearningSession.id) == RecallItem.session_id)
        .where(
            RecallItem.user_id == user_id,
            RecallItem.state != RecallState.retired,
            col(RecallItem.due_at) <= now,
        )
        .order_by(col(RecallItem.due_at), col(RecallItem.id))
        .limit(limit)
    )
    return [
        RecallItemOut(
            id=item.id,
            concept_id=concept.id,
            concept_slug=concept.slug,
            concept=concept.label,
            session_id=item.session_id,
            session_title=title,
            question=item.question,
            options=[Choice.model_validate(o) for o in item.options],
            due_at=item.due_at,
        )
        for item, concept, title in rows.all()
    ]


def _result(review: RecallReview, item: RecallItem) -> ReviewResult:
    return ReviewResult(
        id=review.id,
        outcome=review.outcome,
        correct_option_id=item.correct_option_id,
        explanation=item.explanation,
        state=item.state,
        next_due_at=review.next_due_at,
    )


async def review(
    db: AsyncSession, user_id: str, item_id: UUID, body: ReviewCreate, now: datetime
) -> tuple[ReviewResult, bool]:
    """Grades on the server, schedules with FSRS, and records evidence. Idempotent on `clientId`."""
    item = (
        await db.exec(
            select(RecallItem).where(RecallItem.id == item_id, RecallItem.user_id == user_id).with_for_update()
        )
    ).first()
    if item is None:
        raise AppError(404, "recall_item_not_found", "That recall card does not exist.")

    replay = (
        await db.exec(
            select(RecallReview).where(RecallReview.user_id == user_id, RecallReview.client_id == body.client_id)
        )
    ).first()
    if replay is not None:
        await db.commit()  # Only releases the row lock; a rollback would expire the loaded rows.
        return _result(replay, item), False

    if body.chosen_option_id not in {o.get("id") for o in item.options}:
        raise AppError(422, "invalid_option", "That answer is not one of the card's options.")
    if item.state is RecallState.retired:
        raise AppError(409, "recall_item_retired", "That recall card has been retired.")

    outcome = ReviewOutcome.recalled if body.chosen_option_id == item.correct_option_id else ReviewOutcome.missed
    card = fsrs.Card(item.state, item.stability, item.difficulty, item.reps, item.lapses, item.last_reviewed_at)
    nxt = fsrs.schedule(card, outcome, now)
    record = RecallReview(
        item_id=item.id,
        user_id=user_id,
        outcome=outcome,
        chosen_option_id=body.chosen_option_id,
        response_ms=body.response_ms,
        previous_due_at=item.due_at,
        next_due_at=nxt.due_at,
        client_id=body.client_id,
        reviewed_at=now,
    )
    db.add(record)
    item.state, item.stability, item.difficulty = nxt.state, nxt.stability, nxt.difficulty
    item.reps, item.lapses, item.due_at, item.last_reviewed_at = nxt.reps, nxt.lapses, nxt.due_at, now
    await db.flush()
    await evidence.record(
        db,
        user_id=user_id,
        concept_ids=[item.concept_id],
        kind=EvidenceKind.demonstrated if outcome is ReviewOutcome.recalled else EvidenceKind.missed,
        source=EvidenceSource.recall,
        source_id=record.id,
        session_id=item.session_id,
        now=now,
    )
    await db.commit()
    await db.refresh(record)
    await db.refresh(item)
    return _result(record, item), True


async def review_history(db: AsyncSession, user_id: str, *, limit: int) -> list[ReviewRecord]:
    rows = await db.exec(
        select(RecallReview, Concept)
        .join(RecallItem, col(RecallItem.id) == RecallReview.item_id)
        .join(Concept, col(Concept.id) == RecallItem.concept_id)
        .where(RecallReview.user_id == user_id)
        .order_by(col(RecallReview.reviewed_at).desc())
        .limit(limit)
    )
    return [
        ReviewRecord(
            id=r.id,
            item_id=r.item_id,
            concept=c.label,
            concept_slug=c.slug,
            outcome=r.outcome,
            reviewed_at=r.reviewed_at,
            next_due_at=r.next_due_at,
        )
        for r, c in rows.all()
    ]


# Memory


async def memory(db: AsyncSession, user_id: str) -> list[MemoryItemOut]:
    rows = await db.exec(
        select(LearnerMemory)
        .where(LearnerMemory.user_id == user_id, col(LearnerMemory.resolved_at).is_(None))
        .order_by(col(LearnerMemory.created_at).desc())
    )
    return [MemoryItemOut.model_validate(m) for m in rows.all()]


async def forget(db: AsyncSession, user_id: str, memory_id: UUID) -> None:
    result = await db.exec(
        delete(LearnerMemory).where(col(LearnerMemory.id) == memory_id, col(LearnerMemory.user_id) == user_id)
    )
    if not result.rowcount:
        raise AppError(404, "memory_not_found", "That memory does not exist.")
    await db.commit()


# Learning graph


async def graph(db: AsyncSession, user_id: str, now: datetime) -> LearningGraph:
    known = (
        await db.exec(
            select(UserConcept, Concept, Topic.name)
            .join(Concept, col(Concept.id) == UserConcept.concept_id)
            .outerjoin(Topic, col(Topic.id) == Concept.topic_id)
            .where(UserConcept.user_id == user_id)
            .order_by(col(Concept.slug))
        )
    ).all()
    concept_ids = [c.id for _, c, _ in known]

    session_rows = (
        await db.exec(
            select(SessionConcept.concept_id, LearningSession)
            .join(LearningSession, col(LearningSession.id) == SessionConcept.session_id)
            .where(LearningSession.user_id == user_id)
            .order_by(col(LearningSession.started_at), col(SessionConcept.created_at), col(SessionConcept.concept_id))
        )
    ).all()
    sessions: dict[UUID, LearningSession] = {}
    chain: dict[UUID, list[UUID]] = defaultdict(list)
    session_ids_by_concept: dict[UUID, list[UUID]] = defaultdict(list)
    for concept_id, session in session_rows:
        sessions[session.id] = session
        chain[session.id].append(concept_id)
        session_ids_by_concept[concept_id].append(session.id)

    links: list[GraphLink] = []
    linked: set[frozenset[UUID]] = set()
    if concept_ids:
        for edge in (
            await db.exec(
                select(ConceptEdge).where(
                    ConceptEdge.kind == ConceptEdgeKind.semantic,
                    col(ConceptEdge.from_id).in_(concept_ids),
                    col(ConceptEdge.to_id).in_(concept_ids),
                )
            )
        ).all():
            linked.add(frozenset((edge.from_id, edge.to_id)))
            links.append(
                GraphLink(
                    from_=edge.from_id,
                    to=edge.to_id,
                    kind="semantic",
                    similarity=edge.similarity,
                    rationale=edge.rationale,
                )
            )
    for session_id, ids in chain.items():
        for a, b in pairwise(ids):
            pair = frozenset((a, b))
            if a == b or pair in linked:
                continue
            linked.add(pair)
            links.append(
                GraphLink(
                    from_=a, to=b, kind="session", rationale=f"Explored together in “{sessions[session_id].title}”"
                )
            )

    positions = layout(
        [str(cid) for cid in concept_ids],
        [
            (str(link.from_), str(link.to), link.similarity if link.similarity is not None else SESSION_LINK_WEIGHT)
            for link in links
        ],
        {str(c.id): topic for _, c, topic in known},
    )
    return LearningGraph(
        concepts=[
            GraphConcept(
                id=c.id,
                slug=c.slug,
                label=c.label,
                topic=topic,
                summary=c.summary,
                state=uc.state,
                session_ids=session_ids_by_concept.get(c.id, []),
                x=positions[str(c.id)][0],
                y=positions[str(c.id)][1],
                recent=now - uc.last_evidence_at <= RECENT,
            )
            for uc, c, topic in known
        ],
        links=links,
        sessions=[GraphSession(id=s.id, title=s.title) for s in sessions.values()],
    )


async def weekly(db: AsyncSession, user_id: str, now: datetime) -> WeeklyStats:
    since = now - timedelta(days=7)
    session_count = (
        await db.exec(
            select(func.count())
            .select_from(LearningSession)
            .where(LearningSession.user_id == user_id, col(LearningSession.started_at) >= since)
        )
    ).one()
    concept_count = (
        await db.exec(
            select(func.count(func.distinct(ConceptEvidence.concept_id))).where(
                ConceptEvidence.user_id == user_id,
                ConceptEvidence.kind != EvidenceKind.missed,
                col(ConceptEvidence.created_at) >= since,
            )
        )
    ).one()
    return WeeklyStats(sessions=session_count, concepts=concept_count)


# Settings


async def _settings_row(db: AsyncSession, user_id: str, now: datetime, *, lock: bool = False) -> LearnerSettings:
    # Prisma fills timestamps client-side, so the raw insert has to supply them.
    await db.exec(
        insert(LearnerSettings)
        .values(user_id=user_id, created_at=now, updated_at=now)
        .on_conflict_do_nothing(index_elements=["user_id"])
    )
    query = select(LearnerSettings).where(LearnerSettings.user_id == user_id)
    row = (await db.exec(query.with_for_update() if lock else query)).one()
    return row


async def settings(db: AsyncSession, user_id: str, now: datetime) -> SettingsOut:
    row = await _settings_row(db, user_id, now)
    await db.commit()
    topics = (await db.exec(select(Topic).order_by(col(Topic.position), col(Topic.name)))).all()
    selected = set((await db.exec(select(UserInterest.topic_id).where(UserInterest.user_id == user_id))).all())
    return SettingsOut(
        interests=[Interest(id=t.id, slug=t.slug, name=t.name, selected=t.id in selected) for t in topics],
        voice=VoiceSettings(
            voice_id=row.voice_id if row.voice_id in {v.id for v in VOICES} else DEFAULT_VOICE,
            voices=list(VOICES),
            pace=row.voice_pace,
            interruptible=row.interruptible,
        ),
        privacy=PrivacySettings(
            keep_transcripts=row.keep_transcripts,
            remember_misconceptions=row.remember_misconceptions,
            personalize_discover=row.personalize_discover,
        ),
        onboarded_at=row.onboarded_at,
    )


async def update_settings(db: AsyncSession, user_id: str, body: SettingsUpdate, now: datetime) -> SettingsOut:
    if body.voice_id is not None and body.voice_id not in {v.id for v in VOICES}:
        raise AppError(422, "unknown_voice", "That voice is not available.")
    row = await _settings_row(db, user_id, now, lock=True)
    if body.voice_id is not None:
        row.voice_id = body.voice_id
    if body.pace is not None:
        row.voice_pace = body.pace
    for name in ("interruptible", "keep_transcripts", "remember_misconceptions", "personalize_discover"):
        value = getattr(body, name)
        if value is not None:
            setattr(row, name, value)
    if body.onboarded is not None:
        row.onboarded_at = (row.onboarded_at or now) if body.onboarded else None

    if body.interests is not None:
        slugs = set(body.interests)
        topics = (await db.exec(select(Topic).where(col(Topic.slug).in_(slugs)))).all() if slugs else []
        unknown = slugs - {t.slug for t in topics}
        if unknown:
            raise AppError(422, "unknown_topic", "Some interests are not topics.", details={"slugs": sorted(unknown)})
        await db.exec(delete(UserInterest).where(col(UserInterest.user_id) == user_id))
        for topic in topics:
            db.add(UserInterest(user_id=user_id, topic_id=topic.id, created_at=now))
    await db.commit()
    return await settings(db, user_id, now)
