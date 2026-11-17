"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecallItem } from "@/lib/data";
import { MiraMascot } from "./brand";
import { RecallQuestion } from "./recall-question";

/** Focused recall run through the whole queue, then a calm finish. */
export function RecallSession({ queue }: { queue: RecallItem[] }) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const item = queue[index];
  const finished = index >= queue.length;

  if (finished) {
    const right = results.filter(Boolean).length;
    return (
      <div className="surface glow-soft squircle-lg flex flex-col items-center px-6 py-12 text-center">
        <MiraMascot width={112} />
        <h2 className="mt-4 text-[1.5rem] font-bold">All caught up</h2>
        <p className="mt-2 max-w-[44ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
          {queue.length === 0
            ? "Nothing is due right now. New reviews appear a day or so after your sessions."
            : `You recalled ${right} of ${queue.length}. Mira will space the next reviews so they land just before you'd forget.`}
        </p>
        <Button asChild className="mt-6">
          <Link href="/discover">Find something new</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="surface glow-soft squircle-lg relative overflow-hidden p-5 sm:p-7">
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-20 size-72 rounded-full bg-tint-honey/10 blur-3xl" />
      <div className="flex items-center gap-4">
        <p className="text-sm font-semibold text-muted-foreground tabular-nums">
          {index + 1} of {queue.length}
        </p>
        <div
          role="progressbar"
          aria-label="Recall progress"
          aria-valuemin={0}
          aria-valuemax={queue.length}
          aria-valuenow={results.length}
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
        >
          <div
            className="h-full rounded-full bg-tint-honey transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${(results.length / queue.length) * 100}%` }}
          />
        </div>
      </div>
      <p className="mt-6 text-xs font-semibold text-tint-honey">
        {item.concept}
      </p>
      <RecallQuestion
        key={item.id}
        item={item}
        className="mt-2"
        onChecked={(ok) => setResults((r) => [...r, ok])}
        after={
          <Button className="flex-1 sm:flex-none" onClick={() => setIndex(index + 1)}>
            {index + 1 < queue.length ? "Next question" : "Finish"}
            <ArrowRight aria-hidden />
          </Button>
        }
      />
    </div>
  );
}
