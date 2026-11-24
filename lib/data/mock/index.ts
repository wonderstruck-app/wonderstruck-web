import type { DataSource, LearningSession, RecallItem, SessionSummary } from "../types";
import * as f from "./fixtures";

const summarize = (session: LearningSession): SessionSummary => {
  const summary: Partial<LearningSession> = { ...session };
  delete summary.recap;
  delete summary.transcript;
  delete summary.attempts;
  return summary as SessionSummary;
};

/** Recall cards with the answer attached, so the UI can grade them without a server. */
export const recallWithAnswers = (): RecallItem[] =>
  f.recallQueue.map(({ correctId, explanation, ...item }) => ({
    ...item,
    answer: { correctId, explanation },
  }));

/** In-memory source backed by `fixtures.ts`. Set `NEXT_PUBLIC_WONDERSTRUCK_DATA=mock` to use it. */
export const mockSource: DataSource = {
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
  getRecallQueue: async () => recallWithAnswers(),
  getReviewHistory: async () => f.reviewHistory,
  getMemory: async () => f.memory,
  getGraph: async () => ({
    concepts: f.concepts,
    links: f.conceptLinks,
    sessions: f.sessions.map(({ id, title }) => ({ id, title })),
  }),
  getSettings: async () => f.settings,
  reviewRecall: async (itemId, optionId) => {
    const item = f.recallQueue.find((r) => r.id === itemId);
    if (!item) throw new Error(`Unknown recall card: ${itemId}`);
    const { correctId, explanation } = item;
    return { correct: optionId === correctId, correctId, explanation };
  },
  setBlockSaved: async () => {},
};
