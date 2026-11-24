from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.models.enums import BlockEventKind
from app.schemas.activities import ActivityOut
from app.schemas.common import ApiModel, Image


class Source(ApiModel):
    title: str
    publisher: str
    url: str


class ConceptRef(ApiModel):
    id: UUID
    slug: str
    label: str


class BlockCard(ApiModel):
    """A Discover feed card. Routes address blocks by `slug`."""

    id: UUID
    slug: str
    topic: str
    topic_slug: str
    question: str
    teaser: str
    minutes: int
    image: Image
    saved: bool
    published_at: datetime | None


class Block(BlockCard):
    body: list[str]
    sources: list[Source]
    activity: ActivityOut | None
    concepts: list[ConceptRef]


class SavedBlockOut(ApiModel):
    block: BlockCard
    saved_at: datetime


class BlockEventIn(ApiModel):
    kind: BlockEventKind = Field(description="`save`/`unsave` are recorded by the save endpoints.")
