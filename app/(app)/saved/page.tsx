import type { Metadata } from "next";
import { PageFrame, PageHeader } from "@/components/wonderstruck/page-header";
import { SavedGrid } from "@/components/wonderstruck/saved-grid";
import { getSavedBlocks } from "@/lib/data";

export const metadata: Metadata = { title: "Saved" };

export default async function SavedPage() {
  const saved = await getSavedBlocks();
  return (
    <PageFrame>
      <PageHeader
        title="Saved"
        description="Ideas you set aside for later. No pressure, they'll wait."
      />
      <div className="mt-7">
        <SavedGrid saved={saved} />
      </div>
    </PageFrame>
  );
}
