from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession, Now
from app.schemas.knowledge import LearningGraph
from app.services import knowledge

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("", summary="The learner's concept graph, laid out")
async def read_graph(db: DbSession, user: CurrentUser, now: Now) -> LearningGraph:
    return await knowledge.graph(db, user.id, now)
