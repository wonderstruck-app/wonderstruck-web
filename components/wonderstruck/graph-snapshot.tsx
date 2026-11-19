import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LearningGraph } from "@/lib/data";
import { GraphCanvas } from "./graph-canvas";

export function GraphSnapshot({ graph }: { graph: LearningGraph }) {
  const label = (id: string) => graph.concepts.find((c) => c.id === id)?.label;
  const newest = graph.links.find(
    (l) =>
      l.kind === "semantic" &&
      graph.concepts.some((c) => c.recent && (c.id === l.from || c.id === l.to)),
  );

  return (
    <section
      aria-labelledby="graph-title"
      className="dark squircle-lg relative isolate overflow-hidden border border-tint-teal/20 text-foreground bg-[linear-gradient(160deg,oklch(0.26_0.05_215),oklch(0.2_0.03_240))] p-5 sm:p-6"
    >
      <h2 id="graph-title" className="sr-only">
        Your learning graph
      </h2>
      <GraphCanvas
        graph={graph}
        title={`Preview of your learning graph: ${graph.concepts.length} concepts from ${graph.sessions.length} sessions.`}
      />
      {newest && (
        <>
          <p className="mt-3 text-xs font-semibold text-tint-teal">
            New connection
          </p>
          <p className="mt-1 text-[1.0625rem] leading-snug font-bold">
            {label(newest.from)} ↔ {label(newest.to)}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/70">
            Related in meaning across two sessions. A semantic link, not a
            prerequisite.
          </p>
        </>
      )}
      <Button asChild className="mt-4 w-full">
        <Link href="/graph">Open your graph</Link>
      </Button>
    </section>
  );
}
