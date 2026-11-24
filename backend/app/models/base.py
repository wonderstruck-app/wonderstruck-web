"""Column helpers shared by every table model.

Prisma owns the schema and generates UUIDv7 ids and `updatedAt` values client-side, so the
database has no defaults for them: these helpers fill them in from Python instead.
"""

import os
import time
from datetime import UTC, datetime
from enum import StrEnum
from typing import Any
from uuid import UUID

from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import ENUM
from sqlmodel import Field


def uuid7() -> UUID:
    """RFC 9562 UUIDv7: 48-bit Unix milliseconds, then random bits. Sorts by creation time."""
    ms = time.time_ns() // 1_000_000
    rand = int.from_bytes(os.urandom(10))
    value = (ms & (2**48 - 1)) << 80 | 0x7 << 76 | ((rand >> 62) & 0xFFF) << 64 | 0b10 << 62 | (rand & (2**62 - 1))
    return UUID(int=value)


def utcnow() -> datetime:
    return datetime.now(UTC)


def id_field() -> Any:
    return Field(default_factory=uuid7, primary_key=True)


def timestamp(*, primary_key: bool = False) -> Any:
    """A NOT NULL timestamptz that defaults to now."""
    return Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False, primary_key=primary_key),
    )


def updated_at() -> Any:
    """Prisma's `@updatedAt`: set on insert and refreshed by SQLAlchemy on every UPDATE."""
    return Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False, onupdate=utcnow),
    )


def optional_timestamp() -> Any:
    return Field(default=None, sa_column=Column(DateTime(timezone=True), nullable=True))


def pg_enum[E: StrEnum](enum: type[E], name: str) -> ENUM:
    """Maps an existing Postgres enum type (created by Prisma) by value, never creating it."""
    return ENUM(enum, name=name, create_type=False, values_callable=lambda e: [m.value for m in e])


def enum_field[E: StrEnum](
    enum: type[E], name: str, *, default: E | None = None, nullable: bool = False, primary_key: bool = False
) -> Any:
    column: Column[Any] = Column(pg_enum(enum, name), nullable=nullable, primary_key=primary_key)
    if default is None and not nullable:
        return Field(sa_column=column)
    return Field(default=default, sa_column=column)
