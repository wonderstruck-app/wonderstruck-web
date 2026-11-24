import type { Metadata } from "next";
import { GraphView } from "./graph-view";

export const metadata: Metadata = { title: "Learning graph" };

export default function GraphPage() {
  return <GraphView />;
}
