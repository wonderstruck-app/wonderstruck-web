from collections.abc import Mapping
from http import HTTPStatus
from typing import Any

import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.exceptions import HTTPException as StarletteHTTPException

log = structlog.get_logger("app.errors")


class ErrorBody(BaseModel):
    code: str
    message: str
    request_id: str | None = None
    details: Any | None = None


class ErrorResponse(BaseModel):
    """Every non-2xx JSON response from /api/v1 has this shape."""

    error: ErrorBody


class AppError(Exception):
    """Raise for expected, client-facing failures with a stable machine-readable `code`."""

    def __init__(self, status_code: int, code: str, message: str, details: Any | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details


def _respond(
    request: Request,
    status_code: int,
    code: str,
    message: str,
    details: Any | None = None,
    headers: Mapping[str, str] | None = None,
) -> JSONResponse:
    body = ErrorResponse(
        error=ErrorBody(
            code=code, message=message, request_id=getattr(request.state, "request_id", None), details=details
        )
    )
    return JSONResponse(body.model_dump(exclude_none=True), status_code=status_code, headers=headers)


def _code_for(status_code: int) -> str:
    try:
        return HTTPStatus(status_code).phrase.lower().replace(" ", "_").replace("-", "_")
    except ValueError:
        return "error"


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error(request: Request, exc: AppError) -> JSONResponse:
        return _respond(request, exc.status_code, exc.code, exc.message, exc.details)

    @app.exception_handler(StarletteHTTPException)
    async def _http_error(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        message = exc.detail if isinstance(exc.detail, str) else HTTPStatus(exc.status_code).phrase
        return _respond(request, exc.status_code, _code_for(exc.status_code), message, headers=exc.headers)

    @app.exception_handler(RequestValidationError)
    async def _validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        details = [{"loc": list(e["loc"]), "msg": e["msg"], "type": e["type"]} for e in exc.errors()]
        return _respond(request, 422, "validation_error", "The request was not valid.", details)

    @app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception) -> JSONResponse:
        log.exception("unhandled_error", path=request.url.path)
        return _respond(request, 500, "internal_error", "Something went wrong on our side.")
