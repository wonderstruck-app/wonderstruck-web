import type { BlockCard, LearningMode, RecallItem, SessionSummary, WeeklyRecap } from "./types";

// Views derived from several reads. Pure, so server and client compute them the same way.

export function weeklyRecap(sessions: SessionSummary[]): WeeklyRecap {
  const thisWeek = sessions.filter((s) => s.period === "this-week");
  const concepts = new Set(
    thisWeek.flatMap((s) => s.concepts.filter((c) => c.state !== "next").map((c) => c.conceptId)),
  );
  return { sessions: thisWeek.length, concepts: concepts.size };
}

export function learningModes(
  blocks: BlockCard[],
  recall: RecallItem[],
  sessions: SessionSummary[],
): LearningMode[] {
  const active = sessions.find((x) => x.status === "active");
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
