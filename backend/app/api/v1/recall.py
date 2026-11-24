from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, Response, status

from app.api.deps import CurrentUser, DbSession, Now
from app.schemas.knowledge import RecallItemOut, ReviewCreate, ReviewRecord, ReviewResult
from app.services import knowledge

router = APIRouter(prefix="/recall", tags=["recall"])


@router.get("/queue", summary="Cards due now, oldest first")
async def recall_queue(
    db: DbSession, user: CurrentUser, now: Now, limit: Annotated[int, Query(ge=1, le=50)] = 20
) -> list[RecallItemOut]:
    return await knowledge.recall_queue(db, user.id, now, limit=limit)


@router.get("/history", summary="Recent reviews")
async def review_history(
    db: DbSession, user: CurrentUser, limit: Annotated[int, Query(ge=1, le=100)] = 30
) -> list[ReviewRecord]:
    return await knowledge.review_history(db, user.id, limit=limit)


@router.post(
    "/{item_id}/reviews",
    status_code=status.HTTP_201_CREATED,
    summary="Answer a recall card",
    description="Graded on the server and scheduled with FSRS. Idempotent on `clientId`.",
)
async def review(
    item_id: UUID, body: ReviewCreate, response: Response, db: DbSession, user: CurrentUser, now: Now
) -> ReviewResult:
    result, created = await knowledge.review(db, user.id, item_id, body, now)
    if not created:
        response.status_code = status.HTTP_200_OK
    return result
