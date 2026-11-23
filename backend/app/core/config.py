from functools import lru_cache
from typing import Annotated, Literal

from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

Environment = Literal["local", "test", "staging", "production"]


class Settings(BaseSettings):
    """Process configuration, read from the environment (and `backend/.env` locally)."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Wonderstruck API"
    environment: Environment = "local"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    log_json: bool | None = Field(default=None, description="Defaults to JSON everywhere except local.")

    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:3000", "http://localhost:3001"]

    database_url: PostgresDsn | None = None
    database_pool_size: int = 5
    database_max_overflow: int = 5
    database_echo: bool = False

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
                    return "postgresql+asyncpg://" + v.removeprefix(prefix)
        return v

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def json_logs(self) -> bool:
        return self.log_json if self.log_json is not None else self.environment != "local"


@lru_cache
def get_settings() -> Settings:
    return Settings()
