"""Verifies Better Auth sessions created by the Next.js app.

Better Auth sets `better-auth.session_token` (`__Secure-` prefixed over HTTPS) to
`encodeURIComponent(token + "." + base64(HMAC-SHA256(secret, token)))`. The token is then looked
up in the `session` table, which Better Auth owns.
"""

import base64
import hashlib
import hmac
from datetime import datetime, timedelta
from urllib.parse import unquote
from uuid import UUID

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


LIVE_TICKET_TTL = timedelta(seconds=60)


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _unb64(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def _live_mac(payload: str, secret: str) -> str:
    return _b64(hmac.new(secret.encode(), b"mira-live|" + payload.encode(), hashlib.sha256).digest())


def sign_live_ticket(user_id: str, session_id: UUID, expires_at: datetime, secret: str) -> str:
    """A short-lived credential for the live socket, which the browser opens straight to the API
    (cross-origin, so the session cookie does not travel with it)."""
    payload = f"{session_id}|{int(expires_at.timestamp())}|{user_id}"
    return f"{_b64(payload.encode())}.{_live_mac(payload, secret)}"


def verify_live_ticket(ticket: str, secret: str, now: datetime) -> tuple[str, UUID] | None:
    """Returns (user id, session id) for a valid, unexpired ticket."""
    encoded, dot, mac = ticket.partition(".")
    try:
        payload = _unb64(encoded).decode()
        session_id, expires, user_id = payload.split("|", 2)
        valid = dot and hmac.compare_digest(_live_mac(payload, secret), mac)
        if not valid or not user_id or int(expires) <= now.timestamp():
            return None
        return user_id, UUID(session_id)
    except ValueError:
        return None


async def user_for_token(db: AsyncSession, token: str, now: datetime) -> User | None:
    stmt = (
        select(User)
        .join(AuthSession, col(AuthSession.user_id) == col(User.id))
        .where(AuthSession.token == token, col(AuthSession.expires_at) > now)
    )
    return (await db.exec(stmt)).first()
