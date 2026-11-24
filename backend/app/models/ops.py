"""Operational tables: the AI usage ledger and the durable job queue."""

from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import Column, Numeric
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

from app.models.base import enum_field, id_field, optional_timestamp, timestamp, updated_at
from app.models.enums import AiTask, JobStatus


class AiUsage(SQLModel, table=True):
    __tablename__ = "ai_usage"

    id: UUID = id_field()
    user_id: str | None = Field(default=None, foreign_key="user.id")
    session_id: UUID | None = Field(default=None, foreign_key="learning_session.id")
    task: AiTask = enum_field(AiTask, "ai_task")
    provider: str
    model: str
    input_tokens: int = 0
    output_tokens: int = 0
    audio_seconds: float = 0
    cost_usd: Decimal = Field(default=Decimal(0), sa_column=Column(Numeric(12, 6), nullable=False))
    created_at: datetime = timestamp()


class Job(SQLModel, table=True):
    __tablename__ = "job"

    id: UUID = id_field()
    kind: str
    payload: dict[str, Any] = Field(sa_column=Column(JSONB, nullable=False))
    status: JobStatus = enum_field(JobStatus, "job_status", default=JobStatus.queued)
    dedupe_key: str | None = None
    attempts: int = 0
    max_attempts: int = 5
    run_at: datetime = timestamp()
    locked_at: datetime | None = optional_timestamp()
    locked_by: str | None = None
    last_error: str | None = None
    created_at: datetime = timestamp()
    updated_at: datetime = updated_at()
