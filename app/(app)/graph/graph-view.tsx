"use client";

import { GraphExplorer } from "@/components/wonderstruck/graph-explorer";
import { PageFrame, PageHeader } from "@/components/wonderstruck/page-header";
import { useQuery } from "@tanstack/react-query";
import { Settled } from "@/components/wonderstruck/skeleton";
import { GraphSkeleton } from "@/components/wonderstruck/skeletons";
import { useLoadedLate } from "@/lib/use-loaded-late";
import { q } from "@/lib/data/queries";

export function GraphView() {
  const { data: graph } = useQuery(q.graph());
  const late = useLoadedLate(!!graph);
  if (!graph) return <GraphSkeleton />;
  const semantic = graph.links.filter((l) => l.kind === "semantic").length;

  return (
    <Settled late={late}>
      <PageFrame accent="accent-teal">
        <PageHeader
          title="Your learning graph"
          description={`${graph.concepts.length} concepts from ${graph.sessions.length} sessions. Mira links ideas that are close in meaning, even when you met them in different places. ${semantic} such links so far.`}
        />
        <div className="mt-7">
          <GraphExplorer graph={graph} />
        </div>
      </PageFrame>
    </Settled>
  );
}
