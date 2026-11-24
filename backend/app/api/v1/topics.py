from fastapi import APIRouter
from sqlmodel import col, select

from app.api.deps import CurrentUser, DbSession
from app.models import Topic
from app.schemas.knowledge import TopicOut

router = APIRouter(prefix="/topics", tags=["topics"])


@router.get("", summary="All topics, in display order")
async def list_topics(db: DbSession, _user: CurrentUser) -> list[TopicOut]:
    rows = await db.exec(select(Topic).order_by(col(Topic.position), col(Topic.name)))
    return [TopicOut.model_validate(t) for t in rows.all()]
