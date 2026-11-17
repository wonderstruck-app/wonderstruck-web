"use client";

import { useState } from "react";
import Link from "next/link";
import { List, Map as MapIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Concept, LearningGraph } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ConceptStateBadge } from "./concept-state";
import { GraphCanvas } from "./graph-canvas";

export function GraphExplorer({ graph }: { graph: LearningGraph }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    graph.concepts.find((c) => c.recent)?.id ?? null,
  );
  const selected = graph.concepts.find((c) => c.id === selectedId) ?? null;
  const toggle = (id: string) => setSelectedId((cur) => (cur === id ? null : id));

  return (
    <Tabs defaultValue="map">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList aria-label="Graph view">
          <TabsTrigger value="map">
            <MapIcon aria-hidden />
            Map
          </TabsTrigger>
          <TabsTrigger value="list">
            <List aria-hidden />
            List
          </TabsTrigger>
        </TabsList>
        <Legend />
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <TabsContent value="map" className="min-w-0">
          <div className="squircle-lg overflow-hidden border border-tint-blue/20 bg-[radial-gradient(90%_80%_at_50%_40%,oklch(0.24_0.05_260),oklch(0.17_0.015_265))] p-4 sm:p-8">
            <GraphCanvas
              graph={graph}
              labels
              title="Your learning graph. Select a concept to see its connections."
              selectedId={selectedId}
              onSelect={toggle}
            />
          </div>
        </TabsContent>
        <TabsContent value="list" className="min-w-0">
          <ConceptList graph={graph} selectedId={selectedId} onSelect={setSelectedId} />
        </TabsContent>

        <Detail graph={graph} concept={selected} onSelect={setSelectedId} />
      </div>
    </Tabs>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
      <li className="flex items-center gap-2">
        <svg width="28" height="6" aria-hidden>
          <line x1="2" y1="3" x2="26" y2="3" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round" className="stroke-primary" />
        </svg>
        Related in meaning
      </li>
      <li className="flex items-center gap-2">
        <svg width="28" height="6" aria-hidden>
          <line x1="2" y1="3" x2="26" y2="3" strokeWidth="2.5" strokeLinecap="round" className="stroke-white/40" />
        </svg>
        Same session
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden className="size-2.5 rounded-full bg-primary" />
        New this week
      </li>
    </ul>
  );
}

function ConceptList({
  graph,
  selectedId,
  onSelect,
}: {
  graph: LearningGraph;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const topics = [...new Set(graph.concepts.map((c) => c.topic))].sort();
  return (
    <div className="flex flex-col gap-6">
      {topics.map((t) => (
        <section key={t} aria-label={t}>
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{t}</h3>
          <ul className="flex flex-col gap-2">
            {graph.concepts
              .filter((c) => c.topic === t)
              .map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-pressed={c.id === selectedId}
                    onClick={() => onSelect(c.id)}
                    className={cn(
                      "squircle-md flex min-h-14 w-full items-center gap-3 border px-4 py-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      c.id === selectedId
                        ? "border-primary/50 bg-primary/8"
                        : "border-border bg-card hover:border-input",
                    )}
                  >
                    <span className="flex-1 font-medium">{c.label}</span>
                    <ConceptStateBadge state={c.state} />
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Detail({
  graph,
  concept: c,
  onSelect,
}: {
  graph: LearningGraph;
  concept: Concept | null;
  onSelect: (id: string) => void;
}) {
  if (!c)
    return (
      <aside className="squircle-lg flex items-center justify-center border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Select a concept to see what it connects to.
      </aside>
    );

  const links = graph.links.filter((l) => l.from === c.id || l.to === c.id);
  const label = (id: string) => graph.concepts.find((x) => x.id === id)?.label ?? id;
  const sessions = graph.sessions.filter((s) => c.sessionIds.includes(s.id));

  return (
    <aside
      aria-live="polite"
      aria-label={`${c.label} details`}
      className="surface squircle-lg self-start p-5 xl:sticky xl:top-8"
    >
      <p className="text-xs font-semibold text-muted-foreground">{c.topic}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <h2 className="text-[1.25rem] leading-snug font-bold">{c.label}</h2>
        <ConceptStateBadge state={c.state} />
      </div>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-foreground/80">{c.summary}</p>

      <h3 className="mt-5 text-sm font-semibold text-muted-foreground">Connections</h3>
      <ul className="mt-2 flex flex-col gap-2">
        {links.map((l) => {
          const other = l.from === c.id ? l.to : l.from;
          return (
            <li key={`${l.from}-${l.to}`}>
              <button
                type="button"
                onClick={() => onSelect(other)}
                className="squircle-sm w-full border border-border p-3 text-left transition-colors outline-none hover:border-input hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{label(other)}</span>
                  <span className={cn("shrink-0 text-xs font-semibold", l.kind === "semantic" ? "text-primary" : "text-muted-foreground")}>
                    {l.kind === "semantic"
                      ? `Related · ${Math.round((l.similarity ?? 0) * 100)}%`
                      : "Same session"}
                  </span>
                </span>
                <span className="mt-1 block text-sm leading-snug text-muted-foreground">{l.rationale}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {links.some((l) => l.kind === "semantic") && (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          “Related” means close in meaning, not that one is needed to learn the other.
        </p>
      )}

      <h3 className="mt-5 text-sm font-semibold text-muted-foreground">From sessions</h3>
      <ul className="mt-1.5 flex flex-col gap-1">
        {sessions.map((s) => (
          <li key={s.id}>
            <Link href={`/sessions/${s.id}`} className="text-sm font-semibold text-primary hover:underline">
              {s.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
