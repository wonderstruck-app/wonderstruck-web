"""Verifies Better Auth sessions created by the Next.js app.

Better Auth sets `better-auth.session_token` (`__Secure-` prefixed over HTTPS) to
`encodeURIComponent(token + "." + base64(HMAC-SHA256(secret, token)))`. The token is then looked
up in the `session` table, which Better Auth owns.
"""

import base64
import hashlib
import hmac
from datetime import datetime
from urllib.parse import unquote

from sqlmodel import col, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models import AuthSession, User

SESSION_COOKIES = ("__Secure-better-auth.session_token", "better-auth.session_token")


def sign_token(token: str, secret: str) -> str:
    digest = hmac.new(secret.encode(), token.encode(), hashlib.sha256).digest()
    return f"{token}.{base64.b64encode(digest).decode()}"


def verify_signed_token(value: str, secret: str) -> str | None:
    """Returns the session token when the signature is valid, otherwise None."""
    token, dot, _ = unquote(value).rpartition(".")
    if not dot or not token:
        return None
    return token if hmac.compare_digest(sign_token(token, secret), unquote(value)) else None


async def user_for_token(db: AsyncSession, token: str, now: datetime) -> User | None:
    stmt = (
        select(User)
        .join(AuthSession, col(AuthSession.user_id) == col(User.id))
        .where(AuthSession.token == token, col(AuthSession.expires_at) > now)
    )
    return (await db.exec(stmt)).first()
