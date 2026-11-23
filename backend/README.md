# Wonderstruck API

FastAPI service behind `/api/v1`. It owns learning data, authorization and AI orchestration. Better Auth stays in Next.js; this service will validate its sessions.

## Run locally

Requires [uv](https://docs.astral.sh/uv/). uv installs Python 3.13 itself if needed.

```bash
cd backend
cp .env.example .env          # optional; every setting has a local default
uv sync
uv run fastapi dev app/main.py --port 8000
```

- Liveness: `GET /api/v1/health`
- Readiness: `GET /api/v1/health/ready` (503 if a configured database is unreachable; reports `skipped` when `DATABASE_URL` is empty)
- Interactive docs: `/api/v1/docs` (disabled in production). The OpenAPI schema at `/api/v1/openapi.json` is the source for typed frontend clients.

## Checks

```bash
uv run ruff check . && uv run ruff format --check .
uv run mypy app tests
uv run pytest
```

## Layout

```
app/
  main.py            app factory, lifespan (DB engine), middleware, routers
  core/config.py     typed settings from env / .env
  core/logging.py    structlog: console locally, JSON elsewhere
  core/middleware.py request IDs (x-request-id) + one access log line per request
  core/errors.py     one error envelope: {"error": {code, message, request_id, details?}}
  db/session.py      async SQLAlchemy engine and per-request session (commit/rollback)
  api/deps.py        shared dependencies (SettingsDep, DbSession)
  api/v1/            versioned routes
tests/               pytest (async), runs without a database
```

Conventions:

- Raise `AppError(status, code, message)` for expected failures. Clients branch on `code`, never on `message`.
- Inject the database with `db: DbSession`. Without `DATABASE_URL` it fails closed with `503 database_unavailable`.
- Never log secrets or request bodies. The request ID is bound to every log line automatically.

## Container

```bash
docker build -t wonderstruck-api backend
docker run -p 8000:8000 --env-file backend/.env wonderstruck-api
```

Runs as a non-root user with `ENVIRONMENT=production` (JSON logs, no docs).
