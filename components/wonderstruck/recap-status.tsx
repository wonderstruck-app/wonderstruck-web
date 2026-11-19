import { CircleAlert, CircleDashed, FileText, LoaderCircle, RotateCw } from "lucide-react";
import type { RecapStatus as Status } from "@/lib/data";

/** Inline recap state for meta lines. A failed recap offers a text Retry, never a button that squeezes the title. */
export function RecapStatus({ status }: { status: Status }) {
  if (status === "none")
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <CircleDashed aria-hidden className="size-3.5" />
        In progress
      </span>
    );
  if (status === "ready")
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <FileText aria-hidden className="size-3.5" />
        Recap ready
      </span>
    );
  if (status === "generating")
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <LoaderCircle
          aria-hidden
          className="size-3.5 animate-spin motion-reduce:animate-none"
        />
        Writing recap…
      </span>
    );
  return (
    <>
      <span className="inline-flex items-center gap-1 text-destructive">
        <CircleAlert aria-hidden className="size-3.5" />
        Recap failed
        <span className="sr-only">. Your conversation is saved.</span>
      </span>
      <span aria-hidden className="text-muted-foreground/60">
        ·
      </span>
      <button
        type="button"
        className="relative z-10 inline-flex items-center gap-1 font-medium text-primary-ink outline-none hover:underline focus-visible:underline"
      >
        <RotateCw aria-hidden className="size-3.5" />
        Retry
      </button>
    </>
  );
}
