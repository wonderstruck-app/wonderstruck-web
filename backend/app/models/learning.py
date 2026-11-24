"""Learning sessions with Mira: transcripts and versioned recaps."""

from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import Column, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlmodel import Field, SQLModel

from app.models.base import enum_field, id_field, optional_timestamp, timestamp, updated_at
from app.models.enums import MessageRole, MessageVia, RecapStatus, SessionStatus


class LearningSession(SQLModel, table=True):
    __tablename__ = "learning_session"

    id: UUID = id_field()
    user_id: str = Field(foreign_key="user.id")
    block_id: UUID | None = Field(default=None, foreign_key="learning_block.id")
    title: str
    status: SessionStatus = enum_field(SessionStatus, "session_status", default=SessionStatus.active)
    started_at: datetime = timestamp()
    last_activity_at: datetime = timestamp()
    ended_at: datetime | None = optional_timestamp()
    active_seconds: int = 0
    message_count: int = 0
    created_at: datetime = timestamp()
    updated_at: datetime = updated_at()


class SessionMessage(SQLModel, table=True):
    __tablename__ = "session_message"

    id: UUID = id_field()
    session_id: UUID = Field(foreign_key="learning_session.id")
    seq: int
    role: MessageRole = enum_field(MessageRole, "message_role")
    via: MessageVia = enum_field(MessageVia, "message_via")
    text: str
    client_id: str
    interrupted: bool = False
    created_at: datetime = timestamp()


class Recap(SQLModel, table=True):
    __tablename__ = "recap"

    id: UUID = id_field()
    session_id: UUID = Field(foreign_key="learning_session.id")
    version: int
    status: RecapStatus = enum_field(RecapStatus, "recap_status", default=RecapStatus.generating)
    summary: str | None = None
    key_ideas: list[dict[str, Any]] | None = Field(default=None, sa_column=Column(JSONB, nullable=True))
    open_questions: list[str] = Field(default_factory=list, sa_column=Column(ARRAY(Text), nullable=True))
    next_steps: list[str] = Field(default_factory=list, sa_column=Column(ARRAY(Text), nullable=True))
    model: str | None = None
    error: str | None = None
    created_at: datetime = timestamp()
    completed_at: datetime | None = optional_timestamp()
