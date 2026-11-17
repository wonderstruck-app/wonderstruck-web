import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RailCard } from "@/components/wonderstruck/rail-card";
import { MiraMascot } from "@/components/wonderstruck/brand";
import { MiraPanel } from "@/components/wonderstruck/mira-panel";
import { PageFrame, WithRail } from "@/components/wonderstruck/page-header";
import { getBlocks, getSessions } from "@/lib/data";

export const metadata: Metadata = { title: "Explore with Mira" };

export default async function ExplorePage() {
  const [sessions, blocks] = await Promise.all([getSessions(), getBlocks()]);
  const active = sessions.find((s) => s.status === "active");
  const explored = new Set(sessions.map((s) => s.blockId));
  const sparks = blocks.filter((b) => !explored.has(b.id)).slice(0, 3);

  return (
    <PageFrame>
      <WithRail
        railLabel="Pick up a thread"
        rail={
          <>
            {active && (
              <RailCard order={1} featured icon={<Play />} tone="green" title="Pick up where you left off" hint={`${active.minutes} min so far`}>
                <Link href={`/explore/${active.blockId}`} className="squircle-md group relative block aspect-[16/9] overflow-hidden">
                  <Image src={active.image.src} alt="" fill sizes="384px" className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  <span className="absolute inset-x-3 bottom-2.5 text-sm leading-snug font-semibold text-white">{active.title}</span>
                </Link>
                <Button asChild className="mt-4 w-full">
                  <Link href={`/explore/${active.blockId}`}>Resume session</Link>
                </Button>
              </RailCard>
            )}
            <RailCard order={2} icon={<Sparkles />} title="Or start from a spark" hint="Fresh from Discover">
              <ul className="flex flex-col gap-2">
                {sparks.map((b) => (
                  <li key={b.id}>
                    <Link href={`/learn/${b.id}`} className="squircle-md group flex items-center gap-3 p-1.5 transition-colors hover:bg-white/[0.04]">
                      <span className="squircle-sm relative size-12 shrink-0 overflow-hidden">
                        <Image src={b.image.src} alt="" fill sizes="48px" className="object-cover" />
                      </span>
                      <span className="line-clamp-2 text-sm leading-snug font-medium text-foreground/85 group-hover:text-foreground">{b.question}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </RailCard>
          </>
        }
      >
        <div className="flex h-full min-w-0 flex-col">
          <header className="flex items-end gap-5">
            <div className="min-w-0 flex-1">
              <h1 className="text-[2rem] leading-tight font-bold sm:text-[2.375rem]">
                Ask Mira anything
              </h1>
              <p className="mt-2 max-w-[52ch] text-[1.0625rem] leading-relaxed text-foreground/75">
                Talk out loud or type. Interrupt whenever you like. Mira asks
                questions back so you work things out, not just hear them.
              </p>
            </div>
            <MiraMascot
              width={104}
              className="hidden shrink-0 drop-shadow-[0_12px_20px_oklch(0_0_0/0.45)] sm:block"
            />
          </header>
          <MiraPanel
            composerId="composer"
            className="mt-6 min-h-[34rem] flex-1"
            tall
            suggestions={[
              "Why are sunsets orange?",
              "How do vaccines train the immune system?",
              "What actually is entropy?",
            ]}
          />
        </div>
      </WithRail>
    </PageFrame>
  );
}
