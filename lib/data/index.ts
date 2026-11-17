// The only module UI code imports data from.
//
// To connect the real backend, implement `DataSource` (see ./types.ts) in a new
// module, e.g. `./api`, and change the `source` assignment below. Pages and
// components keep working unchanged. Real per-learner reads are request-time
// data, so wrap their consumers in <Suspense> (see the loading.tsx files).

import { mockSource } from "./mock";
import type { DataSource, LearningMode, WeeklyRecap } from "./types";

const source: DataSource = mockSource;

export const {
  getLearner,
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

export async function getWeeklyRecap(): Promise<WeeklyRecap> {
  const thisWeek = (await getSessions()).filter((s) => s.period === "this-week");
  const concepts = new Set(
    thisWeek.flatMap((s) =>
      s.concepts.filter((c) => c.state !== "next").map((c) => c.conceptId),
    ),
  );
  return { sessions: thisWeek.length, concepts: concepts.size };
}

export async function getLearningModes(): Promise<LearningMode[]> {
  const [blocks, recall, active] = await Promise.all([
    getBlocks(),
    getRecallQueue(),
    getSessions().then((s) => s.find((x) => x.status === "active")),
  ]);
  return [
    { id: "discover", label: "Discover", detail: `${blocks.length} blocks to explore`, href: "/discover" },
    { id: "explore", label: "Explore with Mira", detail: "Voice or text", href: "/explore" },
    {
      id: "interact",
      label: "Interact",
      detail: active ? "1 activity waiting" : "Try an activity",
      href: active ? `/explore/${active.blockId}#activity` : "/discover",
    },
    { id: "recall", label: "Recall", detail: `${recall.length} concepts due`, href: "/remember" },
  ];
}

export type * from "./types";
