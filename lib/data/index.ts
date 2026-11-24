import "server-only";

// Server-side reads: page metadata and server components. Client views read through the
// TanStack Query hooks in `./queries`, which share this module's mappers (`./wire`).
//
// Reads the FastAPI backend (`backend/`, at API_URL) by default. Set
// NEXT_PUBLIC_WONDERSTRUCK_DATA=mock to run the UI on the in-memory fixtures with no backend.

import { getCurrentLearner } from "@/lib/session";

import { apiSource } from "./api";
import { learningModes, weeklyRecap } from "./derive";
import { mockSource } from "./mock";
import type { DataSource, LearningMode, WeeklyRecap } from "./types";

export const source: DataSource =
  process.env.NEXT_PUBLIC_WONDERSTRUCK_DATA === "mock" ? mockSource : apiSource;

export const {
  getBlocks,
  getBlock,
  getSavedBlocks,
  getSessions,
  getSession,
  getSessionForBlock,
  getRecallQueue,
  getReviewHistory,
  getMemory,
  getGraph,
  getSettings,
} = source;

/** The signed-in learner. Redirects to /login without a valid session. */
export const getLearner = getCurrentLearner;

export async function getWeeklyRecap(): Promise<WeeklyRecap> {
  return weeklyRecap(await getSessions());
}

export async function getLearningModes(): Promise<LearningMode[]> {
  const [blocks, recall, sessions] = await Promise.all([getBlocks(), getRecallQueue(), getSessions()]);
  return learningModes(blocks, recall, sessions);
}

export type * from "./types";
