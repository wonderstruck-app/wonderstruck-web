"""SQLModel mappings of the tables Prisma creates. FastAPI never creates or migrates tables."""

from app.models.content import (
    Activity,
    ActivityAttempt,
    BlockConcept,
    BlockEvent,
    BlockSource,
    LearningBlock,
    SavedBlock,
    Topic,
)
from app.models.identity import Account, AuthSession, LearnerSettings, User, UserInterest, Verification
from app.models.knowledge import (
    Concept,
    ConceptEdge,
    ConceptEvidence,
    LearnerMemory,
    RecallItem,
    RecallReview,
    SessionConcept,
    UserConcept,
)
from app.models.learning import LearningSession, Recap, SessionMessage
from app.models.ops import AiUsage, Job

__all__ = [
    "Account",
    "Activity",
    "ActivityAttempt",
    "AiUsage",
    "AuthSession",
    "BlockConcept",
    "BlockEvent",
    "BlockSource",
    "Concept",
    "ConceptEdge",
    "ConceptEvidence",
    "Job",
    "LearnerMemory",
    "LearnerSettings",
    "LearningBlock",
    "LearningSession",
    "RecallItem",
    "RecallReview",
    "Recap",
    "SavedBlock",
    "SessionConcept",
    "SessionMessage",
    "Topic",
    "User",
    "UserConcept",
    "UserInterest",
    "Verification",
]
