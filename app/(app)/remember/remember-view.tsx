"use client";

import type { ReactNode } from "react";
import { Brain, CircleCheck, History, RotateCcw } from "lucide-react";
import { IconKey, type IconTone } from "@/components/wonderstruck/icon-key";
import { Tinted } from "@/components/wonderstruck/tinted";
import { RailCard } from "@/components/wonderstruck/rail-card";
import { Rise } from "@/components/wonderstruck/rise";
import { MemoryList } from "@/components/wonderstruck/memory-list";
import { PageFrame, PageHeader, WithRail } from "@/components/wonderstruck/page-header";
import { WhyItWorks } from "@/components/wonderstruck/why-it-works";
import { RecallSession } from "@/components/wonderstruck/recall-session";
import { useQuery } from "@tanstack/react-query";
import { Settled } from "@/components/wonderstruck/skeleton";
import { RememberSkeleton } from "@/components/wonderstruck/skeletons";
import { useLoadedLate } from "@/lib/use-loaded-late";
import { q } from "@/lib/data/queries";
import { inline } from "@/lib/data/labels";

export function RememberView() {
  const { data: queue } = useQuery(q.recallQueue());
  const { data: history } = useQuery(q.reviewHistory());
  const { data: memory } = useQuery(q.memory());
  const late = useLoadedLate(!!(queue && history && memory));
  if (!queue || !history || !memory) return <RememberSkeleton />;

  const recalled = history.filter((r) => r.outcome === "recalled").length;
  const missed = history.length - recalled;

  return (
    <Settled late={late}>
      <PageFrame accent="accent-violet">
        <WithRail
          railLabel="Your memory"
          rail={
            <>
              <RailCard
                order={1}
                icon={<History />}
                tone="violet"
                essential={false}
                title="Recent reviews"
                hint={`${recalled} of ${history.length} recalled`}
              >
                <ul className="flex flex-col divide-y divide-ink/6">
                  {history.map((r) => (
                    <li key={r.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                      {r.outcome === "recalled" ? (
                        <CircleCheck aria-hidden className="size-5 shrink-0 text-success" />
                      ) : (
                        <RotateCcw aria-hidden className="size-5 shrink-0 text-tint-rose" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.9375rem] font-medium">{r.concept}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.outcome === "recalled" ? "Recalled" : "Missed"}{" "}
                          {inline(r.whenLabel)} · due {r.nextLabel.toLowerCase()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </RailCard>

              <RailCard
                order={2}
                icon={<Brain />}
                title="What Mira remembers"
                hint="Used to adapt explanations"
              >
                <p className="-mt-1 mb-3 text-sm leading-relaxed text-muted-foreground">
                  Remove anything you&apos;d rather Mira forgot.
                </p>
                <MemoryList items={memory} />
              </RailCard>
            </>
          }
        >
          <PageHeader
            title="Recall"
            description="A few quick questions on things you explored. Pulling an idea back from memory is what makes it stick."
          />
          <Rise order={1} className="mt-7 grid grid-cols-3 gap-2.5 sm:gap-3">
            <Stat tone="violet" icon={<RotateCcw />} value={queue.length} label="Due now" />
            <Stat tone="green" icon={<CircleCheck />} value={`${recalled}/${history.length}`} label="Recalled lately" />
            <Stat tone="rose" icon={<History />} value={missed} label="Coming back sooner" />
          </Rise>
          <div className="mt-4 sm:mt-5">
            <RecallSession queue={queue} />
          </div>
          <WhyItWorks />
        </WithRail>
      </PageFrame>
    </Settled>
  );
}

function Stat({ tone, icon, value, label }: { tone: IconTone; icon: ReactNode; value: ReactNode; label: string }) {
  return (
    <Tinted tone={tone} className="squircle-md flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:p-4">
      <IconKey tone={tone} size="sm" className="max-sm:hidden">
        {icon}
      </IconKey>
      <div className="min-w-0">
        <p className="text-[1.375rem] leading-none font-semibold tabular-nums" style={{ color: "var(--t)" }}>
          {value}
        </p>
        <p className="mt-1.5 text-xs leading-snug font-medium text-muted-foreground sm:text-sm">{label}</p>
      </div>
    </Tinted>
  );
}
