"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecallItem } from "@/lib/data";
import { ProgressRing } from "./progress-ring";
import { RecallQuestion } from "./recall-question";

export function RecallCard({ queue }: { queue: RecallItem[] }) {
  const [done, setDone] = useState(0);
  const item = queue[0];

  return (
    <section
      aria-labelledby="recall-title"
      className="surface squircle-lg flex flex-col p-5 sm:p-6"
    >
      <div className="flex items-center gap-4">
        <ProgressRing done={done} total={queue.length} />
        <div className="min-w-0">
          <h2 id="recall-title" className="text-[1.1875rem] font-bold">
            Ready to recall
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {queue.length} concepts · about 2 minutes
          </p>
        </div>
      </div>

      {item ? (
        <RecallQuestion
          item={item}
          className="mt-5 flex-1 border-t border-border pt-5"
          onChecked={() => setDone(1)}
          after={
            <Button asChild className="flex-1">
              <Link href="/remember">
                Next question
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          }
          secondary={
            <Button asChild variant="secondary">
              <Link href="/remember">Later</Link>
            </Button>
          }
        />
      ) : (
        <p className="mt-5 border-t border-border pt-5 text-sm text-muted-foreground">
          Nothing to recall right now. New reviews appear after your sessions.
        </p>
      )}
    </section>
  );
}
