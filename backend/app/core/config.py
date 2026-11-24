from functools import lru_cache
from typing import Annotated, Literal
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import Field, PostgresDsn, SecretStr, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

# libpq-only query parameters asyncpg rejects; `sslmode` is renamed to asyncpg's `ssl`.
_LIBPQ_ONLY = {"channel_binding", "gssencmode", "target_session_attrs"}


def _asyncpg_query(url: str) -> str:
    parts = urlsplit(url)
    query = []
    for key, value in parse_qsl(parts.query, keep_blank_values=True):
        if key == "sslmode":
            query.append(("ssl", value))
        elif key not in _LIBPQ_ONLY:
            query.append((key, value))
    return urlunsplit(parts._replace(query=urlencode(query)))


Environment = Literal["local", "test", "staging", "production"]


class Settings(BaseSettings):
    """Process configuration, read from the environment (and `backend/.env` locally)."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Wonderstruck API"
    environment: Environment = "local"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    log_json: bool | None = Field(default=None, description="Defaults to JSON everywhere except local.")

    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:3001"]

    database_url: PostgresDsn | None = None
    database_pool_size: int = 5
    database_max_overflow: int = 5
    database_echo: bool = False

    # Shared with the Next.js app; without it every authenticated route answers 401.
    better_auth_secret: SecretStr | None = None

    # Mira's live voice: Gemini Live through Google ADK on Vertex AI, authenticated with Application
    # Default Credentials (the Cloud Run service account, or `gcloud auth application-default login`).
    # Without a project, the live socket answers `voice_unavailable`.
    google_cloud_project: str | None = None
    # The Live API needs a regional endpoint, not `global`.
    google_cloud_location: str = "us-central1"
    mira_live_model: str = "gemini-3.8-live"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, v: object) -> object:
        if isinstance(v, str):
            return [o.strip().rstrip("/") for o in v.split(",") if o.strip()]
        return v

    @field_validator("database_url", mode="before")
    @classmethod
    def _asyncpg_scheme(cls, v: object) -> object:
        # Accept plain postgres URLs (as Azure and most tooling print them) and pin the async driver.
        if isinstance(v, str):
            if not v.strip():
                return None
            for prefix in ("postgres://", "postgresql://"):
                if v.startswith(prefix):
                    v = "postgresql+asyncpg://" + v.removeprefix(prefix)
            return _asyncpg_query(v)
        return v

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def mira_live_enabled(self) -> bool:
        return bool(self.google_cloud_project)

    @property
    def json_logs(self) -> bool:
        return self.log_json if self.log_json is not None else self.environment != "local"


@lru_cache
def get_settings() -> Settings:
    return Settings()
