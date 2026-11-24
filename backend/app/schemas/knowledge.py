from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import Field

from app.models.enums import ConceptState, MemoryKind, RecallState, ReviewOutcome, VoicePace
from app.schemas.activities import Choice
from app.schemas.common import ApiModel


class RecallItemOut(ApiModel):
    """A due card. The answer stays on the server until the learner commits to one."""

    id: UUID
    concept_id: UUID
    concept_slug: str
    concept: str
    session_id: UUID | None
    session_title: str | None
    question: str
    options: list[Choice]
    due_at: datetime


class ReviewCreate(ApiModel):
    chosen_option_id: str = Field(min_length=1, max_length=40)
    client_id: str = Field(min_length=1, max_length=100, description="Idempotency key.")
    response_ms: int | None = Field(default=None, ge=0, le=3_600_000)


class ReviewResult(ApiModel):
    id: UUID
    outcome: ReviewOutcome
    correct_option_id: str
    explanation: str
    state: RecallState
    next_due_at: datetime


class ReviewRecord(ApiModel):
    id: UUID
    item_id: UUID
    concept: str
    concept_slug: str
    outcome: ReviewOutcome
    reviewed_at: datetime
    next_due_at: datetime


class MemoryItemOut(ApiModel):
    id: UUID
    kind: MemoryKind
    text: str
    evidence: str
    created_at: datetime


class GraphConcept(ApiModel):
    id: UUID
    slug: str
    label: str
    topic: str | None
    summary: str
    state: ConceptState
    session_ids: list[UUID]
    x: float = Field(description="Layout position inside a 1000 x 620 canvas.")
    y: float
    recent: bool


class GraphLink(ApiModel):
    from_: UUID = Field(alias="from")
    to: UUID
    kind: Literal["semantic", "session"]
    similarity: float | None = None
    rationale: str


class GraphSession(ApiModel):
    id: UUID
    title: str


class LearningGraph(ApiModel):
    concepts: list[GraphConcept]
    links: list[GraphLink]
    sessions: list[GraphSession]


class TopicOut(ApiModel):
    id: UUID
    slug: str
    name: str


class Interest(TopicOut):
    selected: bool


class VoiceOption(ApiModel):
    id: str
    label: str
    detail: str


class VoiceSettings(ApiModel):
    voice_id: str
    voices: list[VoiceOption]
    pace: VoicePace
    interruptible: bool


class PrivacySettings(ApiModel):
    keep_transcripts: bool
    remember_misconceptions: bool
    personalize_discover: bool


class SettingsOut(ApiModel):
    interests: list[Interest]
    voice: VoiceSettings
    privacy: PrivacySettings
    onboarded_at: datetime | None


class SettingsUpdate(ApiModel):
    """Partial update: only the fields sent are changed."""

    interests: list[str] | None = Field(default=None, max_length=50, description="Selected topic slugs.")
    voice_id: str | None = None
    pace: VoicePace | None = None
    interruptible: bool | None = None
    keep_transcripts: bool | None = None
    remember_misconceptions: bool | None = None
    personalize_discover: bool | None = None
    onboarded: bool | None = Field(default=None, description="`true` marks onboarding as complete.")


class Me(ApiModel):
    id: str
    name: str
    email: str
    image: str | None
    created_at: datetime


class WeeklyStats(ApiModel):
    sessions: int = Field(description="Sessions started in the last 7 days.")
    concepts: int = Field(description="Distinct concepts with new evidence in the last 7 days.")
