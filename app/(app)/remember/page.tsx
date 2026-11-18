import type { Metadata } from "next";
import { Brain, CircleCheck, History, Lightbulb, RotateCcw, Timer, Waypoints } from "lucide-react";
import { IconKey } from "@/components/wonderstruck/icon-key";
import { RailCard } from "@/components/wonderstruck/rail-card";
import { Rise } from "@/components/wonderstruck/rise";
import { MemoryList } from "@/components/wonderstruck/memory-list";
import { PageFrame, PageHeader, WithRail } from "@/components/wonderstruck/page-header";
import { RecallSession } from "@/components/wonderstruck/recall-session";
import { getMemory, getRecallQueue, getReviewHistory } from "@/lib/data";

export const metadata: Metadata = { title: "Recall" };

export default async function RememberPage() {
  const [queue, history, memory] = await Promise.all([
    getRecallQueue(),
    getReviewHistory(),
    getMemory(),
  ]);

  const recalled = history.filter((r) => r.outcome === "recalled").length;

  return (
    <PageFrame>
      <WithRail
        railLabel="Your memory"
        rail={
          <>
            <RailCard
              order={1}
              icon={<History />}
              tone="honey"
              title="Recent reviews"
              hint={`${recalled} of ${history.length} recalled`}
            >
              <ul className="flex flex-col divide-y divide-ink/6">
                {history.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    {r.outcome === "recalled" ? (
                      <CircleCheck aria-hidden className="size-5 shrink-0 text-success" />
                    ) : (
                      <RotateCcw aria-hidden className="size-5 shrink-0 text-tint-honey" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.9375rem] font-medium">{r.concept}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.outcome === "recalled" ? "Recalled" : "Missed"}{" "}
                        {r.whenLabel.toLowerCase()} · next {r.nextLabel.toLowerCase()}
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
        <div className="mt-7">
          <RecallSession queue={queue} />
        </div>
        <Rise order={2} className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: <Timer />, tone: "honey" as const, title: "Spaced out", text: "Each idea returns just before you'd forget it." },
            { icon: <Lightbulb />, tone: "cream" as const, title: "Effort helps", text: "A hard-won answer sticks better than an easy reread." },
            { icon: <Waypoints />, tone: "blue" as const, title: "Feeds your graph", text: "Recalled ideas move from discussed toward demonstrated." },
          ].map((t) => (
            <div key={t.title} className="surface squircle-lg flex gap-3 p-4">
              <IconKey tone={t.tone} size="sm">{t.icon}</IconKey>
              <div>
                <p className="font-bold">{t.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
              </div>
            </div>
          ))}
        </Rise>
      </WithRail>
    </PageFrame>
  );
}
