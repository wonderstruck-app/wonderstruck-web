import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MessageCircle, RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { RailCard } from "@/components/wonderstruck/rail-card";
import { Rise } from "@/components/wonderstruck/rise";
import { cn } from "@/lib/utils";
import { PageFrame, PageHeader, WithRail } from "@/components/wonderstruck/page-header";
import { RecapStatus } from "@/components/wonderstruck/recap-status";
import { getRecallQueue, getSessions, getWeeklyRecap, type SessionSummary } from "@/lib/data";

export const metadata: Metadata = { title: "Sessions" };

export default async function SessionsPage() {
  const [sessions, weekly, recall] = await Promise.all([
    getSessions(),
    getWeeklyRecap(),
    getRecallQueue(),
  ]);
  const thisWeek = sessions.filter((s) => s.period === "this-week");
  const earlier = sessions.filter((s) => s.period === "earlier");
  const minutes = thisWeek.reduce((n, s) => n + s.minutes, 0);
  const topics = [...new Set(thisWeek.flatMap((s) => s.topics))];

  return (
    <PageFrame>
      <WithRail
        railLabel="This week"
        rail={
          <>
            <RailCard
              order={1}
              featured
              icon={<CalendarDays />}
              title="Your week in wonder"
              hint={`${topics.length} topics explored`}
              className="scroll-mt-8"
            >
              <div id="this-week" className="scroll-mt-24" />
              <dl className="grid grid-cols-3 gap-2">
                {[
                  ["Sessions", weekly.sessions],
                  ["Concepts", weekly.concepts],
                  ["Minutes", minutes],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="squircle-md border border-white/6 bg-background/50 px-3 py-2.5"
                  >
                    <dt className="text-[0.6875rem] font-semibold text-muted-foreground">
                      {k}
                    </dt>
                    <dd className="mt-0.5 text-[1.375rem] font-bold tabular-nums">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-4 flex flex-wrap gap-2">
                {topics.map((t) => (
                  <li
                    key={t}
                    className="squircle-sm border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-foreground/85"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </RailCard>

            {recall.length > 0 && (
              <RailCard
                order={2}
                icon={<RotateCcw />}
                tone="honey"
                title={`${recall.length} concepts ready to recall`}
                hint="About two minutes"
              >
                <ul className="flex flex-col gap-1.5 text-sm text-foreground/80">
                  {recall.map((r) => (
                    <li key={r.id} className="flex items-center gap-2">
                      <span aria-hidden className="size-1.5 rounded-full bg-tint-honey" />
                      {r.concept}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="secondary" className="mt-4 w-full">
                  <Link href="/remember">Start recall</Link>
                </Button>
              </RailCard>
            )}
          </>
        }
      >
        <PageHeader
          title="Sessions"
          description="Every conversation with Mira, with a recap of what you explored and what's worth coming back to."
        />
        <SessionGroup title="This week" sessions={thisWeek} first />
        <SessionGroup title="Earlier" sessions={earlier} />
      </WithRail>
    </PageFrame>
  );
}

function SessionGroup({
  title,
  sessions,
  first = false,
}: {
  title: string;
  sessions: SessionSummary[];
  first?: boolean;
}) {
  if (sessions.length === 0) return null;
  const id = `group-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <section aria-labelledby={id} className={first ? "mt-8" : "mt-10"}>
      <h2 id={id} className="mb-3 text-sm font-semibold text-muted-foreground">
        {title}
      </h2>
      <ul className="grid gap-3 2xl:grid-cols-2">
        {sessions.map((s, i) => (
          <Rise as="li" order={Math.min(i, 6)} key={s.id}>
            <SessionRow session={s} />
          </Rise>
        ))}
      </ul>
    </section>
  );
}

function SessionRow({ session: s }: { session: SessionSummary }) {
  const href = s.status === "active" ? `/explore/${s.blockId}` : `/sessions/${s.id}`;
  return (
    <article className="surface lift squircle-lg group relative flex h-full gap-4 p-3 focus-within:ring-2 focus-within:ring-ring sm:p-3.5">
      <div className="squircle-md relative size-20 shrink-0 overflow-hidden sm:size-24">
        <Image
          src={s.image.src}
          alt=""
          fill
          sizes="96px"
          className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
        />
        {s.status === "active" && (
          <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[0.6875rem] font-semibold text-white backdrop-blur-md">
            Open
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="text-xs font-semibold text-muted-foreground">
          {s.topics.join(" · ")} · {s.whenLabel}
        </p>
        <h3 className="mt-1 leading-snug font-bold">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {s.title}
          </Link>
        </h3>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock aria-hidden className="size-3.5" />
            {s.minutes} min
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <MessageCircle aria-hidden className="size-3.5" />
            {s.messageCount} messages
          </span>
          <RecapStatus status={s.recapStatus} />
        </p>
      </div>
      <span
        aria-hidden
        className={cn(
          buttonVariants({ variant: s.status === "active" ? "default" : "secondary" }),
          "pointer-events-none hidden self-center sm:inline-flex",
        )}
      >
        {s.status === "active" ? "Resume" : "Recap"}
        <ArrowRight />
      </span>
    </article>
  );
}
