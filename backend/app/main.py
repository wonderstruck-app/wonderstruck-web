from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import Settings, get_settings
from app.core.errors import ErrorResponse, register_error_handlers
from app.core.logging import configure_logging
from app.core.middleware import REQUEST_ID_HEADER, RequestContextMiddleware
from app.db.session import create_engine, create_sessionmaker
from app.services import mira

API_PREFIX = "/api/v1"
VERSION = "0.1.0"

log = structlog.get_logger("app")


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        engine = create_engine(settings)
        app.state.engine = engine
        app.state.sessionmaker = create_sessionmaker(engine) if engine else None
        if settings.mira_live_enabled:
            mira.configure_vertex(settings)
            app.state.mira_runner = mira.create_runner(settings)
        log.info(
            "startup",
            environment=settings.environment,
            database=engine is not None,
            mira_live=settings.mira_live_enabled,
        )
        try:
            yield
        finally:
            if engine is not None:
                await engine.dispose()
            log.info("shutdown")

    docs = not settings.is_production
    app = FastAPI(
        title=settings.app_name,
        version=VERSION,
        lifespan=lifespan,
        openapi_url=f"{API_PREFIX}/openapi.json" if docs else None,
        docs_url=f"{API_PREFIX}/docs" if docs else None,
        redoc_url=None,
        responses={422: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    )
    # Starts out empty so an unconfigured app fails closed rather than with AttributeError.
    app.state.engine = None
    app.state.sessionmaker = None
    app.state.mira_runner = None

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=[REQUEST_ID_HEADER],
    )
    # Added last, so outermost: request IDs also cover CORS preflights and error responses.
    app.add_middleware(RequestContextMiddleware)

    # Dependencies must see the settings this app was built with, not a fresh read of the environment.
    app.dependency_overrides[get_settings] = lambda: settings
    register_error_handlers(app)
    app.include_router(api_router, prefix=API_PREFIX)
    return app


app = create_app()
