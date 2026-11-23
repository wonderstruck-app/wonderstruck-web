from fastapi import APIRouter
from httpx import ASGITransport, AsyncClient

from app.core.config import Settings
from app.core.errors import AppError
from app.main import create_app


async def test_liveness(client: AsyncClient) -> None:
    r = await client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


async def test_readiness_skips_unconfigured_database(client: AsyncClient) -> None:
    r = await client.get("/api/v1/health/ready")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "checks": {"database": "skipped"}}


async def test_readiness_fails_when_database_unreachable() -> None:
    settings = Settings(_env_file=None, environment="test", database_url="postgres://u:p@127.0.0.1:1/x")
    app = create_app(settings)
    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.get("/api/v1/health/ready")
    assert r.status_code == 503
    assert r.json()["checks"]["database"] == "fail"


async def test_request_id_is_echoed_or_generated(client: AsyncClient) -> None:
    r = await client.get("/api/v1/health", headers={"x-request-id": "abc-123"})
    assert r.headers["x-request-id"] == "abc-123"

    r = await client.get("/api/v1/health", headers={"x-request-id": "bad id\nwith newline"})
    assert r.headers["x-request-id"] != "bad id\nwith newline"
    assert len(r.headers["x-request-id"]) == 32


async def test_errors_use_one_envelope(client: AsyncClient) -> None:
    r = await client.get("/api/v1/nope", headers={"x-request-id": "req-1"})
    assert r.status_code == 404
    assert r.json() == {"error": {"code": "not_found", "message": "Not Found", "request_id": "req-1"}}


async def test_app_error_and_unhandled_error_envelopes(settings: Settings) -> None:
    app = create_app(settings)
    router = APIRouter()

    @router.get("/boom")
    async def boom() -> None:
        raise RuntimeError("secret detail")

    @router.get("/gone")
    async def gone() -> None:
        raise AppError(410, "block_retired", "This block is no longer available.")

    app.include_router(router)
    transport = ASGITransport(app=app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        r = await c.get("/boom")
        assert r.status_code == 500
        assert r.json()["error"]["code"] == "internal_error"
        assert "secret" not in r.text

        r = await c.get("/gone")
        assert r.status_code == 410
        assert r.json()["error"]["code"] == "block_retired"


async def test_database_dependency_fails_closed_without_database(client: AsyncClient) -> None:
    # Fails closed with 503 rather than leaking an AttributeError when no database is configured.
    from app.api.deps import DbSession

    app = create_app(Settings(_env_file=None, environment="test"))
    router = APIRouter()

    @router.get("/needs-db")
    async def needs_db(db: DbSession) -> dict[str, bool]:
        return {"ok": True}

    app.include_router(router)
    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.get("/needs-db")
    assert r.status_code == 503
    assert r.json()["error"]["code"] == "database_unavailable"


def test_settings_normalise_inputs() -> None:
    s = Settings(
        _env_file=None,
        cors_origins="http://a.test/, http://b.test",
        database_url="postgresql://u:p@db.example:5432/ws?ssl=require",
    )
    assert s.cors_origins == ["http://a.test", "http://b.test"]
    assert str(s.database_url).startswith("postgresql+asyncpg://")
    assert Settings(_env_file=None, database_url="").database_url is None
