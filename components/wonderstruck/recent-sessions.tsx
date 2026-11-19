import Image from "next/image";
import Link from "next/link";
import type { SessionSummary } from "@/lib/data";
import { RecapStatus } from "./recap-status";
import { SectionHeading } from "./section-heading";

export function RecentSessions({ sessions }: { sessions: SessionSummary[] }) {
  return (
    <section
      aria-labelledby="sessions-title"
      className="surface squircle-lg p-5 sm:p-6"
    >
      <SectionHeading
        id="sessions-title"
        title="Recent sessions"
        href="/sessions"
        accent="accent-green"
        linkLabel="All"
      />
      <ul className="-mx-2 flex flex-col gap-1">
        {sessions.map((s) => (
          <li
            key={s.id}
            className="squircle-sm flex items-center gap-3 p-2 transition-colors hover:bg-accent/60"
          >
            <span className="relative size-10 shrink-0 overflow-hidden rounded-full ring-1 ring-ink/10">
              <Image
                src={s.image.src}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
            <div className="min-w-0 flex-1">
              <Link
                href={`/sessions/${s.id}`}
                className="block truncate text-[0.9375rem] font-medium outline-none hover:underline focus-visible:underline"
              >
                {s.title}
              </Link>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[0.8125rem] whitespace-nowrap">
                <span className="text-muted-foreground">{s.whenLabel}</span>
                <span aria-hidden className="text-muted-foreground/60">
                  ·
                </span>
                <RecapStatus status={s.recapStatus} />
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
