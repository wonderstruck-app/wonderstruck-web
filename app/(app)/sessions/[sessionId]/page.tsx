import { Suspense } from "react";
import type { Metadata } from "next";
import { DynamicMarker } from "@/components/wonderstruck/dynamic-marker";
import { PageFrame } from "@/components/wonderstruck/page-header";
import { getSession } from "@/lib/data";
import { SessionView } from "./session-view";
import { RecapSkeleton } from "@/components/wonderstruck/skeletons";

type Props = { params: Promise<{ sessionId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getSession((await params).sessionId);
  return { title: s ? `${s.title} · Recap` : "Session" };
}

export default function SessionPage() {
  return (
    <PageFrame accent="accent-green">
      <Suspense>
        <DynamicMarker />
      </Suspense>
      <Suspense fallback={<RecapSkeleton />}>
        <SessionView />
      </Suspense>
    </PageFrame>
  );
}
