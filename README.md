# Wonderstruck
## Database

PostgreSQL with pgvector. `prisma/schema.prisma` defines every table (Better Auth and learning data),
and Prisma owns all migrations. The FastAPI service in `backend/` reads the same tables without
migrating them.

```bash
npm run db:generate   # regenerate the client into lib/generated/prisma (also runs on install)
npm run db:migrate    # create and apply a migration in development
npm run db:deploy     # apply pending migrations in production
```

Set `DATABASE_URL` in `.env` first. On Azure Database for PostgreSQL, allow-list `VECTOR` in the
`azure.extensions` server parameter before the first migration.

## Authentication

Better Auth (`lib/auth.ts`) with Google sign-in, stored through the Prisma adapter. `proxy.ts`
is deny-by-default: every page except `/`, `/login`, `/terms` and `/privacy` needs a valid session (checked through the
signed cookie cache), otherwise it redirects to `/login?next=<path>` and returns there after sign-in.
API routes are excluded because Better Auth and FastAPI check auth themselves. Register
`<BETTER_AUTH_URL>/api/auth/callback/google` as an authorized redirect URI on the Google OAuth
client for each environment.

## App data

App pages read the FastAPI service from the browser with TanStack Query (`lib/data/queries.ts`), through a
same-origin `/api/v1` rewrite in `next.config.ts`, so the session cookie travels with every call. Results are
cached (fresh for 60s, kept for 30 min), so revisiting a page is instant; mutations (recall reviews, saving)
invalidate the queries they affect. Server code (metadata, the learner header) uses `lib/data/api.ts`.
Run it alongside `next dev`, and point `API_URL` in `.env` at it (default `http://localhost:8000`):

```bash
npm run api                                                       # FastAPI on :8000
npm run db:seed -- --email you@example.com --reset                # demo data for that learner
```

Set `NEXT_PUBLIC_WONDERSTRUCK_DATA=mock` to render the in-memory fixtures instead, with no API or database.
