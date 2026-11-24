import { Suspense } from "react";
import type { Metadata } from "next";
import { DynamicMarker } from "@/components/wonderstruck/dynamic-marker";
import { PageFrame } from "@/components/wonderstruck/page-header";
import { getBlock } from "@/lib/data";
import { LearnView } from "./learn-view";
import { LearnSkeleton } from "@/components/wonderstruck/skeletons";

type Props = { params: Promise<{ blockId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const block = await getBlock((await params).blockId);
  return { title: block?.question ?? "Learning block" };
}

export default function LearnPage() {
  return (
    <PageFrame>
      <Suspense>
        <DynamicMarker />
      </Suspense>
      <Suspense fallback={<LearnSkeleton />}>
        <LearnView />
      </Suspense>
    </PageFrame>
  );
}
