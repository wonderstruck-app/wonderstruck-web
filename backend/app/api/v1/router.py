from typing import Any

from fastapi import APIRouter, Depends

from app.api.deps import get_session_token
from app.api.v1 import blocks, graph, health, me, memory, recall, sessions, settings, topics
from app.core.errors import ErrorResponse

api_router = APIRouter()
api_router.include_router(health.router)

# Everything below needs a Better Auth session. The token is checked first, before a DB connection is taken.
_authed: dict[int | str, dict[str, Any]] = {401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}}
for module_router in (
    me.router,
    topics.router,
    blocks.router,
    blocks.saved_router,
    sessions.router,
    recall.router,
    memory.router,
    graph.router,
    settings.router,
):
    api_router.include_router(module_router, responses=_authed, dependencies=[Depends(get_session_token)])
