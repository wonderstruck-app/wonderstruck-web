from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession, Now
from app.schemas.knowledge import SettingsOut, SettingsUpdate
from app.services import knowledge

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", summary="Interests, voice and privacy")
async def read_settings(db: DbSession, user: CurrentUser, now: Now) -> SettingsOut:
    return await knowledge.settings(db, user.id, now)


@router.patch("", summary="Update settings; only the fields sent change")
async def update_settings(body: SettingsUpdate, db: DbSession, user: CurrentUser, now: Now) -> SettingsOut:
    return await knowledge.update_settings(db, user.id, body, now)
