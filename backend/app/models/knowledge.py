"""Concepts, the learning graph, evidence, active recall and learner memory."""

from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import Column, Float
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

from app.models.base import enum_field, id_field, optional_timestamp, timestamp, updated_at
from app.models.enums import (
    ConceptEdgeKind,
    ConceptState,
    EvidenceKind,
    EvidenceSource,
    MemoryKind,
    RecallState,
    ReviewOutcome,
)


class Concept(SQLModel, table=True):
    """The `embedding vector(1536)` column is deliberately unmapped: similarity search and
    embedding writes go through explicit pgvector SQL, so ordinary reads never ship vectors."""

    __tablename__ = "concept"

    id: UUID = id_field()
    slug: str
    label: str
    summary: str
    topic_id: UUID | None = Field(default=None, foreign_key="topic.id")
    embedding_model: str | None = None
    embedded_at: datetime | None = optional_timestamp()
    created_at: datetime = timestamp()
    updated_at: datetime = updated_at()


class ConceptEdge(SQLModel, table=True):
    """Semantic edges are undirected and stored once with `from_id < to_id` (a DB CHECK enforces it)."""

    __tablename__ = "concept_edge"

    from_id: UUID = Field(primary_key=True, foreign_key="concept.id")
    to_id: UUID = Field(primary_key=True, foreign_key="concept.id")
    kind: ConceptEdgeKind = enum_field(ConceptEdgeKind, "concept_edge_kind", primary_key=True)
    similarity: float | None = Field(default=None, sa_column=Column(Float(precision=24), nullable=True))
    rationale: str
    model: str | None = None
    created_at: datetime = timestamp()


class UserConcept(SQLModel, table=True):
    __tablename__ = "user_concept"

    user_id: str = Field(primary_key=True, foreign_key="user.id")
    concept_id: UUID = Field(primary_key=True, foreign_key="concept.id")
    state: ConceptState = enum_field(ConceptState, "concept_state")
    first_seen_at: datetime = timestamp()
    last_evidence_at: datetime = timestamp()


class SessionConcept(SQLModel, table=True):
    __tablename__ = "session_concept"

    session_id: UUID = Field(primary_key=True, foreign_key="learning_session.id")
    concept_id: UUID = Field(primary_key=True, foreign_key="concept.id")
    state: ConceptState = enum_field(ConceptState, "concept_state")
    created_at: datetime = timestamp()


class ConceptEvidence(SQLModel, table=True):
    __tablename__ = "concept_evidence"

    id: UUID = id_field()
    user_id: str = Field(foreign_key="user.id")
    concept_id: UUID = Field(foreign_key="concept.id")
    session_id: UUID | None = Field(default=None, foreign_key="learning_session.id")
    kind: EvidenceKind = enum_field(EvidenceKind, "evidence_kind")
    source: EvidenceSource = enum_field(EvidenceSource, "evidence_source")
    source_id: UUID
    note: str | None = None
    created_at: datetime = timestamp()


class RecallItem(SQLModel, table=True):
    __tablename__ = "recall_item"

    id: UUID = id_field()
    user_id: str = Field(foreign_key="user.id")
    concept_id: UUID = Field(foreign_key="concept.id")
    session_id: UUID | None = Field(default=None, foreign_key="learning_session.id")
    question: str
    options: list[dict[str, Any]] = Field(sa_column=Column(JSONB, nullable=False))
    correct_option_id: str
    explanation: str
    model: str | None = None
    state: RecallState = enum_field(RecallState, "recall_state", default=RecallState.new)
    due_at: datetime = timestamp()
    stability: float = 0
    difficulty: float = 0
    reps: int = 0
    lapses: int = 0
    last_reviewed_at: datetime | None = optional_timestamp()
    created_at: datetime = timestamp()
    updated_at: datetime = updated_at()


class RecallReview(SQLModel, table=True):
    __tablename__ = "recall_review"

    id: UUID = id_field()
    item_id: UUID = Field(foreign_key="recall_item.id")
    user_id: str = Field(foreign_key="user.id")
    outcome: ReviewOutcome = enum_field(ReviewOutcome, "review_outcome")
    chosen_option_id: str
    response_ms: int | None = None
    previous_due_at: datetime = timestamp()
    next_due_at: datetime = timestamp()
    client_id: str
    reviewed_at: datetime = timestamp()


class LearnerMemory(SQLModel, table=True):
    __tablename__ = "learner_memory"

    id: UUID = id_field()
    user_id: str = Field(foreign_key="user.id")
    kind: MemoryKind = enum_field(MemoryKind, "memory_kind")
    text: str
    evidence: str
    session_id: UUID | None = Field(default=None, foreign_key="learning_session.id")
    concept_id: UUID | None = Field(default=None, foreign_key="concept.id")
    resolved_at: datetime | None = optional_timestamp()
    created_at: datetime = timestamp()
    updated_at: datetime = updated_at()
