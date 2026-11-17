import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SessionSummary } from "@/lib/data";
import { SectionHeading } from "./section-heading";

export function ContinueCard({ session: s }: { session: SessionSummary }) {
  const covered = s.concepts.filter((c) => c.state !== "next").length;
  const pct = Math.round((covered / s.concepts.length) * 100);

  return (
    <section aria-labelledby="continue-title">
      <SectionHeading
        id="continue-title"
        title="Continue exploring"
        href="/sessions"
      />
      <div className="squircle-lg relative flex flex-col gap-5 border border-primary/25 bg-card bg-[radial-gradient(120%_140%_at_0%_0%,oklch(0.9_0.05_82/0.1),transparent_55%)] p-4 shadow-[0_0_0_1px_oklch(0.9_0.05_82/0.06),0_12px_48px_-14px_oklch(0.9_0.05_82/0.28),inset_0_1px_0_0_oklch(1_0_0/0.06)] sm:flex-row sm:items-center sm:gap-6 sm:pr-6">
        <div className="squircle-md relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:w-44">
          <Image
            src={s.image.src}
            alt={s.image.alt}
            fill
            sizes="(min-width: 640px) 176px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[1.125rem] leading-snug font-bold">{s.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {s.topics.join(" · ")} · {s.whenLabel.toLowerCase()}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div
              role="progressbar"
              aria-valuenow={covered}
              aria-valuemin={0}
              aria-valuemax={s.concepts.length}
              aria-label="Concepts covered"
              className="h-2 flex-1 overflow-hidden rounded-full bg-secondary"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {covered} of {s.concepts.length} concepts
            </span>
          </div>
        </div>
        <Button asChild size="lg" className="sm:self-center">
          <Link href={`/explore/${s.blockId}`}>
            <Play aria-hidden className="fill-current" />
            Resume
          </Link>
        </Button>
      </div>
    </section>
  );
}
