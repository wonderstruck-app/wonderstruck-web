import type { Metadata } from "next";
import { Suspense } from "react";
import { LearnerFirstName, NamePlaceholder } from "@/components/wonderstruck/learner";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = { title: "Today" };

export default function DashboardPage() {
  return (
    <DashboardView
      name={
        <Suspense fallback={<NamePlaceholder />}>
          <LearnerFirstName />
        </Suspense>
      }
    />
  );
}
