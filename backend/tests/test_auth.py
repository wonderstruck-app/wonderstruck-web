from urllib.parse import quote

import pytest
from httpx import AsyncClient
from pydantic import SecretStr

from app.core.config import Settings
from app.services.auth import sign_token, verify_signed_token

SECRET = "test-secret"  # noqa: S105


@pytest.fixture
def settings() -> Settings:
    return Settings(_env_file=None, environment="test", database_url=None, better_auth_secret=SecretStr(SECRET))


def test_verifies_better_auth_cookie_value() -> None:
    cookie = quote(sign_token("tok_123", SECRET), safe="")
    assert verify_signed_token(cookie, SECRET) == "tok_123"


@pytest.mark.parametrize(
    "value",
    ["tok_123", "tok_123.", ".sig", sign_token("tok_123", "other-secret"), sign_token("tok_123", SECRET) + "x"],
)
def test_rejects_unsigned_or_forged_tokens(value: str) -> None:
    assert verify_signed_token(value, SECRET) is None


@pytest.mark.parametrize("path", ["/api/v1/me", "/api/v1/blocks", "/api/v1/sessions", "/api/v1/graph"])
async def test_requires_a_session_before_touching_the_database(client: AsyncClient, path: str) -> None:
    r = await client.get(path)
    assert r.status_code == 401
    assert r.json()["error"]["code"] == "unauthenticated"


async def test_forged_cookie_is_rejected(client: AsyncClient) -> None:
    forged = sign_token("tok_123", "other-secret")
    client.cookies.set("better-auth.session_token", forged)
    r = await client.get("/api/v1/me")
    assert r.status_code == 401


async def test_valid_signature_reaches_the_session_lookup(client: AsyncClient) -> None:
    # No database in tests: a correctly signed token gets past auth and fails on the lookup instead.
    r = await client.get("/api/v1/me", headers={"authorization": f"Bearer {sign_token('tok_123', SECRET)}"})
    assert r.status_code == 503
