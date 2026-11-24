from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.core.errors import AppError
from app.models.base import uuid7
from app.models.enums import RecallState, ReviewOutcome
from app.schemas.activities import validate_spec
from app.services import fsrs
from app.services.blocks import decode_cursor, encode_cursor
from app.services.graph_layout import HEIGHT, MARGIN, WIDTH, layout

NOW = datetime(2026, 11, 24, 9, tzinfo=UTC)
NEW = fsrs.Card(RecallState.new, 0, 0, 0, 0, None)


def test_uuid7_is_version_7_and_time_ordered() -> None:
    a, b = uuid7(), uuid7()
    assert a.version == 7
    assert str(a)[:8] <= str(b)[:8]


def test_fsrs_intervals_grow_with_each_success() -> None:
    card, now, intervals = NEW, NOW, []
    for _ in range(3):
        nxt = fsrs.schedule(card, ReviewOutcome.recalled, now)
        intervals.append((nxt.due_at - now).days)
        card = fsrs.Card(nxt.state, nxt.stability, nxt.difficulty, nxt.reps, nxt.lapses, now)
        now = nxt.due_at
    assert intervals[0] >= 1
    assert intervals == sorted(intervals) and intervals[2] > intervals[0] * 3
    assert card.state is RecallState.review


def test_fsrs_miss_relearns_tomorrow_and_counts_a_lapse() -> None:
    first = fsrs.schedule(NEW, ReviewOutcome.recalled, NOW)
    card = fsrs.Card(first.state, first.stability, first.difficulty, first.reps, first.lapses, NOW)
    later = first.due_at
    missed = fsrs.schedule(card, ReviewOutcome.missed, later)
    assert missed.state is RecallState.relearning
    assert missed.lapses == 1
    assert missed.due_at - later == timedelta(days=1)
    assert missed.stability <= card.stability
    assert missed.difficulty > card.difficulty


def test_fsrs_first_miss_is_learning_not_a_lapse() -> None:
    nxt = fsrs.schedule(NEW, ReviewOutcome.missed, NOW)
    assert (nxt.state, nxt.lapses, nxt.reps) == (RecallState.learning, 0, 1)


def test_layout_is_deterministic_and_inside_the_canvas() -> None:
    keys = [str(uuid4()) for _ in range(9)]
    edges = [(keys[0], keys[1], 0.9), (keys[1], keys[2], 0.6), (keys[3], keys[4], 0.8)]
    groups = {k: ("Space" if i % 2 else "Biology") for i, k in enumerate(keys)}
    first = layout(keys, edges, groups)
    assert first == layout(list(reversed(keys)), edges, groups)
    for x, y in first.values():
        assert MARGIN <= x <= WIDTH - MARGIN
        assert MARGIN <= y <= HEIGHT - MARGIN
    assert len(set(first.values())) == len(keys)


def test_layout_handles_tiny_graphs() -> None:
    assert layout([], []) == {}
    assert layout(["a"], []) == {"a": (WIDTH / 2, HEIGHT / 2)}


def test_activity_spec_answer_must_be_an_option() -> None:
    spec = {"options": [{"id": "a", "label": "A"}, {"id": "b", "label": "B"}], "answerId": "b", "reveal": "B."}
    assert validate_spec("predict", spec)["answerId"] == "b"
    with pytest.raises(ValidationError):
        validate_spec("predict", {**spec, "answerId": "z"})


def test_cursor_round_trips_and_rejects_garbage() -> None:
    block_id = uuid4()
    assert decode_cursor(encode_cursor(NOW, block_id)) == (NOW, block_id)
    with pytest.raises(AppError):
        decode_cursor("not-a-cursor")
