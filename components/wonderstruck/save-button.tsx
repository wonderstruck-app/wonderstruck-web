"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Local-only save toggle for the preview. Wire `onToggle` to the API later. */
export function SaveButton({
  initial = false,
  label,
  compact = false,
  onToggle,
}: {
  initial?: boolean;
  label: string;
  compact?: boolean;
  onToggle?: (saved: boolean) => void;
}) {
  const [saved, setSaved] = useState(initial);
  return (
    <Button
      variant="secondary"
      size={compact ? "icon" : "default"}
      aria-pressed={saved}
      aria-label={compact ? `${saved ? "Unsave" : "Save"} ${label}` : undefined}
      onClick={() => {
        setSaved(!saved);
        onToggle?.(!saved);
      }}
      className={cn(saved && "text-primary-ink")}
    >
      <Bookmark aria-hidden className={cn(saved && "fill-current")} />
      {!compact && (saved ? "Saved" : "Save")}
    </Button>
  );
}
