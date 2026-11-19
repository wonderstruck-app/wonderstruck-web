"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecallItem } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MiraMascot } from "./brand";
import { IconKey } from "./icon-key";
import { RecallQuestion } from "./recall-question";

const wash =
  "bg-[radial-gradient(120%_80%_at_100%_0%,color-mix(in_oklch,var(--tint-violet)_24%,transparent),transparent_62%),radial-gradient(90%_70%_at_0%_100%,color-mix(in_oklch,var(--tint-teal)_10%,transparent),transparent_60%)]";

/** Focused recall run through the whole queue, then a calm finish. */
export function RecallSession({ queue }: { queue: RecallItem[] }) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const item = queue[index];
  const finished = index >= queue.length;

  const segments = (
    <div
      role="progressbar"
      aria-label="Recall progress"
      aria-valuemin={0}
      aria-valuemax={queue.length}
      aria-valuenow={results.length}
      className="flex flex-1 gap-1.5"
    >
      {queue.map((q, i) => (
        <span
          key={q.id}
          className={cn(
            "h-1.5 flex-1 rounded-full bg-ink/10 transition-colors duration-300",
            i < results.length && (results[i] ? "bg-success" : "bg-tint-rose"),
            i === results.length && !finished && "bg-primary",
          )}
        />
      ))}
    </div>
  );

  if (finished) {
    const right = results.filter(Boolean).length;
    return (
      <div className={cn("surface squircle-lg flex flex-col items-center px-6 py-12 text-center", wash)}>
        <MiraMascot width={104} />
        <h2 className="mt-5 text-[1.5rem] font-semibold">All caught up</h2>
        <p className="mt-2 max-w-[44ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
          {queue.length === 0
            ? "Nothing is due right now. New reviews appear a day or so after your sessions."
            : `You recalled ${right} of ${queue.length}. Mira will space the next reviews so they land just before you'd forget.`}
        </p>
        {queue.length > 0 && <div className="mt-6 flex w-full max-w-56">{segments}</div>}
        <Button asChild className="mt-8">
          <Link href="/discover">Find something new</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("surface squircle-lg relative p-5 sm:p-8", wash)}>
      <div className="flex items-center gap-3">
        <IconKey tone="violet" size="sm">
          <Brain />
        </IconKey>
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-primary-ink">{item.concept}</p>
        <p className="shrink-0 text-sm font-medium text-muted-foreground tabular-nums">
          {index + 1} / {queue.length}
        </p>
      </div>
      <div className="mt-4 flex">{segments}</div>

      <RecallQuestion
        key={item.id}
        item={item}
        size="lg"
        className="mt-8"
        onChecked={(ok) => setResults((r) => [...r, ok])}
        after={
          <Button size="lg" className="flex-1 sm:flex-none" onClick={() => setIndex(index + 1)}>
            {index + 1 < queue.length ? "Next question" : "Finish"}
            <ArrowRight aria-hidden />
          </Button>
        }
      />
    </div>
  );
}
