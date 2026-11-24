import type { LearningGraph } from "@/lib/data";
import { LABEL_OFFSET, layoutGraph, NODE_RADIUS } from "@/lib/graph-layout";
import { cn } from "@/lib/utils";

/**
 * Presentational learning-graph SVG. Interactive when `onSelect` is passed
 * (client usage); otherwise a static picture (server usage).
 */
export function GraphCanvas({
  graph,
  title,
  labels = false,
  selectedId,
  onSelect,
  className,
}: {
  graph: LearningGraph;
  title: string;
  labels?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const layout = layoutGraph(graph, labels);
  const neighbours = new Set(
    selectedId
      ? graph.links.flatMap((l) =>
          l.from === selectedId ? [l.to] : l.to === selectedId ? [l.from] : [],
        )
      : [],
  );
  const dim = (id: string) =>
    selectedId != null && id !== selectedId && !neighbours.has(id);

  return (
    <svg
      viewBox={layout.viewBox}
      role={onSelect ? "group" : "img"}
      aria-label={title}
      className={cn("h-auto w-full overflow-visible", className)}
    >
      {graph.links.map((l) => {
        const a = layout.position(l.from);
        const b = layout.position(l.to);
        if (!a || !b) return null;
        const semantic = l.kind === "semantic";
        const touches = selectedId === l.from || selectedId === l.to;
        return (
          <line
            key={`${l.from}-${l.to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            strokeWidth={semantic ? 3 : 2.5}
            strokeDasharray={semantic ? "10 10" : undefined}
            strokeLinecap="round"
            className={cn(
              "transition-opacity duration-200",
              semantic ? "stroke-primary/70" : "stroke-white/25",
              touches && (semantic ? "stroke-primary" : "stroke-white/60"),
              selectedId && !touches && "opacity-25",
            )}
          />
        );
      })}

      {graph.concepts.map((c) => {
        const { x, y } = layout.position(c.id)!;
        const selected = c.id === selectedId;
        const r = c.recent ? NODE_RADIUS.recent : NODE_RADIUS.base;
        const node = (
          <>
            {(c.recent || selected) && (
              <circle
                cx={x}
                cy={y}
                r={r + 14}
                className={selected ? "fill-primary/25" : "fill-primary/15"}
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={r}
              className={cn(
                c.recent || selected ? "fill-primary" : "fill-tint-teal",
                selected && "stroke-background stroke-[3]",
              )}
            />
            {labels && (
              <text
                x={x}
                y={y + r + LABEL_OFFSET}
                textAnchor="middle"
                className={cn(
                  "fill-foreground/85 stroke-[oklch(0.2_0.03_225)] text-[22px] font-medium [paint-order:stroke] [stroke-linejoin:round] [stroke-width:8px]",
                  selected && "fill-foreground",
                )}
              >
                {c.label}
              </text>
            )}
          </>
        );

        if (!onSelect)
          return (
            <g key={c.id} aria-hidden>
              {node}
            </g>
          );

        return (
          <g
            key={c.id}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            aria-label={`${c.label}, ${c.state}`}
            onClick={() => onSelect(c.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(c.id);
              }
            }}
            className={cn(
              "cursor-pointer outline-none transition-opacity duration-200 [&:focus-visible>circle:last-of-type]:stroke-ring [&:focus-visible>circle:last-of-type]:stroke-[4]",
              dim(c.id) && "opacity-35",
            )}
          >
            <circle cx={x} cy={y} r={36} className="fill-transparent" />
            {node}
          </g>
        );
      })}
    </svg>
  );
}
