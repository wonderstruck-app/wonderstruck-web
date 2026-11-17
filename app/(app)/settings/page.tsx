import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MiraMascot } from "@/components/wonderstruck/brand";
import { PageFrame, PageHeader, WithRail } from "@/components/wonderstruck/page-header";
import { RailCard } from "@/components/wonderstruck/rail-card";
import { SettingsForm } from "@/components/wonderstruck/settings-form";
import { getGraph, getLearner, getMemory, getSessions, getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [learner, settings, sessions, graph, memory] = await Promise.all([
    getLearner(),
    getSettings(),
    getSessions(),
    getGraph(),
    getMemory(),
  ]);

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
              <dl className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ["Sessions", sessions.length],
                  ["Concepts", graph.concepts.length],
                  ["Memories", memory.length],
                ].map(([k, v]) => (
                  <div key={k} className="squircle-md border border-white/6 bg-background/50 px-3 py-2.5">
                    <dt className="text-[0.6875rem] font-semibold text-muted-foreground">{k}</dt>
                    <dd className="mt-0.5 text-[1.375rem] font-bold tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
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
        <div className="mt-7">
          <SettingsForm learner={learner} settings={settings} />
        </div>
      </WithRail>
    </PageFrame>
  );
}
