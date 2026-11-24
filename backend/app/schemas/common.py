from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class ApiModel(BaseModel):
    """JSON is camelCase (matching `lib/data/types.ts`); Python stays snake_case."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        validate_by_name=True,
        validate_by_alias=True,
        serialize_by_alias=True,
        from_attributes=True,
    )


class Page[T](ApiModel):
    items: list[T]
    next_cursor: str | None = None


class Image(ApiModel):
    src: str
    alt: str
