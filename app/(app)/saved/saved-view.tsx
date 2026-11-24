"use client";

import { PageFrame, PageHeader } from "@/components/wonderstruck/page-header";
import { SavedGrid } from "@/components/wonderstruck/saved-grid";
import { useQuery } from "@tanstack/react-query";
import { Settled } from "@/components/wonderstruck/skeleton";
import { SavedSkeleton } from "@/components/wonderstruck/skeletons";
import { useLoadedLate } from "@/lib/use-loaded-late";
import { q } from "@/lib/data/queries";

export function SavedView() {
  const { data: saved } = useQuery(q.saved());
  const late = useLoadedLate(!!saved);
  if (!saved) return <SavedSkeleton />;
  return (
    <Settled late={late}>
      <PageFrame accent="accent-rose">
        <PageHeader
          title="Saved"
          description="Ideas you set aside for later. No pressure, they'll wait."
        />
        <div className="mt-7">
          <SavedGrid saved={saved} />
        </div>
      </PageFrame>
    </Settled>
  );
}
