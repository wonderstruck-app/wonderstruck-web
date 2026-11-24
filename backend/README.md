# Wonderstruck API

FastAPI service behind `/api/v1`. It owns learning data, authorization and AI orchestration. Better Auth stays in Next.js; this service validates its session cookie.

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
  api/deps.py        shared dependencies (SettingsDep, DbSession, CurrentUser, Now)
  api/v1/            versioned routes, thin: parse, call a service, return a schema
  models/            SQLModel tables mirroring prisma/schema.prisma
  schemas/           request/response models (camelCase over the wire)
  services/          business logic: blocks, sessions, knowledge, evidence, FSRS, graph layout
tests/               pytest (async), runs without a database
```

Conventions:

- Raise `AppError(status, code, message)` for expected failures. Clients branch on `code`, never on `message`.
- Inject the database with `db: DbSession`. Without `DATABASE_URL` it fails closed with `503 database_unavailable`.
- Never log secrets or request bodies. The request ID is bound to every log line automatically.

## Auth

Every route except health needs the Better Auth cookie (`better-auth.session_token`, or the
`__Secure-` variant over HTTPS, or the same signed value as a `Bearer` token). `CurrentUser` checks its HMAC with `BETTER_AUTH_SECRET`, which must
match the Next.js app, then loads the unexpired `session` row. Anything else is `401 unauthorized`.

## Endpoints

All under `/api/v1`; the full contract is in `/api/v1/docs`.

| Area | Routes |
|---|---|
| Learner | `GET /me`, `GET /me/weekly` |
| Discover | `GET /topics`, `GET /blocks?topic=&cursor=&limit=`, `GET /blocks/{slug}`, `PUT`/`DELETE /blocks/{slug}/save`, `GET /saved`, `POST /blocks/{slug}/events`, `GET /blocks/{slug}/session` |
| Sessions | `GET`/`POST /sessions`, `GET`/`DELETE /sessions/{id}`, `POST /sessions/{id}/messages`, `/attempts`, `/heartbeat`, `/finish`, `/recap` |
| Recall | `GET /recall/queue`, `GET /recall/history`, `POST /recall/{id}/reviews` |
| Knowledge | `GET /graph`, `GET /memory`, `DELETE /memory/{id}`, `GET`/`PATCH /settings` |

Writes that a client may retry (messages, attempts, reviews) take a `clientId`: the first call returns
`201`, a replay returns `200` with the original result. Recall answers are graded and scheduled (FSRS)
on the server. Finishing a session queues a recap job; no worker consumes it yet, so recaps stay
`generating`.

## Database

The schema lives in `prisma/schema.prisma` at the repo root, and Prisma owns every migration
(`npm run db:migrate`, `npm run db:deploy`). This service maps the same tables with SQLAlchemy and
never creates or alters them, so there is no Alembic. Prisma fills `id` (uuid7) and `updatedAt`
client-side, so raw inserts here must supply them.

Demo data comes from `prisma/seed.ts`, which reuses the UI fixtures. Sign in once so your user exists, then:

```bash
npm run db:seed -- --email you@example.com          # skips if you already have learning data
npm run db:seed -- --email you@example.com --reset  # wipes your learning data and reseeds
```

## Container

```bash
docker build -t wonderstruck-api backend
docker run -p 8000:8000 --env-file backend/.env wonderstruck-api
```

Runs as a non-root user with `ENVIRONMENT=production` (JSON logs, no docs).
