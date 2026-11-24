import { Suspense } from "react";
import type { Metadata } from "next";
import { DynamicMarker } from "@/components/wonderstruck/dynamic-marker";
import { getBlock } from "@/lib/data";
import { ExploreSessionView } from "./explore-session-view";
import { ExploreSessionSkeleton } from "@/components/wonderstruck/skeletons";

type Props = { params: Promise<{ blockId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const block = await getBlock((await params).blockId);
  return { title: block ? `Exploring: ${block.question}` : "Session" };
}

export default function ExploreSessionPage() {
  return (
    <div className="flex w-full flex-col px-4 pt-4 pb-6 sm:px-6 lg:h-dvh lg:px-8 lg:pt-6">
      <Suspense>
        <DynamicMarker />
      </Suspense>
      <Suspense fallback={<ExploreSessionSkeleton />}>
        <ExploreSessionView />
      </Suspense>
    </div>
  );
}
