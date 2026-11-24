from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import Field, JsonValue

from app.models.enums import AttemptOutcome, ConceptState, MessageRole, MessageVia, RecapStatus, SessionStatus
from app.schemas.activities import ActivityOut
from app.schemas.common import ApiModel, Image


class SessionConceptOut(ApiModel):
    concept_id: UUID
    slug: str
    name: str
    state: ConceptState | Literal["next"] = Field(description="`next`: taught by the block, not reached yet.")


class SessionSummary(ApiModel):
    id: UUID
    block_id: UUID | None
    block_slug: str | None
    title: str
    topics: list[str]
    status: SessionStatus
    started_at: datetime
    last_activity_at: datetime
    ended_at: datetime | None
    minutes: int
    message_count: int
    image: Image | None
    concepts: list[SessionConceptOut]
    recap_status: RecapStatus | Literal["none"]


class MessageOut(ApiModel):
    id: UUID
    seq: int
    role: MessageRole
    via: MessageVia
    text: str
    interrupted: bool
    created_at: datetime


class KeyIdea(ApiModel):
    title: str
    text: str


class RecapOut(ApiModel):
    version: int
    status: RecapStatus
    summary: str | None
    key_ideas: list[KeyIdea]
    open_questions: list[str]
    next_steps: list[str]
    created_at: datetime
    completed_at: datetime | None


class AttemptOut(ApiModel):
    id: UUID
    activity_id: UUID
    title: str
    outcome: AttemptOutcome
    correct: bool | None
    note: str | None
    created_at: datetime


class SessionDetail(SessionSummary):
    recap: RecapOut | None = Field(description="The newest ready recap, even while a newer one generates.")
    transcript: list[MessageOut]
    attempts: list[AttemptOut]
    activities: list[ActivityOut]


class SessionCreate(ApiModel):
    block_slug: str | None = Field(default=None, description="Omit for an open “Ask Mira anything” session.")
    title: str | None = Field(default=None, max_length=200)


class MessageCreate(ApiModel):
    client_id: str = Field(min_length=1, max_length=100, description="Idempotency key.")
    role: MessageRole
    via: MessageVia
    text: str = Field(min_length=1, max_length=8000)
    interrupted: bool = False


class Heartbeat(ApiModel):
    seconds: int = Field(ge=1, le=300, description="Active seconds since the previous heartbeat.")


class AttemptCreate(ApiModel):
    activity_id: UUID
    client_id: str = Field(min_length=1, max_length=100, description="Idempotency key.")
    outcome: AttemptOutcome
    response: JsonValue
    correct: bool | None = None
    note: str | None = Field(default=None, max_length=500)
