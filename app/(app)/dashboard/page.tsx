import type { Metadata } from "next";
import { ContinueCard } from "@/components/wonderstruck/continue-card";
import { DiscoverRow } from "@/components/wonderstruck/discover-row";
import { GraphSnapshot } from "@/components/wonderstruck/graph-snapshot";
import { Hero } from "@/components/wonderstruck/hero";
import { LearningModes } from "@/components/wonderstruck/learning-modes";
import { RecallCard } from "@/components/wonderstruck/recall-card";
import { RecentSessions } from "@/components/wonderstruck/recent-sessions";
import { Rise } from "@/components/wonderstruck/rise";
import { TopBar } from "@/components/wonderstruck/top-bar";
import {
  getBlocks,
  getGraph,
  getLearner,
  getLearningModes,
  getRecallQueue,
  getSessions,
} from "@/lib/data";

export const metadata: Metadata = { title: "Today" };

export default async function DashboardPage() {
  const [learner, sessions, recall, blocks, graph, modes] = await Promise.all([
    getLearner(),
    getSessions(),
    getRecallQueue(),
    getBlocks(),
    getGraph(),
    getLearningModes(),
  ]);
  const active = sessions.find((s) => s.status === "active");
  const recent = sessions.filter((s) => s.status === "finished").slice(0, 4);
  const exploredBlocks = new Set(sessions.map((s) => s.blockId));
  // Unexplored first; top up with explored blocks so the row stays full.
  const fresh = [
    ...blocks.filter((b) => !exploredBlocks.has(b.id)),
    ...blocks.filter((b) => exploredBlocks.has(b.id)),
  ].slice(0, 3);

  return (
    <div className="w-full px-4 pt-6 pb-14 sm:px-6 lg:px-8 lg:pt-6">
      <Rise order={0}>
        <TopBar recallDue={recall.length} conceptCount={graph.concepts.length} />
      </Rise>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_21.5rem] xl:gap-7">
        <div className="flex min-w-0 flex-col gap-8">
          <Rise order={1}>
            <Hero learner={learner} />
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
          <Rise order={3}>
            <RecentSessions sessions={recent} />
          </Rise>
          <Rise order={4}>
            <GraphSnapshot graph={graph} />
          </Rise>
        </aside>
      </div>

      <DemoNote />
    </div>
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
