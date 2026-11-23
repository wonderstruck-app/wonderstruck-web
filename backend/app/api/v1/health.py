import asyncio
from typing import Literal

import structlog
from fastapi import APIRouter, Request, Response
from pydantic import BaseModel

from app.api.deps import SettingsDep
from app.db.session import ping

router = APIRouter(prefix="/health", tags=["health"])
log = structlog.get_logger("app.health")

CheckStatus = Literal["ok", "fail", "skipped"]


class Liveness(BaseModel):
    status: Literal["ok"] = "ok"
    service: str
    version: str
    environment: str


class Readiness(BaseModel):
    status: Literal["ok", "fail"]
    checks: dict[str, CheckStatus]


@router.get("", response_model=Liveness, summary="Liveness: the process is up")
async def liveness(request: Request, settings: SettingsDep) -> Liveness:
    return Liveness(service=settings.app_name, version=request.app.version, environment=settings.environment)


@router.get(
    "/ready",
    response_model=Readiness,
    responses={503: {"model": Readiness}},
    summary="Readiness: dependencies are reachable",
)
async def readiness(request: Request, response: Response) -> Readiness:
    checks: dict[str, CheckStatus] = {}

    engine = getattr(request.app.state, "engine", None)
    if engine is None:
        checks["database"] = "skipped"
    else:
        try:
            await asyncio.wait_for(ping(engine), timeout=3)
            checks["database"] = "ok"
        except Exception as exc:
            log.warning("readiness_database_failed", error=type(exc).__name__)
            checks["database"] = "fail"

    ok = all(v != "fail" for v in checks.values())
    if not ok:
        response.status_code = 503
    return Readiness(status="ok" if ok else "fail", checks=checks)
