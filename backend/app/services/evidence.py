"""The evidence ladder: discussed → practiced → demonstrated.

Every claim about what a learner knows is backed by a `concept_evidence` row. `user_concept`
and `session_concept` hold the strongest state reached; Postgres compares enum values in
declaration order, so `GREATEST()` keeps the strongest without a read-modify-write race.
"""

from datetime import datetime
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models import ConceptEvidence, SessionConcept, UserConcept
from app.models.base import uuid7
from app.models.enums import ConceptState, EvidenceKind, EvidenceSource


async def record(
    db: AsyncSession,
    *,
    user_id: str,
    concept_ids: list[UUID],
    kind: EvidenceKind,
    source: EvidenceSource,
    source_id: UUID,
    session_id: UUID | None,
    now: datetime,
    note: str | None = None,
) -> None:
    """Idempotent: replaying the same (concept, source, source_id, kind) is a no-op."""
    if not concept_ids:
        return
    await db.exec(
        insert(ConceptEvidence)
        .values(
            [
                {
                    "id": uuid7(),
                    "user_id": user_id,
                    "concept_id": cid,
                    "session_id": session_id,
                    "kind": kind,
                    "source": source,
                    "source_id": source_id,
                    "note": note,
                    "created_at": now,
                }
                for cid in concept_ids
            ]
        )
        .on_conflict_do_nothing(index_elements=["concept_id", "source", "source_id", "kind"])
    )
    if kind is EvidenceKind.missed:
        return

    state = ConceptState(kind.value)
    uc = insert(UserConcept).values(
        [
            {"user_id": user_id, "concept_id": cid, "state": state, "first_seen_at": now, "last_evidence_at": now}
            for cid in concept_ids
        ]
    )
    await db.exec(
        uc.on_conflict_do_update(
            index_elements=["user_id", "concept_id"],
            set_={"state": func.greatest(UserConcept.__table__.c.state, uc.excluded.state), "last_evidence_at": now},  # type: ignore[attr-defined]
        )
    )
    if session_id is not None:
        sc = insert(SessionConcept).values(
            [{"session_id": session_id, "concept_id": cid, "state": state, "created_at": now} for cid in concept_ids]
        )
        await db.exec(
            sc.on_conflict_do_update(
                index_elements=["session_id", "concept_id"],
                set_={"state": func.greatest(SessionConcept.__table__.c.state, sc.excluded.state)},  # type: ignore[attr-defined]
            )
        )
