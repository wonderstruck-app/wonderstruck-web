FROM python:3.13-slim AS build
COPY --from=ghcr.io/astral-sh/uv:0.11 /uv /bin/uv
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=never
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY app ./app

FROM python:3.13-slim
RUN useradd --create-home --uid 10001 api
WORKDIR /app
COPY --from=build --chown=api /app /app
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1 ENVIRONMENT=production PORT=8000
USER api
EXPOSE 8000
# Cloud Run injects PORT (8080); exec keeps uvicorn as PID 1 so it receives SIGTERM.
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port \"$PORT\" --proxy-headers --forwarded-allow-ips '*'"]
