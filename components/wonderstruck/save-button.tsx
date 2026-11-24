"use client";

import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSetBlockSaved } from "@/lib/data/queries";
import { cn } from "@/lib/utils";

/** Save toggle for a block. Flips immediately and reverts if the server refuses. */
export function SaveButton({
  blockId,
  initial = false,
  label,
  compact = false,
}: {
  blockId: string;
  initial?: boolean;
  label: string;
  compact?: boolean;
}) {
  const save = useSetBlockSaved();
  // Shows the requested state while saving; once the saved list refetches, `initial` reflects
  // the server (and a refused save falls back to it).
  const optimistic = save.isPending ? save.variables.saved : initial;

  function toggle() {
    save.mutate({ blockId, saved: !optimistic });
  }

  return (
    <Button
      variant="secondary"
      size={compact ? "icon" : "default"}
      aria-pressed={optimistic}
      aria-label={compact ? `${optimistic ? "Unsave" : "Save"} ${label}` : undefined}
      onClick={toggle}
      className={cn(optimistic && "text-tint-rose")}
    >
      <Bookmark aria-hidden className={cn(optimistic && "fill-current")} />
      {!compact && (optimistic ? "Saved" : "Save")}
    </Button>
  );
}
