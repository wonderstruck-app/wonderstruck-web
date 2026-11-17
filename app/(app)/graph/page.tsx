import type { Metadata } from "next";
import { GraphExplorer } from "@/components/wonderstruck/graph-explorer";
import { PageFrame, PageHeader } from "@/components/wonderstruck/page-header";
import { getGraph } from "@/lib/data";

export const metadata: Metadata = { title: "Learning graph" };

export default async function GraphPage() {
  const graph = await getGraph();
  const semantic = graph.links.filter((l) => l.kind === "semantic").length;

  return (
    <PageFrame>
      <PageHeader
        title="Your learning graph"
        description={`${graph.concepts.length} concepts from ${graph.sessions.length} sessions. Mira links ideas that are close in meaning, even when you met them in different places. ${semantic} such links so far.`}
      />
      <div className="mt-7">
        <GraphExplorer graph={graph} />
      </div>
    </PageFrame>
  );
}
