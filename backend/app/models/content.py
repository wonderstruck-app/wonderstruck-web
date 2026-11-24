"""Discover content: topics, learning blocks, their sources, concepts, saves and feed events."""

from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import Column, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlmodel import Field, SQLModel

from app.models.base import enum_field, id_field, optional_timestamp, timestamp, updated_at
from app.models.enums import ActivityKind, ActivityOrigin, AttemptOutcome, BlockEventKind, BlockStatus


class Topic(SQLModel, table=True):
    __tablename__ = "topic"

    id: UUID = id_field()
    slug: str
    name: str
    position: int = 0
    created_at: datetime = timestamp()


class LearningBlock(SQLModel, table=True):
    __tablename__ = "learning_block"

    id: UUID = id_field()
    slug: str
    topic_id: UUID = Field(foreign_key="topic.id")
    question: str
    teaser: str
    body: list[str] = Field(default_factory=list, sa_column=Column(ARRAY(Text), nullable=True))
    minutes: int
    image_src: str
    image_alt: str
    status: BlockStatus = enum_field(BlockStatus, "block_status", default=BlockStatus.draft)
    published_at: datetime | None = optional_timestamp()
    created_at: datetime = timestamp()
    updated_at: datetime = updated_at()


class BlockSource(SQLModel, table=True):
    __tablename__ = "block_source"

    id: UUID = id_field()
    block_id: UUID = Field(foreign_key="learning_block.id")
    position: int
    title: str
    publisher: str
    url: str


class BlockConcept(SQLModel, table=True):
    __tablename__ = "block_concept"

    block_id: UUID = Field(primary_key=True, foreign_key="learning_block.id")
    concept_id: UUID = Field(primary_key=True, foreign_key="concept.id")
    position: int = 0


class SavedBlock(SQLModel, table=True):
    __tablename__ = "saved_block"

    user_id: str = Field(primary_key=True, foreign_key="user.id")
    block_id: UUID = Field(primary_key=True, foreign_key="learning_block.id")
    created_at: datetime = timestamp()


class BlockEvent(SQLModel, table=True):
    __tablename__ = "block_event"

    id: UUID = id_field()
    user_id: str = Field(foreign_key="user.id")
    block_id: UUID = Field(foreign_key="learning_block.id")
    kind: BlockEventKind = enum_field(BlockEventKind, "block_event_kind")
    created_at: datetime = timestamp()


class Activity(SQLModel, table=True):
    """`spec` holds the kind-specific fields, validated by `app.schemas.activities` before insert."""

    __tablename__ = "activity"

    id: UUID = id_field()
    kind: ActivityKind = enum_field(ActivityKind, "activity_kind")
    origin: ActivityOrigin = enum_field(ActivityOrigin, "activity_origin")
    title: str
    prompt: str
    spec: dict[str, Any] = Field(sa_column=Column(JSONB, nullable=False))
    block_id: UUID | None = Field(default=None, foreign_key="learning_block.id")
    session_id: UUID | None = Field(default=None, foreign_key="learning_session.id")
    model: str | None = None
    created_at: datetime = timestamp()


class ActivityAttempt(SQLModel, table=True):
    __tablename__ = "activity_attempt"

    id: UUID = id_field()
    user_id: str = Field(foreign_key="user.id")
    activity_id: UUID = Field(foreign_key="activity.id")
    session_id: UUID = Field(foreign_key="learning_session.id")
    outcome: AttemptOutcome = enum_field(AttemptOutcome, "attempt_outcome")
    response: Any = Field(sa_column=Column(JSONB, nullable=False))
    correct: bool | None = None
    note: str | None = None
    client_id: str
    created_at: datetime = timestamp()
