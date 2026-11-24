import {
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Force,
  type SimulationNodeDatum,
} from "d3-force";
import type { LearningGraph } from "@/lib/data";

// Learning-graph layout. The API's positions only seed a d3-force simulation that also knows
// each node's label footprint, so nodes, labels and edges spread out instead of piling up.
// d3-force is deterministic for the same input, so server and client draw the same picture.

export const NODE_RADIUS = { base: 12, recent: 15 } as const;
/** Label baseline sits this far below the node's edge. */
export const LABEL_OFFSET = 30;
export const LABEL_FONT_SIZE = 22;

const WIDTH = 1000;
const HEIGHT = 620;
/** Rough average glyph width for the label face at LABEL_FONT_SIZE. */
const CHAR_WIDTH = LABEL_FONT_SIZE * 0.56;
const GAP = 14;

type Node = SimulationNodeDatum & {
  id: string;
  /** Collision box around the node centre: half width, extent above and below. */
  half: number;
  up: number;
  down: number;
};

export type GraphLayout = {
  position: (id: string) => { x: number; y: number } | undefined;
  viewBox: string;
};

/** Axis-aligned box collision, so wide labels repel sideways and stacked labels vertically. */
function forceBoxes(iterations = 2): Force<Node, undefined> {
  let nodes: Node[] = [];
  const force = () => {
    for (let k = 0; k < iterations; k++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          // Deterministic nudge when two nodes share a coordinate.
          const dx = b.x! - a.x! || (j - i) * 1e-3;
          const dy = b.y! - a.y! || (j - i) * 1e-3;
          const ox = a.half + b.half - Math.abs(dx);
          const oy = dy > 0 ? a.down + b.up - dy : b.down + a.up + dy;
          if (ox <= 0 || oy <= 0) continue;
          // Resolve along the axis that needs the smaller move.
          if (ox < oy * 1.6) {
            const m = (ox / 2) * Math.sign(dx);
            a.x! -= m;
            b.x! += m;
          } else {
            const m = (oy / 2) * Math.sign(dy);
            a.y! -= m;
            b.y! += m;
          }
        }
      }
    }
  };
  force.initialize = (n: Node[]) => {
    nodes = n;
  };
  return force;
}

function compute(graph: LearningGraph, labels: boolean): GraphLayout {
  const nodes: Node[] = graph.concepts.map((c) => {
    const r = c.recent ? NODE_RADIUS.recent : NODE_RADIUS.base;
    const halo = r + 14;
    return {
      id: c.id,
      x: c.x,
      y: c.y,
      half: Math.max(halo, labels ? (c.label.length * CHAR_WIDTH) / 2 : 0) + GAP,
      up: halo + GAP,
      down: (labels ? r + LABEL_OFFSET + 8 : halo) + GAP,
    };
  });
  const ids = new Set(nodes.map((n) => n.id));
  const links = graph.links
    .filter((l) => ids.has(l.from) && ids.has(l.to))
    .map((l) => ({ source: l.from, target: l.to, semantic: l.kind === "semantic" }));

  const simulation = forceSimulation(nodes)
    .force(
      "link",
      forceLink<Node, (typeof links)[number]>(links)
        .id((d) => d.id)
        .distance((l) => (l.semantic ? 190 : 150))
        .strength(0.35),
    )
    .force("charge", forceManyBody<Node>().strength(labels ? -900 : -500).distanceMax(700))
    .force("x", forceX<Node>(WIDTH / 2).strength(0.04))
    .force("y", forceY<Node>(HEIGHT / 2).strength(0.07))
    .force("boxes", forceBoxes())
    .stop();
  simulation.tick(360);
  // Settle any overlap the last gentle ticks left behind.
  const settle = forceBoxes(12);
  settle.initialize?.(nodes, () => 0.5);
  settle(0);

  // Fit the view to the content at the canvas aspect ratio; never zoom in past design scale.
  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const n of nodes) {
    minX = Math.min(minX, n.x! - n.half);
    maxX = Math.max(maxX, n.x! + n.half);
    minY = Math.min(minY, n.y! - n.up);
    maxY = Math.max(maxY, n.y! + n.down);
  }
  if (!nodes.length) [minX, minY, maxX, maxY] = [0, 0, WIDTH, HEIGHT];
  const width = Math.max(maxX - minX, ((maxY - minY) * WIDTH) / HEIGHT, WIDTH);
  const height = (width * HEIGHT) / WIDTH;
  const x = (minX + maxX - width) / 2;
  const y = (minY + maxY - height) / 2;

  const byId = new Map(nodes.map((n) => [n.id, { x: n.x!, y: n.y! }]));
  return {
    position: (id) => byId.get(id),
    viewBox: [x, y, width, height].map((v) => Math.round(v * 10) / 10).join(" "),
  };
}

const memo = new WeakMap<LearningGraph, { labels?: GraphLayout; plain?: GraphLayout }>();

/** Layout for a graph, memoised per graph object (selection re-renders reuse it). */
export function layoutGraph(graph: LearningGraph, labels: boolean): GraphLayout {
  const entry = memo.get(graph) ?? {};
  memo.set(graph, entry);
  const key = labels ? "labels" : "plain";
  return (entry[key] ??= compute(graph, labels));
}
