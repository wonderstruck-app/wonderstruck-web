// FastAPI wire shapes and their mapping onto the UI's domain types. Isomorphic: the server
// source (`api.ts`) and the browser source (`client.ts`) differ only in how they send requests.

import { agoLabel, dayLabel, dueLabel, inline, isThisWeek } from "./labels";
import type {
  Activity,
  BlockCard,
  Choice,
  ConceptState,
  DataSource,
  ImageAsset,
  LearningBlock,
  LearningGraph,
  LearningSession,
  MemoryItem,
  RecallItem,
  ReviewRecord,
  SavedBlock,
  SessionSummary,
  Settings,
  Source,
  Topic,
} from "./types";

/** Sessions without a block (open "Ask Mira" chats) have no image of their own. */
const FALLBACK_IMAGE: ImageAsset = {
  src: "/brand/mira-owl.png",
  alt: "Mira, the Wonderstruck owl",
};

// Wire shapes: the subset of the OpenAPI schema (`/api/v1/docs`) the UI reads.

type WireCard = {
  slug: string;
  topic: string;
  question: string;
  teaser: string;
  minutes: number;
  image: ImageAsset;
};
type WireActivity = Activity & { id: string };
type WireBlock = WireCard & {
  body: string[];
  sources: Source[];
  activity: WireActivity | null;
};
type WireSummary = {
  id: string;
  blockSlug: string | null;
  title: string;
  topics: string[];
  status: "active" | "finished" | "abandoned";
  lastActivityAt: string;
  endedAt: string | null;
  minutes: number;
  messageCount: number;
  image: ImageAsset | null;
  concepts: { conceptId: string; name: string; state: ConceptState }[];
  recapStatus: SessionSummary["recapStatus"];
};
type WireSession = WireSummary & {
  recap: {
    version: number;
    summary: string | null;
    keyIdeas: { title: string; text: string }[];
    openQuestions: string[];
    nextSteps: string[];
    createdAt: string;
  } | null;
  transcript: {
    id: string;
    role: "mira" | "learner";
    via: "voice" | "text";
    text: string;
  }[];
  attempts: {
    title: string;
    outcome: "solved" | "retried" | "skipped";
    note: string | null;
  }[];
};
type WireRecall = Omit<RecallItem, "sessionId" | "sessionTitle" | "answer"> & {
  sessionId: string | null;
  sessionTitle: string | null;
};
type WireReview = {
  id: string;
  concept: string;
  outcome: "recalled" | "missed";
  reviewedAt: string;
  nextDueAt: string;
};
type WireGraph = {
  concepts: (Omit<LearningGraph["concepts"][number], "topic"> & {
    topic: string | null;
  })[];
  links: (Omit<LearningGraph["links"][number], "similarity"> & {
    similarity: number | null;
  })[];
  sessions: LearningGraph["sessions"];
};
type WireSettings = {
  interests: { name: string; selected: boolean }[];
  voice: Settings["voice"];
  privacy: Settings["privacy"];
};
type WireReviewResult = {
  outcome: "recalled" | "missed";
  correctOptionId: string;
  explanation: string;
};

const toCard = (b: WireCard): BlockCard => ({
  id: b.slug,
  topic: b.topic as Topic,
  question: b.question,
  teaser: b.teaser,
  minutes: b.minutes,
  image: b.image,
});

function toActivity(wire: WireActivity): Activity {
  const activity: Partial<WireActivity> = { ...wire };
  delete activity.id;
  return activity as Activity;
}

const toBlock = (b: WireBlock): LearningBlock => ({
  ...toCard(b),
  body: b.body,
  sources: b.sources,
  activity: b.activity ? toActivity(b.activity) : undefined,
});

function toSummary(s: WireSummary, now: Date): SessionSummary {
  return {
    id: s.id,
    blockId: s.blockSlug ?? "",
    title: s.title,
    topics: s.topics,
    status: s.status === "active" ? "active" : "finished",
    whenLabel:
      s.status === "active"
        ? `Paused ${agoLabel(s.lastActivityAt, now)}`
        : dayLabel(s.endedAt ?? s.lastActivityAt, now),
    period: isThisWeek(s.lastActivityAt, now) ? "this-week" : "earlier",
    minutes: s.minutes,
    messageCount: s.messageCount,
    image: s.image ?? FALLBACK_IMAGE,
    concepts: s.concepts.map(({ conceptId, name, state }) => ({
      conceptId,
      name,
      state,
    })),
    recapStatus: s.recapStatus,
  };
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function toSession(s: WireSession, now: Date): LearningSession {
  const { recap } = s;
  return {
    ...toSummary(s, now),
    recap: recap
      ? {
          summary: recap.summary ?? "",
          keyIdeas: recap.keyIdeas,
          openQuestions: recap.openQuestions,
          nextSteps: recap.nextSteps,
          generatedLabel: [
            `Written ${inline(dayLabel(recap.createdAt, now))} from ${plural(s.transcript.length, "message", "messages")}`,
            s.attempts.length > 0 && plural(s.attempts.length, "activity", "activities"),
          ]
            .filter(Boolean)
            .join(" and "),
          version: recap.version,
        }
      : undefined,
    transcript: s.transcript.map(({ id, role, text, via }) => ({
      id,
      role,
      text,
      via,
    })),
    attempts: s.attempts.map(({ title, outcome, note }) => ({
      title,
      outcome,
      note: note ?? "",
    })),
  };
}

/** How a source reaches FastAPI: from the server (cookie forwarded) or the browser (same origin). */
export type Transport = {
  request<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T>;
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Turns a non-2xx FastAPI response into an ApiError. */
export async function apiError(res: Response, path: string): Promise<ApiError> {
  const error = await res
    .json()
    .then((b: { error?: { code?: string; message?: string } }) => b.error)
    .catch(() => undefined);
  return new ApiError(res.status, error?.code ?? "http_error", error?.message ?? `${res.status} on ${path}`);
}

/** A FastAPI-backed DataSource over the given transport. */
export function makeSource({ request }: Transport, wrap: <F extends (...args: never[]) => unknown>(fn: F) => F = (fn) => fn): DataSource {
  /** Like `request`, but a 404 is an answer (null), not an error. */
  async function find<T>(path: string): Promise<T | null> {
    try {
      return await request<T>(path);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  }

  async function allBlocks(): Promise<BlockCard[]> {
    const cards: BlockCard[] = [];
    let cursor: string | null = null;
    do {
      const query: string = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
      const page: { items: WireCard[]; nextCursor: string | null } = await request(
        `/blocks?limit=50${query}`,
      );
      cards.push(...page.items.map(toCard));
      cursor = page.nextCursor;
    } while (cursor);
    return cards;
  }

  return {
    getBlocks: wrap(allBlocks),
    getBlock: wrap(async (id) => {
      const b = await find<WireBlock>(`/blocks/${encodeURIComponent(id)}`);
      return b && toBlock(b);
    }),
    getSavedBlocks: wrap(async (): Promise<SavedBlock[]> => {
      const saved = await request<{ block: WireCard; savedAt: string }[]>("/saved");
      const now = new Date();
      return saved.map((x) => ({
        block: toCard(x.block),
        savedLabel: `Saved ${inline(dayLabel(x.savedAt, now))}`,
      }));
    }),
    getSessions: wrap(async () => {
      const sessions = await request<WireSummary[]>("/sessions");
      const now = new Date();
      return sessions.map((s) => toSummary(s, now));
    }),
    getSession: wrap(async (id) => {
      const s = await find<WireSession>(`/sessions/${encodeURIComponent(id)}`);
      return s && toSession(s, new Date());
    }),
    getSessionForBlock: wrap(async (blockId) => {
      const s = await find<WireSession>(`/blocks/${encodeURIComponent(blockId)}/session`);
      return s && toSession(s, new Date());
    }),
    getRecallQueue: wrap(async () => {
      const queue = await request<WireRecall[]>("/recall/queue");
      return queue.map((r): RecallItem => ({
        id: r.id,
        conceptId: r.conceptId,
        concept: r.concept,
        sessionId: r.sessionId ?? "",
        sessionTitle: r.sessionTitle ?? "an earlier session",
        question: r.question,
        options: r.options.map(({ id, label }: Choice) => ({ id, label })),
      }));
    }),
    getReviewHistory: wrap(async (): Promise<ReviewRecord[]> => {
      const reviews = await request<WireReview[]>("/recall/history");
      const now = new Date();
      return reviews.map((r) => ({
        id: r.id,
        concept: r.concept,
        outcome: r.outcome,
        whenLabel: dayLabel(r.reviewedAt, now),
        nextLabel: dueLabel(r.nextDueAt, now),
      }));
    }),
    getMemory: wrap(async (): Promise<MemoryItem[]> => {
      const memory = await request<MemoryItem[]>("/memory");
      return memory.map(({ id, kind, text, evidence }) => ({
        id,
        kind,
        text,
        evidence,
      }));
    }),
    getGraph: wrap(async (): Promise<LearningGraph> => {
      const g = await request<WireGraph>("/graph");
      return {
        concepts: g.concepts.map((c) => ({
          id: c.id,
          label: c.label,
          // Every seeded concept has a topic; an untagged one borrows a neutral hue.
          topic: (c.topic ?? "Space") as Topic,
          summary: c.summary,
          state: c.state,
          sessionIds: c.sessionIds,
          x: c.x,
          y: c.y,
          recent: c.recent,
        })),
        links: g.links.map((l) => ({
          from: l.from,
          to: l.to,
          kind: l.kind,
          similarity: l.similarity ?? undefined,
          rationale: l.rationale,
        })),
        sessions: g.sessions,
      };
    }),
    getSettings: wrap(async (): Promise<Settings> => {
      const s = await request<WireSettings>("/settings");
      return {
        interests: s.interests.map((i) => ({
          topic: i.name as Topic,
          selected: i.selected,
        })),
        voice: s.voice,
        privacy: s.privacy,
      };
    }),
    reviewRecall: async (itemId, optionId, clientId) => {
      const r = await request<WireReviewResult>(`/recall/${encodeURIComponent(itemId)}/reviews`, {
        method: "POST",
        body: { chosenOptionId: optionId, clientId },
      });
      return {
        correct: r.outcome === "recalled",
        correctId: r.correctOptionId,
        explanation: r.explanation,
      };
    },
    setBlockSaved: async (blockId, saved) => {
      await request<void>(`/blocks/${encodeURIComponent(blockId)}/save`, {
        method: saved ? "PUT" : "DELETE",
      });
    },
  };
}
