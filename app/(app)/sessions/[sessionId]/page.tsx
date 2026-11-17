import { Suspense, type CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Compass,
  MessageCircle,
  RotateCcw,
  RotateCw,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConceptStateBadge } from "@/components/wonderstruck/concept-state";
import { PageFrame, WithRail } from "@/components/wonderstruck/page-header";
import { RailCard } from "@/components/wonderstruck/rail-card";
import { getBlocks, getRecallQueue, getSession, type LearningSession } from "@/lib/data";

type Props = { params: Promise<{ sessionId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getSession((await params).sessionId);
  return { title: s ? `${s.title} · Recap` : "Session" };
}

export default function SessionPage({ params }: Props) {
  return (
    <PageFrame>
      <Suspense fallback={<RecapSkeleton />}>
        <Session params={params} />
      </Suspense>
    </PageFrame>
  );
}

async function Session({ params }: Props) {
  const s = await getSession((await params).sessionId);
  if (!s) notFound();
  const [blocks, queue] = await Promise.all([getBlocks(), getRecallQueue()]);
  const due = queue.filter((r) => r.sessionId === s.id);
  const next = blocks
    .filter((b) => b.id !== s.blockId && s.topics.includes(b.topic))
    .concat(blocks.filter((b) => b.id !== s.blockId && !s.topics.includes(b.topic)))
    .slice(0, 2);

  return (
    <WithRail
      railLabel="About this session"
      rail={
        <>
          {due.length > 0 && (
            <RailCard order={1} featured icon={<RotateCcw />} tone="honey" title="Recall from this session" hint={`${due.length} ready now`}>
              <ul className="flex flex-col gap-1.5 text-sm text-foreground/80">
                {due.map((r) => (
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

          <RailCard order={2} icon={<Compass />} tone="blue" title="Explore next" hint="Close to what you just learned">
            <ul className="flex flex-col gap-3">
              {next.map((b) => (
                <li key={b.id}>
                  <Link href={`/learn/${b.id}`} className="squircle-md group relative block aspect-[16/9] overflow-hidden">
                    <Image src={b.image.src} alt="" fill sizes="384px" className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <span className="absolute inset-x-3 bottom-2.5 text-sm leading-snug font-semibold text-white">
                      {b.question}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </RailCard>
        </>
      }
    >
      <Link
        href="/sessions"
        className="inline-flex h-10 items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Sessions
      </Link>

      <header className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="squircle-lg relative aspect-[16/10] w-full shrink-0 overflow-hidden shadow-[0_20px_40px_-20px_oklch(0_0_0/0.8)] sm:w-48">
          <Image
            src={s.image.src}
            alt={s.image.alt}
            fill
            loading="eager"
            sizes="(min-width: 640px) 192px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-muted-foreground">
            {s.topics.join(" · ")} · {s.whenLabel} · {s.minutes} min
          </p>
          <h1 className="mt-1 text-[1.875rem] leading-tight font-bold sm:text-[2.125rem]">
            {s.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/explore/${s.blockId}`}>
                {s.status === "active" ? "Resume session" : "Explore again"}
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/remember">Review concepts</Link>
            </Button>
          </div>
        </div>
      </header>

      <RecapSection session={s} />
      <Concepts session={s} />
      {s.attempts.length > 0 && <Attempts session={s} />}
      <Transcript session={s} />

      <section className="mt-12 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Deleting removes the transcript, recap, and this session&apos;s links
          in your graph.
        </p>
        <Button variant="destructive">Delete session</Button>
      </section>
    </WithRail>
  );
}

function RecapSection({ session: s }: { session: LearningSession }) {
  if (s.recapStatus === "none")
    return (
      <Notice icon={<CircleDashed aria-hidden className="size-5" />}>
        This session is still open. Mira writes the recap when you finish.
      </Notice>
    );
  if (s.recapStatus === "generating")
    return (
      <section aria-busy aria-label="Writing recap" className="mt-10">
        <p className="text-sm font-semibold text-muted-foreground">
          Mira is writing your recap…
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <div className="h-4 w-full animate-pulse rounded bg-secondary" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-secondary" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
          <div className="squircle-md mt-3 h-24 animate-pulse bg-card" />
        </div>
      </section>
    );
  if (s.recapStatus === "failed" || !s.recap)
    return (
      <Notice
        tone="error"
        icon={<CircleAlert aria-hidden className="size-5" />}
        action={
          <Button variant="secondary">
            <RotateCw aria-hidden />
            Try again
          </Button>
        }
      >
        The recap couldn&apos;t be written. Your conversation is saved, so
        nothing is lost.
      </Notice>
    );

  const r = s.recap;
  return (
    <section aria-labelledby="recap-title" className="mt-10">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="recap-title" className="text-[1.375rem] font-bold">
          Recap
        </h2>
        <p className="text-xs text-muted-foreground">{r.generatedLabel}</p>
      </div>
      <p className="mt-3 max-w-[65ch] text-[1.0625rem] leading-[1.7] text-foreground/90">
        {r.summary}
      </p>

      <h3 className="mt-8 text-sm font-semibold text-muted-foreground">
        Key ideas
      </h3>
      <ol className="mt-3 flex flex-col gap-3">
        {r.keyIdeas.map((k, i) => (
          <li
            key={k.title}
            className="surface squircle-md flex gap-4 p-4"
          >
            <span style={{ "--chip": "var(--primary)" } as CSSProperties} className="icon-key grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums">
              {i + 1}
            </span>
            <div>
              <p className="font-bold">{k.title}</p>
              <p className="mt-1 text-[0.9375rem] leading-relaxed text-foreground/80">
                {k.text}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <ListCard title="Still open" items={r.openQuestions} />
        <ListCard title="Where to go next" items={r.nextSteps} />
      </div>
    </section>
  );
}

function Concepts({ session: s }: { session: LearningSession }) {
  return (
    <section aria-labelledby="concepts-title" className="mt-10">
      <h2 id="concepts-title" className="text-[1.1875rem] font-bold">
        Concepts from this session
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Based on what you did, not just what came up.
      </p>
      <ul className="mt-4 flex flex-col divide-y divide-border border-y border-border">
        {s.concepts.map((c) => (
          <li
            key={c.conceptId}
            className="flex min-h-14 items-center justify-between gap-3 py-2"
          >
            <span className="font-medium">{c.name}</span>
            <ConceptStateBadge state={c.state} />
          </li>
        ))}
      </ul>
      <Link
        href="/graph"
        className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
      >
        See them in your graph
      </Link>
    </section>
  );
}

const outcomeIcon = {
  solved: <CircleCheck aria-hidden className="size-5 text-success" />,
  retried: <RotateCcw aria-hidden className="size-5 text-tint-honey" />,
  skipped: <SkipForward aria-hidden className="size-5 text-muted-foreground" />,
};

function Attempts({ session: s }: { session: LearningSession }) {
  return (
    <section aria-labelledby="attempts-title" className="mt-10">
      <h2 id="attempts-title" className="text-[1.1875rem] font-bold">
        Activities
      </h2>
      <ul className="mt-4 flex flex-col gap-3">
        {s.attempts.map((a) => (
          <li
            key={a.title}
            className="surface squircle-md flex items-start gap-3 p-4"
          >
            {outcomeIcon[a.outcome]}
            <div>
              <p className="font-bold">
                {a.title}
                <span className="ml-2 text-sm font-medium text-muted-foreground capitalize">
                  {a.outcome}
                </span>
              </p>
              <p className="mt-0.5 text-sm text-foreground/80">{a.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Transcript({ session: s }: { session: LearningSession }) {
  if (s.transcript.length === 0) return null;
  return (
    <details className="surface group squircle-lg mt-10">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <MessageCircle aria-hidden className="size-5 text-muted-foreground" />
        Conversation
        <span className="text-sm font-medium text-muted-foreground">
          {s.messageCount} messages
        </span>
        <span className="ml-auto text-sm font-semibold text-primary group-open:hidden">
          Show
        </span>
        <span className="ml-auto hidden text-sm font-semibold text-primary group-open:inline">
          Hide
        </span>
      </summary>
      <ol className="flex flex-col gap-4 border-t border-border px-5 py-5">
        {s.transcript.map((m) => (
          <li key={m.id}>
            <p className="text-xs font-semibold text-muted-foreground">
              {m.role === "mira" ? "Mira" : "You"}
              {m.via === "voice" && " · voice"}
            </p>
            <p className="mt-0.5 text-[0.9375rem] leading-relaxed text-foreground/90">
              {m.text}
            </p>
          </li>
        ))}
      </ol>
    </details>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="surface squircle-md p-4">
      <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
      <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-[0.9375rem] leading-relaxed text-foreground/85 marker:text-muted-foreground">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

function Notice({
  icon,
  children,
  action,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  tone?: "neutral" | "error";
}) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={
        "squircle-md mt-10 flex flex-col gap-3 border p-4 sm:flex-row sm:items-center " +
        (tone === "error"
          ? "border-destructive/30 bg-destructive/8 text-foreground"
          : "border-border bg-card text-foreground/85")
      }
    >
      <span className={tone === "error" ? "text-destructive" : "text-muted-foreground"}>
        {icon}
      </span>
      <p className="flex-1 text-[0.9375rem]">{children}</p>
      {action}
    </div>
  );
}

function RecapSkeleton() {
  return (
    <div aria-busy aria-label="Loading" className="flex flex-col gap-4">
      <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
      <div className="h-10 w-2/3 animate-pulse rounded-lg bg-secondary" />
      <div className="squircle-lg mt-6 h-40 animate-pulse bg-card" />
    </div>
  );
}
