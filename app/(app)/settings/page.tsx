import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MiraMascot } from "@/components/wonderstruck/brand";
import { PageFrame, PageHeader, WithRail } from "@/components/wonderstruck/page-header";
import { RailCard } from "@/components/wonderstruck/rail-card";
import { LearnerProfile, ProfilePlaceholder } from "@/components/wonderstruck/learner";
import { Section } from "@/components/wonderstruck/settings-form";
import { SettingsData, YourDataStats } from "./settings-view";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {

  return (
    <PageFrame>
      <WithRail
        railLabel="Your data"
        rail={
          <>
            <RailCard
              order={1}
              featured
              icon={<ShieldCheck />}
              essential={false}
              title="Your learning stays yours"
              hint="Nothing is shared or sold"
            >
              <div className="flex items-end gap-3">
                <p className="flex-1 text-sm leading-relaxed text-foreground/80">
                  Mira only uses your sessions to explain things better for
                  you. You can see, export, or delete all of it.
                </p>
                <MiraMascot width={60} className="-mb-1 shrink-0" />
              </div>
              <YourDataStats />
              <Button asChild variant="secondary" className="mt-4">
                <Link href="/remember">Review what Mira remembers</Link>
              </Button>
            </RailCard>
          </>
        }
      >
        <PageHeader
          title="Settings"
          description="Shape what Mira suggests, how it sounds, and what it keeps."
        />
        {/* The session read stays in this server tree: a Suspense passed through a client
            component's props is invisible to instant validation. */}
        <div className="mt-7 flex flex-col gap-6">
          <Suspense
            fallback={
              <Section title="Profile">
                <ProfilePlaceholder />
              </Section>
            }
          >
            <Section title="Profile">
              <LearnerProfile />
            </Section>
          </Suspense>
          <SettingsData />
        </div>
      </WithRail>
    </PageFrame>
  );
}
