from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession, Now
from app.schemas.knowledge import Me, WeeklyStats
from app.services import knowledge

router = APIRouter(prefix="/me", tags=["me"])


@router.get("", summary="The signed-in learner")
async def read_me(user: CurrentUser) -> Me:
    return Me.model_validate(user)


@router.get("/weekly", summary="Sessions and concepts from the last 7 days")
async def read_weekly(db: DbSession, user: CurrentUser, now: Now) -> WeeklyStats:
    return await knowledge.weekly(db, user.id, now)
