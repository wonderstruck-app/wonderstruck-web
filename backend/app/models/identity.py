"""Better Auth tables (owned by the Next.js app) and learner preferences."""

from datetime import datetime
from uuid import UUID

from sqlmodel import Field, SQLModel

from app.models.base import enum_field, optional_timestamp, timestamp, updated_at
from app.models.enums import VoicePace


class User(SQLModel, table=True):
    __tablename__ = "user"

    id: str = Field(primary_key=True)
    name: str
    email: str
    email_verified: bool = False
    image: str | None = None
    created_at: datetime = timestamp()
    updated_at: datetime = updated_at()


class AuthSession(SQLModel, table=True):
    """A Better Auth login session. Read-only here: Better Auth creates, refreshes and revokes them."""

    __tablename__ = "session"

    id: str = Field(primary_key=True)
    token: str
    expires_at: datetime = timestamp()
    ip_address: str | None = None
    user_agent: str | None = None
    user_id: str = Field(foreign_key="user.id")
    created_at: datetime = timestamp()
    updated_at: datetime = updated_at()


class Account(SQLModel, table=True):
    __tablename__ = "account"

    id: str = Field(primary_key=True)
    account_id: str
    provider_id: str
    user_id: str = Field(foreign_key="user.id")
    access_token: str | None = None
    refresh_token: str | None = None
    id_token: str | None = None
    access_token_expires_at: datetime | None = optional_timestamp()
    refresh_token_expires_at: datetime | None = optional_timestamp()
    scope: str | None = None
    password: str | None = None
    created_at: datetime = timestamp()
    updated_at: datetime = updated_at()


class Verification(SQLModel, table=True):
    __tablename__ = "verification"

    id: str = Field(primary_key=True)
    identifier: str
    value: str
    expires_at: datetime = timestamp()
    created_at: datetime = timestamp()
    updated_at: datetime = updated_at()


class LearnerSettings(SQLModel, table=True):
    __tablename__ = "learner_settings"

    user_id: str = Field(primary_key=True, foreign_key="user.id")
    voice_id: str = "mira"
    voice_pace: VoicePace = enum_field(VoicePace, "voice_pace", default=VoicePace.natural)
    interruptible: bool = True
    keep_transcripts: bool = True
    remember_misconceptions: bool = True
    personalize_discover: bool = True
    onboarded_at: datetime | None = optional_timestamp()
    created_at: datetime = timestamp()
    updated_at: datetime = updated_at()


class UserInterest(SQLModel, table=True):
    __tablename__ = "user_interest"

    user_id: str = Field(primary_key=True, foreign_key="user.id")
    topic_id: UUID = Field(primary_key=True, foreign_key="topic.id")
    created_at: datetime = timestamp()
