import type { DataSource, LearningSession, SessionSummary } from "../types";
import * as f from "./fixtures";

const summarize = (session: LearningSession): SessionSummary => {
  const summary: Partial<LearningSession> = { ...session };
  delete summary.recap;
  delete summary.transcript;
  delete summary.attempts;
  return summary as SessionSummary;
};

/** In-memory source backed by `fixtures.ts`. Mirrors the shape the real API must return. */
export const mockSource: DataSource = {
  getLearner: async () => f.learner,
  getBlocks: async () => f.blocks,
  getBlock: async (id) => f.blocks.find((b) => b.id === id) ?? null,
  getSavedBlocks: async () =>
    f.savedBlockIds.flatMap(({ blockId, savedLabel }) => {
      const block = f.blocks.find((b) => b.id === blockId);
      return block ? [{ block, savedLabel }] : [];
    }),
  getSessions: async () => f.sessions.map(summarize),
  getSession: async (id) => f.sessions.find((s) => s.id === id) ?? null,
  getSessionForBlock: async (blockId) =>
    f.sessions.find((s) => s.blockId === blockId) ?? null,
  getRecallQueue: async () => f.recallQueue,
  getReviewHistory: async () => f.reviewHistory,
  getMemory: async () => f.memory,
  getGraph: async () => ({
    concepts: f.concepts,
    links: f.conceptLinks,
    sessions: f.sessions.map(({ id, title }) => ({ id, title })),
  }),
  getSettings: async () => f.settings,
};
