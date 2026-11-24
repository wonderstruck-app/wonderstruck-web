from uuid import UUID

from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.knowledge import MemoryItemOut
from app.services import knowledge

router = APIRouter(prefix="/memory", tags=["memory"])


@router.get("", summary="What Mira remembers about the learner")
async def list_memory(db: DbSession, user: CurrentUser) -> list[MemoryItemOut]:
    return await knowledge.memory(db, user.id)


@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Forget a memory")
async def forget_memory(memory_id: UUID, db: DbSession, user: CurrentUser) -> None:
    await knowledge.forget(db, user.id, memory_id)
