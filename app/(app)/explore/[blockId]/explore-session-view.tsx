"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityView } from "@/components/wonderstruck/activity";
import { ConceptStateBadge } from "@/components/wonderstruck/concept-state";
import { RailCard } from "@/components/wonderstruck/rail-card";
import { SessionCanvas } from "@/components/wonderstruck/session-canvas";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { startLiveSession } from "@/lib/mira-live";
import { q } from "@/lib/data/queries";
import { ExploreSessionSkeleton } from "@/components/wonderstruck/skeletons";

export function ExploreSessionView() {
  const { blockId } = useParams<{ blockId: string }>();
  const { data: block } = useQuery(q.block(blockId));
  const { data: session, isPending: sessionPending } = useQuery(q.blockSession(blockId));
  const { data: blocks } = useQuery(q.blocks());
  const queryClient = useQueryClient();
  if (block === null) notFound();
  if (!block || sessionPending || !blocks) return <ExploreSessionSkeleton />;

  const next = [
    ...blocks.filter((b) => b.id !== block.id && b.topic === block.topic),
    ...blocks.filter((b) => b.id !== block.id && b.topic !== block.topic),
  ].slice(0, 3);

  return (
    <>
      <header className="flex items-center gap-3 sm:gap-4">
        <Button asChild variant="secondary" size="icon-lg" className="shrink-0 -translate-y-0.5">
          <Link href={`/learn/${block.id}`} aria-label="Back to the block">
            <ArrowLeft />
          </Link>
        </Button>
        <span className="squircle-sm relative hidden size-12 shrink-0 overflow-hidden sm:block">
          <Image src={block.image.src} alt="" fill sizes="48px" className="object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-muted-foreground">
            {block.topic}
            {session && ` · ${session.minutes} min so far`}
          </p>
          <h1 className="truncate text-[1.125rem] leading-snug font-semibold sm:text-[1.3125rem]">
            {block.question}
          </h1>
        </div>
        {session && (
          <Button asChild variant="secondary" className="hidden shrink-0 -translate-y-0.5 sm:inline-flex">
            <Link href={`/sessions/${session.id}`}>End and recap</Link>
          </Button>
        )}
      </header>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_21rem] xl:gap-8 2xl:grid-cols-[minmax(0,1fr)_23rem]">
        <SessionCanvas
          initialMessages={session?.transcript ?? []}
          opening={`Let's dig into “${block.question}” Tap the mic and tell me what you already think, or try the activity below.`}
          activity={block.activity ? <ActivityView activity={block.activity} /> : undefined}
          activityTitle={block.activity?.title}
          suggestions={["Explain it simply", "Give me an analogy", "Quiz me on this"]}
          live={{
            // Resumes the block's active session, or starts one.
            getSessionId: () => startLiveSession(blockId),
            onClose: (id) => {
              for (const queryKey of [["block-session", blockId], ["session", id], ["sessions"]])
                void queryClient.invalidateQueries({ queryKey });
            },
          }}
        />

        <aside
          aria-label="Sources and related"
          className="flex min-w-0 flex-col gap-5 lg:min-h-0 lg:overflow-y-auto lg:pb-1 [scrollbar-width:thin]"
        >
          <RailCard order={1} icon={<BookOpen />} tone="blue" title="Sources" hint="What Mira draws on here">
            <ul className="flex flex-col gap-1">
              {block.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="squircle-md group -mx-2 flex items-start gap-3 p-2 outline-none transition-colors hover:bg-ink/[0.04] focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm leading-snug font-medium">{s.title}</span>
                      <span className="block text-xs text-muted-foreground">{s.publisher}</span>
                    </span>
                    <ExternalLink aria-hidden className="mt-0.5 size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </RailCard>

          <RailCard
            order={2}
            icon={<Waypoints />}
            tone="cream"
            title="In this session"
            hint={session ? "Concepts and how far you've got" : "Concepts appear as you talk"}
          >
            {session ? (
              <ul className="flex flex-col gap-2.5">
                {session.concepts.map((c) => (
                  <li key={c.conceptId} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-medium">{c.name}</span>
                    <ConceptStateBadge state={c.state} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Nothing yet. Mira adds each idea here once you&apos;ve talked it
                through, and marks it practiced after an activity.
              </p>
            )}
          </RailCard>

          <RailCard order={3} icon={<Sparkles />} tone="honey" title="Explore next" hint="Related blocks">
            <ul className="flex flex-col gap-1">
              {next.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/learn/${b.id}`}
                    className="squircle-md group -mx-1.5 flex items-center gap-3 p-1.5 outline-none transition-colors hover:bg-ink/[0.04] focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="squircle-sm relative size-11 shrink-0 overflow-hidden">
                      <Image src={b.image.src} alt="" fill sizes="44px" className="object-cover" />
                    </span>
                    <span className="line-clamp-2 min-w-0 flex-1 text-sm leading-snug font-medium text-foreground/85 group-hover:text-foreground">
                      {b.question}
                    </span>
                    <ArrowRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </RailCard>

          {session && (
            <Button asChild variant="secondary" size="lg" className="w-full sm:hidden">
              <Link href={`/sessions/${session.id}`}>End and recap</Link>
            </Button>
          )}
        </aside>
      </div>
    </>
  );
}
