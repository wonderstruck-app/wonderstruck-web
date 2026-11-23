from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.errors import AppError
from app.db.session import session_scope

SettingsDep = Annotated[Settings, Depends(get_settings)]


async def get_db(request: Request) -> AsyncIterator[AsyncSession]:
    maker = getattr(request.app.state, "sessionmaker", None)
    if maker is None:
        raise AppError(503, "database_unavailable", "The database is not configured.")
    async for session in session_scope(maker):
        yield session


DbSession = Annotated[AsyncSession, Depends(get_db)]
