"use client";

import { useQuery } from "@tanstack/react-query";
import { SettingsForm } from "@/components/wonderstruck/settings-form";
import { q } from "@/lib/data/queries";
import { SettingsFormSkeleton } from "@/components/wonderstruck/skeletons";

const shape = "bg-ink/[0.05] motion-safe:animate-pulse";

/** Sessions, concepts and memories Mira holds for the learner. */
export function YourDataStats() {
  const { data: sessions } = useQuery(q.sessions());
  const { data: graph } = useQuery(q.graph());
  const { data: memory } = useQuery(q.memory());
  return (
    <dl className="mt-4 grid grid-cols-3 gap-2">
      {(
        [
          ["Sessions", sessions?.length],
          ["Concepts", graph?.concepts.length],
          ["Memories", memory?.length],
        ] as const
      ).map(([k, v]) => (
        <div key={k} className="squircle-md border border-ink/6 bg-background/50 px-3 py-2.5">
          <dt className="text-[0.6875rem] font-medium text-muted-foreground">{k}</dt>
          <dd className="mt-0.5 text-[1.375rem] font-semibold tabular-nums">
            {v ?? <span aria-label="Loading" className={`my-1.5 block h-6 w-8 rounded ${shape}`} />}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SettingsData() {
  const { data: settings } = useQuery(q.settings());
  if (!settings) return <SettingsFormSkeleton />;
  return <SettingsForm settings={settings} />;
}
