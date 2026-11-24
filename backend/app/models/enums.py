"""Python mirrors of the Postgres enum types in prisma/schema.prisma."""

from enum import StrEnum


class VoicePace(StrEnum):
    relaxed = "relaxed"
    natural = "natural"
    brisk = "brisk"


class BlockStatus(StrEnum):
    draft = "draft"
    published = "published"
    retired = "retired"


class BlockEventKind(StrEnum):
    impression = "impression"
    open = "open"
    read = "read"
    save = "save"
    unsave = "unsave"
    dismiss = "dismiss"
    explore = "explore"


class ActivityKind(StrEnum):
    predict = "predict"
    order = "order"
    simulate = "simulate"


class ActivityOrigin(StrEnum):
    authored = "authored"
    generated = "generated"


class AttemptOutcome(StrEnum):
    solved = "solved"
    retried = "retried"
    skipped = "skipped"


class SessionStatus(StrEnum):
    active = "active"
    finished = "finished"
    abandoned = "abandoned"


class MessageRole(StrEnum):
    mira = "mira"
    learner = "learner"


class MessageVia(StrEnum):
    voice = "voice"
    text = "text"


class RecapStatus(StrEnum):
    generating = "generating"
    ready = "ready"
    failed = "failed"


class ConceptEdgeKind(StrEnum):
    semantic = "semantic"
    prerequisite = "prerequisite"


class ConceptState(StrEnum):
    discussed = "discussed"
    practiced = "practiced"
    demonstrated = "demonstrated"


class EvidenceKind(StrEnum):
    discussed = "discussed"
    practiced = "practiced"
    demonstrated = "demonstrated"
    missed = "missed"


class EvidenceSource(StrEnum):
    message = "message"
    activity = "activity"
    recall = "recall"


class RecallState(StrEnum):
    new = "new"
    learning = "learning"
    review = "review"
    relearning = "relearning"
    retired = "retired"


class ReviewOutcome(StrEnum):
    recalled = "recalled"
    missed = "missed"


class MemoryKind(StrEnum):
    interest = "interest"
    misconception = "misconception"
    preference = "preference"


class AiTask(StrEnum):
    live_tutor = "live_tutor"
    text_tutor = "text_tutor"
    recap = "recap"
    recall_generation = "recall_generation"
    activity_generation = "activity_generation"
    concept_extraction = "concept_extraction"
    embedding = "embedding"


class JobStatus(StrEnum):
    queued = "queued"
    running = "running"
    succeeded = "succeeded"
    failed = "failed"
    dead = "dead"
