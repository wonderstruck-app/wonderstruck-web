"""FSRS-4.5 spaced repetition with binary grading.

Recall cards are multiple choice, so a review is either *recalled* (graded Good) or *missed*
(graded Again). Weights are the published FSRS-4.5 defaults; intervals target 90% retention,
which in FSRS-4.5 makes the next interval equal to the new stability, in days.
"""

import math
from dataclasses import dataclass
from datetime import datetime, timedelta

from app.models.enums import RecallState, ReviewOutcome

W = (
    0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474,
    0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755,
)  # fmt: skip
DECAY = -0.5
FACTOR = 19 / 81
AGAIN, GOOD = 1, 3
MIN_INTERVAL_DAYS = 1
MAX_INTERVAL_DAYS = 365


@dataclass(frozen=True, slots=True)
class Card:
    state: RecallState
    stability: float
    difficulty: float
    reps: int
    lapses: int
    last_reviewed_at: datetime | None


@dataclass(frozen=True, slots=True)
class Scheduled:
    state: RecallState
    stability: float
    difficulty: float
    reps: int
    lapses: int
    due_at: datetime


def _clamp_difficulty(d: float) -> float:
    return min(max(d, 1.0), 10.0)


def _initial_difficulty(grade: int) -> float:
    return W[4] - (grade - 3) * W[5]


def retrievability(elapsed_days: float, stability: float) -> float:
    return float((1 + FACTOR * elapsed_days / stability) ** DECAY)


def schedule(card: Card, outcome: ReviewOutcome, now: datetime) -> Scheduled:
    grade = GOOD if outcome is ReviewOutcome.recalled else AGAIN
    is_first = card.reps == 0 or card.stability <= 0 or card.last_reviewed_at is None

    if is_first:
        stability = W[grade - 1]
        difficulty = _clamp_difficulty(_initial_difficulty(grade))
    else:
        assert card.last_reviewed_at is not None
        elapsed = max((now - card.last_reviewed_at).total_seconds() / 86_400, 0.0)
        r = retrievability(elapsed, card.stability)
        d, s = card.difficulty, card.stability
        next_d = d - W[6] * (grade - 3)
        difficulty = _clamp_difficulty(W[7] * _initial_difficulty(GOOD) + (1 - W[7]) * next_d)
        if grade == GOOD:
            stability = s * (1 + math.exp(W[8]) * (11 - d) * s ** -W[9] * (math.exp(W[10] * (1 - r)) - 1))
        else:
            stability = W[11] * d ** -W[12] * ((s + 1) ** W[13] - 1) * math.exp(W[14] * (1 - r))
            stability = min(stability, s)

    if grade == GOOD:
        state = RecallState.review
        lapses = card.lapses
    else:
        state = RecallState.relearning if card.state is RecallState.review else RecallState.learning
        lapses = card.lapses + (0 if is_first else 1)

    # A miss comes back tomorrow; the lowered stability takes over from the next success.
    days = MIN_INTERVAL_DAYS if grade == AGAIN else min(max(round(stability), MIN_INTERVAL_DAYS), MAX_INTERVAL_DAYS)
    return Scheduled(
        state=state,
        stability=stability,
        difficulty=difficulty,
        reps=card.reps + 1,
        lapses=lapses,
        due_at=now + timedelta(days=days),
    )
