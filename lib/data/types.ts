// Domain types shared by every data source (mock today, the FastAPI client later).
// UI components depend on these types only, never on a concrete source.

export type Topic =
  | "Space"
  | "Biology"
  | "History"
  | "Physics"
  | "Psychology";

export type ImageAsset = { src: string; alt: string };

export type Source = { title: string; publisher: string; url: string };

export type Choice = { id: string; label: string };

export type Activity =
  | {
      kind: "predict";
      title: string;
      prompt: string;
      options: Choice[];
      answerId: string;
      reveal: string;
    }
  | {
      kind: "order";
      title: string;
      prompt: string;
      /** Items in their correct order; the UI presents them shuffled. */
      items: Choice[];
      reveal: string;
    }
  | {
      kind: "simulate";
      title: string;
      prompt: string;
      param: {
        label: string;
        unit: string;
        min: number;
        max: number;
        step: number;
        initial: number;
      };
      /** Ordered by `upTo`; the first band whose `upTo` >= value applies. */
      bands: { upTo: number; label: string; detail: string; swatch: string }[];
    };

export type LearningBlock = {
  id: string;
  topic: Topic;
  question: string;
  teaser: string;
  body: string[];
  minutes: number;
  sources: Source[];
  image: ImageAsset;
  activity?: Activity;
};

export type Learner = { name: string; initials: string; email: string };

/** Evidence ladder. Exposure alone never becomes "demonstrated". */
export type ConceptState = "discussed" | "practiced" | "demonstrated" | "next";

export type SessionConcept = {
  conceptId: string;
  name: string;
  state: ConceptState;
};

export type RecapStatus = "none" | "generating" | "ready" | "failed";

export type Message = {
  id: string;
  role: "mira" | "learner";
  text: string;
  via: "voice" | "text";
};

export type Recap = {
  summary: string;
  keyIdeas: { title: string; text: string }[];
  openQuestions: string[];
  nextSteps: string[];
  generatedLabel: string;
  version: number;
};

export type ActivityAttempt = {
  title: string;
  outcome: "solved" | "retried" | "skipped";
  note: string;
};

export type SessionSummary = {
  id: string;
  blockId: string;
  title: string;
  topics: string[];
  status: "active" | "finished";
  whenLabel: string;
  period: "this-week" | "earlier";
  minutes: number;
  messageCount: number;
  image: ImageAsset;
  concepts: SessionConcept[];
  recapStatus: RecapStatus;
};

export type LearningSession = SessionSummary & {
  recap?: Recap;
  transcript: Message[];
  attempts: ActivityAttempt[];
};

export type RecallItem = {
  id: string;
  conceptId: string;
  concept: string;
  sessionId: string;
  sessionTitle: string;
  question: string;
  options: Choice[];
  correctId: string;
  explanation: string;
};

export type ReviewRecord = {
  id: string;
  concept: string;
  outcome: "recalled" | "missed";
  whenLabel: string;
  nextLabel: string;
};

export type MemoryItem = {
  id: string;
  kind: "interest" | "misconception" | "preference";
  text: string;
  evidence: string;
};

export type Concept = {
  id: string;
  label: string;
  topic: Topic;
  summary: string;
  state: Exclude<ConceptState, "next">;
  sessionIds: string[];
  /** Layout position inside a 1000 x 620 canvas. */
  x: number;
  y: number;
  recent?: boolean;
};

export type ConceptLink = {
  from: string;
  to: string;
  kind: "semantic" | "session";
  /** Cosine similarity for semantic links. */
  similarity?: number;
  rationale: string;
};

export type LearningGraph = {
  concepts: Concept[];
  links: ConceptLink[];
  sessions: { id: string; title: string }[];
};

export type SavedBlock = { block: LearningBlock; savedLabel: string };

export type WeeklyRecap = { sessions: number; concepts: number };

export type VoiceOption = { id: string; label: string; detail: string };

export type Settings = {
  interests: { topic: Topic; selected: boolean }[];
  voice: {
    voiceId: string;
    voices: VoiceOption[];
    pace: "relaxed" | "natural" | "brisk";
    interruptible: boolean;
  };
  privacy: {
    keepTranscripts: boolean;
    rememberMisconceptions: boolean;
    personalizeDiscover: boolean;
  };
};

export type LearningMode = {
  id: "discover" | "explore" | "interact" | "recall";
  label: string;
  detail: string;
  href: string;
};

/** Everything the UI reads. Implement this once against the real API to swap out the mock. */
export interface DataSource {
  getLearner(): Promise<Learner>;
  getBlocks(): Promise<LearningBlock[]>;
  getBlock(id: string): Promise<LearningBlock | null>;
  getSavedBlocks(): Promise<SavedBlock[]>;
  getSessions(): Promise<SessionSummary[]>;
  getSession(id: string): Promise<LearningSession | null>;
  getSessionForBlock(blockId: string): Promise<LearningSession | null>;
  getRecallQueue(): Promise<RecallItem[]>;
  getReviewHistory(): Promise<ReviewRecord[]>;
  getMemory(): Promise<MemoryItem[]>;
  getGraph(): Promise<LearningGraph>;
  getSettings(): Promise<Settings>;
}
