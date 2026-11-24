"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ContinueCard } from "@/components/wonderstruck/continue-card";
import { DiscoverRow } from "@/components/wonderstruck/discover-row";
import { GraphSnapshot } from "@/components/wonderstruck/graph-snapshot";
import { Hero } from "@/components/wonderstruck/hero";
import { LearningModes } from "@/components/wonderstruck/learning-modes";
import { RecallCard } from "@/components/wonderstruck/recall-card";
import { RecentSessions } from "@/components/wonderstruck/recent-sessions";
import { Settled } from "@/components/wonderstruck/skeleton";
import { DashboardSkeleton } from "@/components/wonderstruck/skeletons";
import { useLoadedLate } from "@/lib/use-loaded-late";
import { Rise } from "@/components/wonderstruck/rise";
import { TopBar } from "@/components/wonderstruck/top-bar";
import { learningModes } from "@/lib/data/derive";
import { q } from "@/lib/data/queries";

/** Today. `name` is the learner's first name, streamed from the server session. */
export function DashboardView({ name }: { name: ReactNode }) {
  const { data: sessions } = useQuery(q.sessions());
  const { data: recall } = useQuery(q.recallQueue());
  const { data: blocks } = useQuery(q.blocks());
  const { data: graph } = useQuery(q.graph());
  const late = useLoadedLate(!!(sessions && recall && blocks && graph));
  if (!sessions || !recall || !blocks || !graph) return <DashboardSkeleton name={name} />;

  const modes = learningModes(blocks, recall, sessions);
  const active = sessions.find((s) => s.status === "active");
  const recent = sessions.filter((s) => s.status === "finished").slice(0, 4);
  const exploredBlocks = new Set(sessions.map((s) => s.blockId));
  // Unexplored first; top up with explored blocks so the row stays full.
  const fresh = [
    ...blocks.filter((b) => !exploredBlocks.has(b.id)),
    ...blocks.filter((b) => exploredBlocks.has(b.id)),
  ].slice(0, 3);

  return (
    <Settled late={late}>
      <div className="w-full px-4 pt-6 pb-14 sm:px-6 lg:px-8 lg:pt-6">
        <Rise order={0}>
          <TopBar recallDue={recall.length} conceptCount={graph.concepts.length} />
        </Rise>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_21.5rem] xl:gap-7">
          <div className="flex min-w-0 flex-col gap-8">
            <Rise order={1}>
              <Hero name={name} />
            </Rise>
            {active && (
              <Rise order={2}>
                <ContinueCard session={active} />
              </Rise>
            )}
            <Rise order={3}>
              <LearningModes modes={modes} />
            </Rise>
            <Rise order={4}>
              <DiscoverRow blocks={fresh} />
            </Rise>
          </div>

          <aside
            aria-label="Your learning"
            className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-5 md:grid-cols-2 xl:grid-cols-1"
          >
            <Rise order={2} className="md:row-span-2 xl:row-span-1">
              <RecallCard queue={recall} />
            </Rise>
            <Rise order={3} className="max-md:hidden">
              <RecentSessions sessions={recent} />
            </Rise>
            <Rise order={4}>
              <GraphSnapshot graph={graph} />
            </Rise>
          </aside>
        </div>

        <DemoNote />
      </div>
    </Settled>
  );
}

function DemoNote() {
  return (
    <p className="mt-12 text-center text-xs text-muted-foreground/80">
      Preview with demo data. Sessions, recall, and graph content are
      illustrative.
    </p>
  );
}
