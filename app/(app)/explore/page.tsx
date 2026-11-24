import type { Metadata } from "next";
import { ExploreView } from "./explore-view";

export const metadata: Metadata = { title: "Explore with Mira" };

export default function ExplorePage() {
  return <ExploreView />;
}
