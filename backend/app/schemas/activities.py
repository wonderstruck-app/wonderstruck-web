"""Interactive activities. `Activity.spec` stores everything except id/kind/title/prompt, in camelCase."""

from typing import Annotated, Any, Literal
from uuid import UUID

from pydantic import Field, TypeAdapter, model_validator

from app.models import Activity
from app.schemas.common import ApiModel


class Choice(ApiModel):
    id: str = Field(min_length=1, max_length=40)
    label: str = Field(min_length=1, max_length=300)


class PredictSpec(ApiModel):
    options: list[Choice] = Field(min_length=2, max_length=6)
    answer_id: str
    reveal: str

    @model_validator(mode="after")
    def _answer_is_an_option(self) -> "PredictSpec":
        if self.answer_id not in {o.id for o in self.options}:
            raise ValueError("answerId must match one of the options")
        return self


class OrderSpec(ApiModel):
    items: list[Choice] = Field(min_length=2, max_length=8, description="In their correct order.")
    reveal: str


class SimulateParam(ApiModel):
    label: str
    unit: str
    min: float
    max: float
    step: float = Field(gt=0)
    initial: float


class SimulateBand(ApiModel):
    up_to: float
    label: str
    detail: str
    swatch: str


class SimulateSpec(ApiModel):
    param: SimulateParam
    bands: list[SimulateBand] = Field(min_length=1, description="Ordered by `upTo`.")


class _ActivityBase(ApiModel):
    id: UUID
    title: str
    prompt: str


class PredictActivity(_ActivityBase, PredictSpec):
    kind: Literal["predict"]


class OrderActivity(_ActivityBase, OrderSpec):
    kind: Literal["order"]


class SimulateActivity(_ActivityBase, SimulateSpec):
    kind: Literal["simulate"]


ActivityOut = Annotated[PredictActivity | OrderActivity | SimulateActivity, Field(discriminator="kind")]

_activity_adapter: TypeAdapter[PredictActivity | OrderActivity | SimulateActivity] = TypeAdapter(ActivityOut)
_SPECS: dict[str, type[ApiModel]] = {"predict": PredictSpec, "order": OrderSpec, "simulate": SimulateSpec}


def validate_spec(kind: str, spec: dict[str, Any]) -> dict[str, Any]:
    """Validates a spec before insert and returns its canonical camelCase JSON."""
    return _SPECS[kind].model_validate(spec).model_dump(mode="json")


def activity_out(activity: Activity) -> PredictActivity | OrderActivity | SimulateActivity:
    return _activity_adapter.validate_python(
        {
            **activity.spec,
            "id": activity.id,
            "kind": activity.kind.value,
            "title": activity.title,
            "prompt": activity.prompt,
        }
    )
