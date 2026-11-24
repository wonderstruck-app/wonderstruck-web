"use client";

import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { clientSource as source } from "./client";

// Every client read goes through these options so the cache keys stay in one place.
// Mutations invalidate exactly the reads they change.

export const q = {
  blocks: () => queryOptions({ queryKey: ["blocks"], queryFn: source.getBlocks }),
  block: (id: string) => queryOptions({ queryKey: ["block", id], queryFn: () => source.getBlock(id) }),
  saved: () => queryOptions({ queryKey: ["saved"], queryFn: source.getSavedBlocks }),
  sessions: () => queryOptions({ queryKey: ["sessions"], queryFn: source.getSessions }),
  session: (id: string) =>
    queryOptions({ queryKey: ["session", id], queryFn: () => source.getSession(id) }),
  blockSession: (blockId: string) =>
    queryOptions({
      queryKey: ["block-session", blockId],
      queryFn: () => source.getSessionForBlock(blockId),
    }),
  recallQueue: () => queryOptions({ queryKey: ["recall", "queue"], queryFn: source.getRecallQueue }),
  reviewHistory: () =>
    queryOptions({ queryKey: ["recall", "history"], queryFn: source.getReviewHistory }),
  memory: () => queryOptions({ queryKey: ["memory"], queryFn: source.getMemory }),
  graph: () => queryOptions({ queryKey: ["graph"], queryFn: source.getGraph }),
  settings: () => queryOptions({ queryKey: ["settings"], queryFn: source.getSettings }),
};

/** Grades a recall answer. A review reschedules the concept and can move it up the evidence ladder. */
export function useReviewRecall() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (v: { itemId: string; optionId: string; clientId: string }) =>
      source.reviewRecall(v.itemId, v.optionId, v.clientId),
    // Not awaited: the verdict shows at once while the affected reads refetch behind it.
    onSuccess: () => {
      for (const queryKey of [["recall"], ["memory"], ["graph"], ["sessions"], ["session"], ["block-session"]])
        void client.invalidateQueries({ queryKey });
    },
  });
}

/** Saves or unsaves a block. Stays pending until the saved list has refetched. */
export function useSetBlockSaved() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (v: { blockId: string; saved: boolean }) => source.setBlockSaved(v.blockId, v.saved),
    onSettled: () => client.invalidateQueries({ queryKey: ["saved"] }),
  });
}
