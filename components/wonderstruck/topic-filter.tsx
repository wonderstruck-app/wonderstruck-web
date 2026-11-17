"use client";

import { cn } from "@/lib/utils";

/** Single-select chip row. `null` means "All". */
export function TopicFilter<T extends string>({
  topics,
  value,
  onChange,
  label = "Filter by topic",
}: {
  topics: readonly T[];
  value: T | null;
  onChange: (value: T | null) => void;
  label?: string;
}) {
  const options: (T | null)[] = [null, ...topics];
  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {options.map((t) => {
        const active = value === t;
        return (
          <button
            key={t ?? "all"}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(t)}
            className={cn(
              "squircle-sm h-10 shrink-0 border px-4 text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-primary/50 bg-primary/12 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-input hover:text-foreground",
            )}
          >
            {t ?? "All"}
          </button>
        );
      })}
    </div>
  );
}
