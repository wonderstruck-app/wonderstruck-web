import { cn } from "@/lib/utils";
import type { ConceptState } from "@/lib/data";

const meta: Record<ConceptState, { label: string; className: string; hint: string }> = {
  discussed: {
    label: "Discussed",
    className: "border-border text-foreground/80",
    hint: "Talked through with Mira",
  },
  practiced: {
    label: "Practiced",
    className: "border-tint-teal/30 bg-tint-teal/10 text-tint-teal",
    hint: "Tried in an activity",
  },
  demonstrated: {
    label: "Demonstrated",
    className: "border-tint-violet/30 bg-tint-violet/10 text-tint-violet",
    hint: "Explained or recalled correctly",
  },
  next: {
    label: "Up next",
    className: "border-dashed border-border text-muted-foreground",
    hint: "Not covered yet",
  },
};

export const conceptStateHint = (s: ConceptState) => meta[s].hint;

export function ConceptStateBadge({ state }: { state: ConceptState }) {
  const m = meta[state];
  return (
    <span
      title={m.hint}
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-full border px-2.5 text-xs font-semibold whitespace-nowrap",
        m.className,
      )}
    >
      {m.label}
    </span>
  );
}
