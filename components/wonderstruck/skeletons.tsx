// Loading states that mirror each page: the real frame, titles, and card chrome render as-is, and only
// learner data is a bone. Views return these while their queries load, and each route's loading.tsx
// re-exports the same one, so nothing moves when content arrives.
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  Brain,
  CalendarDays,
  CircleCheck,
  Compass,
  History,
  Mic,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MiraMascot } from "./brand";
import { Legend } from "./graph-explorer";
import { Hero } from "./hero";
import { IconKey, type IconTone } from "./icon-key";
import { PageFrame, PageHeader, WithRail } from "./page-header";
import { RailCard } from "./rail-card";
import { Section } from "./settings-form";
import { Bone, LoadingStatus, NamePlaceholder, ProfilePlaceholder, TextBone, range } from "./skeleton";
import { Tinted } from "./tinted";
import { WhyItWorks } from "./why-it-works";

/* Shared pieces */

const ink = "bg-[oklch(0.17_0.012_265)]";

const hintBone = <TextBone width="5.5rem" className="text-xs" />;

/** A Discover-style photo card: dark face, pills on top, question and actions at the bottom. */
function LearningCardBone({ meta = false }: { meta?: boolean }) {
  return (
    <div
      className={cn(
        "squircle-lg relative flex aspect-[4/5] h-full min-h-[26rem] flex-col justify-end overflow-hidden md:aspect-[5/6]",
        ink,
      )}
    >
      <div aria-hidden className="squircle-lg pointer-events-none absolute inset-0 ring-1 ring-white/10 ring-inset" />
      <div className="absolute top-4 right-4 left-4 flex justify-between gap-3">
        <Bone dark className="h-[1.625rem] w-24 rounded-full" />
        <Bone dark className="h-[1.625rem] w-14 rounded-full" />
      </div>
      <div className="flex flex-col p-5 sm:p-6">
        {meta && <TextBone dark width="6rem" className="mb-1.5 text-xs" />}
        <TextBone dark width="92%" className="text-[1.375rem] leading-[1.2] sm:text-[1.5rem]" />
        <TextBone dark width="64%" className="text-[1.375rem] leading-[1.2] sm:text-[1.5rem]" />
        <TextBone dark width="100%" className="mt-2 text-[0.9375rem] leading-relaxed" />
        <TextBone dark width="72%" className="text-[0.9375rem] leading-relaxed" />
        <div className="mt-5 flex items-center gap-2.5">
          <Bone dark className="squircle-sm h-10 w-32" />
          <Bone dark className="squircle-sm size-10" />
        </div>
      </div>
    </div>
  );
}

function FilterBones() {
  return (
    <div aria-hidden className="-mx-4 flex gap-2 overflow-hidden px-4 pb-1 sm:mx-0 sm:px-0">
      {["w-14", "w-24", "w-20", "w-28", "w-24"].map((w, i) => (
        <Bone key={i} className={cn("squircle-sm h-10 shrink-0", w)} />
      ))}
    </div>
  );
}

/** Rows of a square thumb plus a two-line title, as in the rail lists. */
function ThumbRows({ count = 3, thumb = "size-12" }: { count?: number; thumb?: string }) {
  return (
    <ul aria-hidden className="flex flex-col gap-2">
      {range(count).map((i) => (
        <li key={i} className="flex items-center gap-3 p-1.5">
          <Bone className={cn("squircle-sm shrink-0", thumb)} />
          <span className="min-w-0 flex-1">
            <TextBone width="92%" className="text-sm leading-snug" />
            <TextBone width={i % 2 ? "48%" : "62%"} className="text-sm leading-snug" />
          </span>
        </li>
      ))}
    </ul>
  );
}

function BulletBones({ count = 3 }: { count?: number }) {
  return (
    <ul aria-hidden className="flex flex-col gap-1.5">
      {range(count).map((i) => (
        <li key={i} className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-tint-violet/40" />
          <TextBone width={["58%", "44%", "66%", "50%"][i % 4]} className="flex-1 text-sm" />
        </li>
      ))}
    </ul>
  );
}

function StatBoxes({ labels }: { labels: string[] }) {
  return (
    <dl className="grid grid-cols-3 gap-2">
      {labels.map((k) => (
        <div key={k} className="squircle-md border border-ink/6 bg-background/50 px-3 py-2.5">
          <dt className="text-[0.6875rem] font-medium text-muted-foreground">{k}</dt>
          <dd className="mt-0.5">
            <TextBone width="1.75rem" className="text-[1.375rem]" />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* Today */

export function DashboardSkeleton({ name = <NamePlaceholder /> }: { name?: ReactNode }) {
  return (
    <div className="w-full px-4 pt-6 pb-14 sm:px-6 lg:px-8 lg:pt-6">
      <LoadingStatus />
      <div className="flex items-center gap-3 xl:grid xl:grid-cols-[minmax(0,1fr)_21.5rem] xl:gap-7">
        <div className="glow-under squircle-md flex h-12 min-w-0 flex-1 items-center gap-3 border border-primary/70 bg-card px-4 dark:border-primary/25">
          <Search aria-hidden className="size-[1.15rem] shrink-0 text-muted-foreground" />
          <span className="text-base text-muted-foreground">Search topics, sessions, concepts…</span>
        </div>
        <div className="ml-auto hidden items-center gap-2 sm:flex xl:justify-end">
          {[
            [RotateCcw, "text-tint-violet"],
            [Waypoints, "text-tint-teal"],
          ].map(([Icon, tone], i) => (
            <span key={i} className="flex h-12 items-center gap-2 px-3">
              <Icon aria-hidden className={cn("size-5", tone as string)} />
              <Bone className="h-4 w-4 rounded" />
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_21.5rem] xl:gap-7">
        <div className="flex min-w-0 flex-col gap-8">
          <Hero name={name} />

          <section aria-hidden>
            <h2 className="mb-3.5 flex h-10 items-center text-[1.1875rem] font-semibold">Ways to wonder</h2>
            <ul className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {["bg-tint-blue/10", "bg-primary/16 dark:bg-primary/8", "bg-tint-green/10", "bg-tint-violet/10"].map((tile) => (
                <li key={tile} className={cn("squircle-md flex flex-col gap-4 p-4", tile)}>
                  <Bone className="squircle-sm size-11" />
                  <span>
                    <TextBone width="55%" className="text-[0.9375rem] leading-tight" />
                    <TextBone width="80%" className="mt-0.5 text-[0.8125rem]" />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-hidden>
            <h2 className="mb-3.5 flex h-10 items-center text-[1.1875rem] font-semibold">Curated for you</h2>
            <ul className="-mx-4 flex gap-3 overflow-hidden px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
              {range(3).map((i) => (
                <li
                  key={i}
                  className={cn(
                    "squircle-md flex aspect-[4/5] w-[15.5rem] shrink-0 flex-col justify-end p-4 sm:aspect-[5/6] sm:w-auto",
                    ink,
                  )}
                >
                  <TextBone dark width="45%" className="text-xs" />
                  <TextBone dark width="90%" className="mt-1 text-[0.9375rem] leading-snug" />
                  <TextBone dark width="60%" className="text-[0.9375rem] leading-snug" />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-5 md:grid-cols-2 xl:grid-cols-1">
          <section className="accent-violet surface squircle-lg flex flex-col p-5 sm:p-6 md:row-span-2 xl:row-span-1">
            <div className="flex items-center gap-4">
              <Bone className="size-16 shrink-0 rounded-full" />
              <div className="min-w-0">
                <h2 className="text-[1.1875rem] font-semibold">Ready to recall</h2>
                <TextBone width="9rem" className="mt-0.5 text-sm" />
              </div>
            </div>
            <div className="mt-5 border-t border-border pt-5">
              <TextBone width="40%" className="mb-1.5 text-xs" />
              <TextBone width="95%" className="text-[0.9375rem] leading-snug" />
              <TextBone width="60%" className="text-[0.9375rem] leading-snug" />
              <div className="mt-3.5 grid gap-2">
                {range(3).map((i) => (
                  <span key={i} className="squircle-sm block h-11 border border-border" />
                ))}
              </div>
              <div className="flex gap-2 pt-5">
                <Bone className="squircle-sm h-10 flex-1" />
                <Bone className="squircle-sm h-10 w-20" />
              </div>
            </div>
          </section>

          <section className="surface squircle-lg p-5 max-md:hidden sm:p-6">
            <h2 className="mb-3.5 flex h-10 items-center text-[1.1875rem] font-semibold">Recent sessions</h2>
            <ul aria-hidden className="-mx-2 flex flex-col gap-1">
              {range(4).map((i) => (
                <li key={i} className="flex items-center gap-3 p-2">
                  <Bone className="size-10 shrink-0 rounded-full" />
                  <span className="min-w-0 flex-1">
                    <TextBone width={i % 2 ? "70%" : "85%"} className="text-[0.9375rem]" />
                    <TextBone width="45%" className="mt-0.5 text-[0.8125rem]" />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="dark squircle-lg border border-tint-teal/20 bg-[linear-gradient(160deg,oklch(0.26_0.05_215),oklch(0.2_0.03_240))] p-5 text-foreground sm:p-6">
            <Bone className="squircle-md aspect-[4/3] w-full bg-white/[0.04]" />
            <TextBone dark width="35%" className="mt-3 text-xs" />
            <TextBone dark width="80%" className="mt-1 text-[1.0625rem] leading-snug" />
            <Button asChild className="mt-4 w-full">
              <Link href="/graph">Open your graph</Link>
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}

/* Discover */

export function DiscoverSkeleton() {
  return (
    <PageFrame accent="accent-blue">
      <LoadingStatus />
      <WithRail
        railLabel="Your feed"
        rail={
          <>
            <RailCard
              featured
              icon={<Sparkles />}
              title="Curious about something else?"
              hint="Mira can start from any question"
              centered
              art={<MiraMascot width={88} />}
            >
              <div className="flex items-end gap-3">
                <p className="flex-1 text-sm leading-relaxed text-foreground/80 max-md:mx-auto max-md:max-w-[32ch] max-md:text-[0.9375rem]">
                  Ask out loud or type. Mira will turn it into a short exploration with something to try.
                </p>
                <MiraMascot width={64} className="-mb-1 shrink-0 max-md:hidden" />
              </div>
              <Button asChild className="mt-4 w-full">
                <Link href="/explore">
                  <Mic aria-hidden />
                  Ask Mira
                </Link>
              </Button>
            </RailCard>
            <RailCard essential={false} icon={<Bookmark />} title="Saved for later" hint={hintBone}>
              <ThumbRows />
            </RailCard>
          </>
        }
      >
        <PageHeader
          title="Discover"
          description="Short, surprising ideas picked for what you're curious about. Open one and Mira will explore it with you."
        />
        <div className="mt-6">
          <FilterBones />
          <ul aria-hidden className="mt-6 grid gap-5 md:grid-cols-2">
            {range(4).map((i) => (
              <li key={i}>
                <LearningCardBone />
              </li>
            ))}
          </ul>
        </div>
      </WithRail>
    </PageFrame>
  );
}

/* Explore */

export function ExploreSkeleton() {
  return (
    <div className="flex w-full flex-col px-4 pt-4 pb-6 sm:px-6 lg:h-dvh lg:px-8 lg:pt-6">
      <LoadingStatus />
      <header className="flex min-h-12 items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[1.125rem] leading-snug font-semibold sm:text-[1.3125rem]">Ask Mira anything</h1>
          <p className="truncate text-sm text-muted-foreground">Talk out loud or type. Interrupt whenever you like.</p>
        </div>
        <span className="hidden shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline">
          Preview
        </span>
      </header>
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_21rem] xl:gap-8 2xl:grid-cols-[minmax(0,1fr)_23rem]">
        <CanvasBones />
        <div className="flex min-w-0 flex-col gap-5">
          <RailCard icon={<Sparkles />} title="Or start from a spark" hint="Fresh from Discover">
            <ThumbRows />
          </RailCard>
        </div>
      </div>
    </div>
  );
}

/** The conversation column: Mira's opening line, then the voice controls docked at the bottom. */
function CanvasBones({ activity = false }: { activity?: boolean }) {
  return (
    <div
      aria-hidden
      className="flex min-h-[max(28rem,calc(100dvh-13.5rem))] min-w-0 flex-col lg:h-full lg:min-h-0"
    >
      <div className="mx-auto flex w-full max-w-[44rem] flex-1 flex-col gap-7 px-1 py-10">
        <div className="flex gap-4">
          <Bone className="size-11 shrink-0 rounded-full" />
          <div className="flex-1 pt-1">
            <TextBone width="20%" className="text-xs" />
            <TextBone width="96%" className="mt-1.5 text-[1.0625rem] leading-relaxed" />
            <TextBone width="88%" className="text-[1.0625rem] leading-relaxed" />
            <TextBone width="54%" className="text-[1.0625rem] leading-relaxed" />
          </div>
        </div>
        {activity && <Bone className="squircle-lg h-56 sm:ml-[3.75rem]" />}
      </div>
      <div className="flex flex-col items-center gap-4 pt-2 lg:gap-6">
        <div className="flex gap-2">
          {["w-32", "w-36", "w-28"].map((w) => (
            <Bone key={w} className={cn("h-8 rounded-full", w)} />
          ))}
        </div>
        <Bone className="size-16 rounded-full" />
      </div>
    </div>
  );
}

export function ExploreSessionSkeleton() {
  return (
    <>
      <LoadingStatus />
      <header className="flex items-center gap-3 sm:gap-4">
        <Bone className="squircle-sm size-12 shrink-0 -translate-y-0.5" />
        <Bone className="squircle-sm hidden size-12 shrink-0 sm:block" />
        <div className="min-w-0 flex-1">
          <TextBone width="8rem" className="text-sm" />
          <TextBone width="min(28rem,90%)" className="text-[1.125rem] leading-snug sm:text-[1.3125rem]" />
        </div>
        <span className="hidden shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline">
          Preview
        </span>
      </header>
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_21rem] xl:gap-8 2xl:grid-cols-[minmax(0,1fr)_23rem]">
        <CanvasBones activity />
        <div className="flex min-w-0 flex-col gap-5">
          <RailCard icon={<BookOpen />} tone="blue" title="Sources" hint="What Mira draws on here">
            <ul aria-hidden className="flex flex-col gap-1">
              {range(3).map((i) => (
                <li key={i} className="p-2">
                  <TextBone width={i % 2 ? "70%" : "88%"} className="text-sm leading-snug" />
                  <TextBone width="40%" className="text-xs" />
                </li>
              ))}
            </ul>
          </RailCard>
          <RailCard icon={<Waypoints />} tone="cream" title="In this session" hint="Concepts and how far you've got">
            <ul aria-hidden className="flex flex-col gap-2.5">
              {range(3).map((i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <TextBone width={["55%", "40%", "62%"][i]} className="flex-1 text-sm" />
                  <Bone className="h-6 w-20 rounded-full" />
                </li>
              ))}
            </ul>
          </RailCard>
        </div>
      </div>
    </>
  );
}

/* Learning block */

export function LearnSkeleton() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] xl:gap-10 2xl:grid-cols-[minmax(0,1fr)_23rem]">
      <LoadingStatus />
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/discover"
            className="squircle-sm -ml-2 inline-flex h-10 items-center gap-1.5 px-2 text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Discover
          </Link>
          <Bone className="squircle-sm h-10 w-24" />
        </div>
        <div
          className={cn(
            "squircle-lg relative mt-4 flex aspect-[4/5] flex-col justify-end p-5 sm:aspect-[16/9] sm:p-8 xl:aspect-[21/9]",
            ink,
          )}
        >
          <div className="flex gap-2">
            <Bone dark className="h-[1.625rem] w-24 rounded-full" />
            <Bone dark className="h-[1.625rem] w-16 rounded-full" />
          </div>
          <TextBone dark width="min(36rem,90%)" className="mt-3 text-[1.625rem] leading-[1.15] sm:text-[2rem] xl:text-[2.375rem]" />
          <TextBone dark width="min(22rem,60%)" className="text-[1.625rem] leading-[1.15] sm:text-[2rem] xl:text-[2.375rem]" />
        </div>
        <div aria-hidden className="mx-auto mt-10 max-w-[65ch] sm:mt-12">
          {["100%", "94%", "58%"].map((w) => (
            <TextBone key={w} width={w} className="text-[1.0625rem] leading-relaxed sm:text-[1.125rem]" />
          ))}
          <div className="mt-6 flex flex-col gap-5">
            {range(2).map((p) => (
              <div key={p}>
                {["100%", "97%", "92%", p ? "40%" : "70%"].map((w, i) => (
                  <TextBone key={i} width={w} className="text-[0.9688rem] leading-[1.75] sm:text-base" />
                ))}
              </div>
            ))}
          </div>
          <Bone className="squircle-lg mt-10 h-[4.5rem] bg-tint-green/[0.08]" />
        </div>
      </div>
      <div className="hidden lg:block">
        <div className="surface squircle-lg glow-soft sticky top-6 flex flex-col items-center p-6 text-center">
          <MiraMascot width={116} className="mx-auto" />
          <TextBone width="75%" className="mt-4 text-[1.3125rem]" />
          <TextBone width="85%" className="mt-2 text-[0.9375rem] leading-relaxed" />
          <TextBone width="70%" className="text-[0.9375rem] leading-relaxed" />
          <div className="mt-6 flex w-full flex-col gap-3">
            <Bone className="squircle-sm h-12 w-full" />
            <Bone className="squircle-sm h-12 w-full" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Voice is a preview in this build.</p>
        </div>
      </div>
    </div>
  );
}

/* Graph */

export function GraphSkeleton() {
  return (
    <PageFrame accent="accent-teal">
      <LoadingStatus />
      <PageHeader
        title="Your learning graph"
        description={
          <>
            <TextBone width="100%" className="text-[1.0625rem] leading-relaxed" />
            <TextBone width="55%" className="text-[1.0625rem] leading-relaxed" />
          </>
        }
      />
      <div className="mt-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Bone className="squircle-sm h-10 w-40" />
          <Legend />
        </div>
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="dark squircle-lg relative overflow-hidden border border-tint-teal/20 bg-[radial-gradient(90%_80%_at_50%_40%,oklch(0.24_0.045_220),oklch(0.17_0.015_250))] p-4 sm:p-8">
            <div aria-hidden className="relative aspect-[4/3] w-full">
              {[
                [18, 30],
                [42, 18],
                [70, 26],
                [30, 62],
                [56, 52],
                [80, 70],
                [48, 82],
              ].map(([x, y], i) => (
                <Bone
                  key={i}
                  dark
                  className="absolute size-3.5 -translate-1/2 rounded-full"
                  style={{ left: `${x}%`, top: `${y}%` }}
                />
              ))}
            </div>
          </div>
          <aside className="squircle-lg flex items-center justify-center self-start border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Select a concept to see what it connects to.
          </aside>
        </div>
      </div>
    </PageFrame>
  );
}

/* Saved */

export function SavedSkeleton() {
  return (
    <PageFrame accent="accent-rose">
      <LoadingStatus />
      <PageHeader title="Saved" description="Ideas you set aside for later. No pressure, they'll wait." />
      <div className="mt-7">
        <FilterBones />
        <ul aria-hidden className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {range(4).map((i) => (
            <li key={i}>
              <LearningCardBone meta />
            </li>
          ))}
        </ul>
      </div>
    </PageFrame>
  );
}

/* Sessions */

export function SessionsSkeleton() {
  return (
    <PageFrame accent="accent-green">
      <LoadingStatus />
      <WithRail
        railLabel="This week"
        rail={
          <>
            <RailCard featured icon={<CalendarDays />} essential={false} title="Your week in wonder" hint={hintBone}>
              <StatBoxes labels={["Sessions", "Concepts", "Minutes"]} />
              <div aria-hidden className="mt-4 flex flex-wrap gap-2">
                {["w-20", "w-24", "w-16", "w-28"].map((w) => (
                  <Bone key={w} className={cn("squircle-sm h-[2.125rem]", w)} />
                ))}
              </div>
            </RailCard>
            <RailCard icon={<RotateCcw />} tone="violet" title="Ready to recall" hint="About two minutes">
              <BulletBones />
              <Bone className="squircle-sm mt-4 h-10 w-full" />
            </RailCard>
          </>
        }
      >
        <PageHeader
          title="Sessions"
          description="Every conversation with Mira, with a recap of what you explored and what's worth coming back to."
        />
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">This week</h2>
          <ul aria-hidden className="grid gap-3 2xl:grid-cols-2">
            {range(4).map((i) => (
              <li key={i} className="surface squircle-lg flex gap-4 p-3 sm:p-3.5">
                <Bone className="squircle-md size-20 shrink-0 sm:size-24" />
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <TextBone width="38%" className="text-xs" />
                  <TextBone width={i % 2 ? "62%" : "78%"} className="mt-1 leading-snug" />
                  <TextBone width="46%" className="mt-1.5 text-xs" />
                </div>
                <Bone className="squircle-sm hidden h-10 w-24 self-center sm:block" />
              </li>
            ))}
          </ul>
        </section>
      </WithRail>
    </PageFrame>
  );
}

/* Recall */

function RecallStat({ tone, icon, label }: { tone: IconTone; icon: ReactNode; label: string }) {
  return (
    <Tinted tone={tone} className="squircle-md flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:p-4">
      <IconKey tone={tone} size="sm" className="max-sm:hidden">
        {icon}
      </IconKey>
      <div className="min-w-0">
        <Bone className="h-[1.375rem] w-10 rounded-md" />
        <p className="mt-1.5 text-xs leading-snug font-medium text-muted-foreground sm:text-sm">{label}</p>
      </div>
    </Tinted>
  );
}

export function RememberSkeleton() {
  return (
    <PageFrame accent="accent-violet">
      <LoadingStatus />
      <WithRail
        railLabel="Your memory"
        rail={
          <>
            <RailCard icon={<History />} tone="violet" essential={false} title="Recent reviews" hint={hintBone}>
              <ul aria-hidden className="flex flex-col divide-y divide-ink/6">
                {range(4).map((i) => (
                  <li key={i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <Bone className="size-5 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <TextBone width={i % 2 ? "50%" : "68%"} className="text-[0.9375rem]" />
                      <TextBone width="80%" className="text-xs" />
                    </div>
                  </li>
                ))}
              </ul>
            </RailCard>
            <RailCard icon={<Brain />} title="What Mira remembers" hint="Used to adapt explanations">
              <p className="-mt-1 mb-3 text-sm leading-relaxed text-muted-foreground">
                Remove anything you&apos;d rather Mira forgot.
              </p>
              <div aria-hidden className="flex flex-col gap-2">
                {range(3).map((i) => (
                  <Bone key={i} className="squircle-md h-16" />
                ))}
              </div>
            </RailCard>
          </>
        }
      >
        <PageHeader
          title="Recall"
          description="A few quick questions on things you explored. Pulling an idea back from memory is what makes it stick."
        />
        <div className="mt-7 grid grid-cols-3 gap-2.5 sm:gap-3">
          <RecallStat tone="violet" icon={<RotateCcw />} label="Due now" />
          <RecallStat tone="green" icon={<CircleCheck />} label="Recalled lately" />
          <RecallStat tone="rose" icon={<History />} label="Coming back sooner" />
        </div>
        <div aria-hidden className="surface squircle-lg mt-4 p-5 sm:mt-5 sm:p-8">
          <div className="flex items-center gap-3">
            <IconKey tone="violet" size="sm">
              <Brain />
            </IconKey>
            <TextBone width="9rem" className="flex-1 text-sm" />
            <TextBone width="2.5rem" className="text-sm" />
          </div>
          <div className="mt-4 flex gap-1.5">
            {range(5).map((i) => (
              <span key={i} className="h-1.5 flex-1 rounded-full bg-ink/10" />
            ))}
          </div>
          <div className="mt-8">
            <TextBone width="12rem" className="mb-1.5 text-xs" />
            <TextBone width="90%" className="text-[1.25rem] leading-snug sm:text-[1.5rem]" />
            <TextBone width="55%" className="text-[1.25rem] leading-snug sm:text-[1.5rem]" />
            <div className="mt-6 grid gap-2.5">
              {range(4).map((i) => (
                <div key={i} className="squircle-sm flex min-h-14 items-center gap-3 border border-border px-3 py-2.5">
                  <span className="size-5 shrink-0 rounded-full border border-border" />
                  <TextBone width={["62%", "48%", "70%", "40%"][i]} className="flex-1 text-[0.9375rem] sm:text-base" />
                </div>
              ))}
            </div>
            <Bone className="squircle-sm mt-5 h-12 w-full sm:w-40" />
          </div>
        </div>
        <WhyItWorks />
      </WithRail>
    </PageFrame>
  );
}

/* Session recap */

export function RecapSkeleton() {
  return (
    <WithRail
      railLabel="About this session"
      rail={
        <RailCard essential={false} icon={<Compass />} tone="blue" title="Explore next" hint="Close to what you just learned">
          <div aria-hidden className="flex flex-col gap-3">
            {range(2).map((i) => (
              <Bone key={i} className="squircle-md aspect-[16/9]" />
            ))}
          </div>
        </RailCard>
      }
    >
      <LoadingStatus />
      <Link
        href="/sessions"
        className="inline-flex h-10 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Sessions
      </Link>
      <div aria-hidden className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center">
        <Bone className="squircle-lg aspect-[16/10] w-full shrink-0 sm:w-48" />
        <div className="min-w-0 flex-1">
          <TextBone width="14rem" className="text-sm" />
          <TextBone width="min(30rem,90%)" className="mt-1 text-[1.875rem] leading-tight sm:text-[2.125rem]" />
          <div className="mt-4 flex gap-2">
            <Bone className="squircle-sm h-10 w-36" />
            <Bone className="squircle-sm h-10 w-40" />
          </div>
        </div>
      </div>
      <section className="mt-10">
        <h2 className="text-[1.375rem] font-semibold">Recap</h2>
        <div aria-hidden className="mt-3 max-w-[65ch]">
          {["100%", "96%", "88%", "42%"].map((w) => (
            <TextBone key={w} width={w} className="text-[1.0625rem] leading-[1.7]" />
          ))}
        </div>
        <h3 className="mt-8 text-sm font-medium text-muted-foreground">Key ideas</h3>
        <ol aria-hidden className="mt-3 flex flex-col gap-3">
          {range(3).map((i) => (
            <li key={i} className="surface squircle-md flex gap-4 p-4">
              <Bone className="size-8 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <TextBone width={["40%", "52%", "34%"][i]} />
                <TextBone width="95%" className="mt-1 text-[0.9375rem] leading-relaxed" />
                <TextBone width="70%" className="text-[0.9375rem] leading-relaxed" />
              </div>
            </li>
          ))}
        </ol>
      </section>
    </WithRail>
  );
}

/* Settings */

/** The data-backed sections of the settings form. */
export function SettingsFormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <LoadingStatus />
      <Section title="Appearance">
        <Bone className="squircle-sm h-11 w-[19rem] max-w-full" />
      </Section>
      <Section title="Interests" description="Shapes what appears in Discover. Your sessions shape it too.">
        <div aria-hidden className="flex flex-wrap gap-2">
          {["w-24", "w-20", "w-28", "w-24", "w-16", "w-32"].map((w, i) => (
            <Bone key={i} className={cn("squircle-sm h-10", w)} />
          ))}
        </div>
      </Section>
      <Section title="Mira's voice" description="Voice is a preview and isn't connected yet.">
        <div aria-hidden className="grid gap-2 sm:grid-cols-3">
          {range(3).map((i) => (
            <div key={i} className="squircle-md border border-border p-3.5">
              <TextBone width="45%" />
              <TextBone width="80%" className="mt-0.5 text-sm" />
            </div>
          ))}
        </div>
      </Section>
      <Section title="Privacy and memory">
        <div aria-hidden className="flex flex-col gap-5">
          {range(3).map((i) => (
            <div key={i} className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <TextBone width={["50%", "44%", "36%"][i]} />
                <TextBone width="70%" className="text-sm" />
              </div>
              <Bone className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </div>
      </Section>
      <Section title="Your data">
        <div aria-hidden className="flex flex-col gap-3 sm:flex-row">
          <Bone className="squircle-sm h-10 sm:w-44" />
          <Bone className="squircle-sm h-10 sm:w-36" />
        </div>
      </Section>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <PageFrame>
      <WithRail
        railLabel="Your data"
        rail={
          <RailCard
            featured
            icon={<ShieldCheck />}
            essential={false}
            title="Your learning stays yours"
            hint="Nothing is shared or sold"
          >
            <div className="flex items-end gap-3">
              <p className="flex-1 text-sm leading-relaxed text-foreground/80">
                Mira only uses your sessions to explain things better for you. You can see, export, or delete all of
                it.
              </p>
              <MiraMascot width={60} className="-mb-1 shrink-0" />
            </div>
            <div className="mt-4">
              <StatBoxes labels={["Sessions", "Concepts", "Memories"]} />
            </div>
            <Button asChild variant="secondary" className="mt-4">
              <Link href="/remember">Review what Mira remembers</Link>
            </Button>
          </RailCard>
        }
      >
        <PageHeader title="Settings" description="Shape what Mira suggests, how it sounds, and what it keeps." />
        <div className="mt-7 flex flex-col gap-6">
          <Section title="Profile">
            <ProfilePlaceholder />
          </Section>
          <SettingsFormSkeleton />
        </div>
      </WithRail>
    </PageFrame>
  );
}
