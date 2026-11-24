from collections.abc import AsyncIterator
from datetime import datetime
from typing import Annotated

from fastapi import Depends, Request
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import Settings, get_settings
from app.core.errors import AppError
from app.db.session import session_scope
from app.models import User
from app.models.base import utcnow
from app.services.auth import SESSION_COOKIES, user_for_token, verify_signed_token

SettingsDep = Annotated[Settings, Depends(get_settings)]


async def get_db(request: Request) -> AsyncIterator[AsyncSession]:
    maker = getattr(request.app.state, "sessionmaker", None)
    if maker is None:
        raise AppError(503, "database_unavailable", "The database is not configured.")
    async for session in session_scope(maker):
        yield session


# `function` scope commits before the response is sent, so a failed commit is never reported as success.
DbSession = Annotated[AsyncSession, Depends(get_db, scope="function")]


def _signed_token(request: Request) -> str | None:
    for name in SESSION_COOKIES:
        if value := request.cookies.get(name):
            return value
    scheme, _, credentials = request.headers.get("authorization", "").partition(" ")
    if scheme.lower() == "bearer" and credentials:
        return credentials.strip()
    return None


def get_session_token(request: Request, settings: SettingsDep) -> str:
    """The verified Better Auth session token. Needs no database, so bad requests fail fast."""
    signed = _signed_token(request)
    secret = settings.better_auth_secret
    token = verify_signed_token(signed, secret.get_secret_value()) if signed and secret else None
    if token is None:
        raise AppError(401, "unauthenticated", "Sign in to continue.")
    return token


SessionToken = Annotated[str, Depends(get_session_token)]


async def get_current_user(token: SessionToken, db: DbSession) -> User:
    """The signed-in learner, from the Better Auth cookie or an `Authorization: Bearer <signed token>`."""
    user = await user_for_token(db, token, utcnow())
    if user is None:
        raise AppError(401, "unauthenticated", "Sign in to continue.")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]

# One timestamp per request keeps every row written by a request consistent; tests can override it.
Now = Annotated[datetime, Depends(utcnow)]
