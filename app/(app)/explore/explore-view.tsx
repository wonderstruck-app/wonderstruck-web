"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RailCard } from "@/components/wonderstruck/rail-card";
import { SessionCanvas } from "@/components/wonderstruck/session-canvas";
import { useQuery } from "@tanstack/react-query";
import { Settled } from "@/components/wonderstruck/skeleton";
import { ExploreSkeleton } from "@/components/wonderstruck/skeletons";
import { useLoadedLate } from "@/lib/use-loaded-late";
import { q } from "@/lib/data/queries";

export function ExploreView() {
  const { data: sessions } = useQuery(q.sessions());
  const { data: blocks } = useQuery(q.blocks());
  const late = useLoadedLate(!!(sessions && blocks));
  if (!sessions || !blocks) return <ExploreSkeleton />;
  const active = sessions.find((s) => s.status === "active");
  const explored = new Set(sessions.map((s) => s.blockId));
  const sparks = blocks.filter((b) => !explored.has(b.id)).slice(0, 3);

  return (
    <Settled late={late}>
      <div className="flex w-full flex-col px-4 pt-4 pb-6 sm:px-6 lg:h-dvh lg:px-8 lg:pt-6">
        <header className="flex min-h-12 items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[1.125rem] leading-snug font-semibold sm:text-[1.3125rem]">
              Ask Mira anything
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              Talk out loud or type. Interrupt whenever you like.
            </p>
          </div>
          <span className="hidden shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline">
            Preview
          </span>
        </header>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_21rem] xl:gap-8 2xl:grid-cols-[minmax(0,1fr)_23rem]">
          <SessionCanvas
            initialMessages={[]}
            opening="Hi, I'm Mira. Ask me about anything you're curious about. I'll ask questions back so you work it out, not just hear it."
            suggestions={[
              "Why are sunsets orange?",
              "How do vaccines train the immune system?",
              "What actually is entropy?",
            ]}
          />

          <aside
            aria-label="Pick up a thread"
            className="flex min-w-0 flex-col gap-5 lg:min-h-0 lg:overflow-y-auto lg:pb-1 [scrollbar-width:thin]"
          >
            {active && (
              <RailCard
                order={1}
                featured
                icon={<Play />}
                tone="green"
                title="Pick up where you left off"
                hint={`${active.minutes} min so far`}
              >
                <Link
                  href={`/explore/${active.blockId}`}
                  className="squircle-md group relative block aspect-[16/9] overflow-hidden"
                >
                  <Image
                    src={active.image.src}
                    alt=""
                    fill
                    sizes="384px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  <span className="absolute inset-x-3 bottom-2.5 text-sm leading-snug font-medium text-white">
                    {active.title}
                  </span>
                </Link>
                <Button asChild className="mt-4 w-full">
                  <Link href={`/explore/${active.blockId}`}>Resume session</Link>
                </Button>
              </RailCard>
            )}
            <RailCard
              order={2}
              icon={<Sparkles />}
              title="Or start from a spark"
              hint="Fresh from Discover"
            >
              <ul className="flex flex-col gap-2">
                {sparks.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/learn/${b.id}`}
                      className="squircle-md group flex items-center gap-3 p-1.5 transition-colors hover:bg-ink/[0.04]"
                    >
                      <span className="squircle-sm relative size-12 shrink-0 overflow-hidden">
                        <Image
                          src={b.image.src}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>
                      <span className="line-clamp-2 text-sm leading-snug font-medium text-foreground/85 group-hover:text-foreground">
                        {b.question}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </RailCard>
          </aside>
        </div>
      </div>
    </Settled>
  );
}
