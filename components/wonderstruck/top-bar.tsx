import Link from "next/link";
import { RotateCcw, Search, Waypoints } from "lucide-react";

export function TopBar({
  recallDue,
  conceptCount,
}: {
  recallDue: number;
  conceptCount: number;
}) {
  return (
    <div className="flex items-center gap-3 xl:grid xl:grid-cols-[minmax(0,1fr)_21.5rem] xl:gap-7">
      <form
        action="/discover"
        role="search"
        className="min-w-0 flex-1"
      >
        <label htmlFor="site-search" className="sr-only">
          Search topics, sessions, and concepts
        </label>
        <div className="glow-under squircle-md flex h-12 items-center gap-3 border border-primary/70 bg-card px-4 dark:border-primary/25 transition-[border-color,box-shadow] duration-200 focus-within:border-primary/60">
          <Search
            aria-hidden
            className="size-[1.15rem] shrink-0 text-muted-foreground"
          />
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="Search topics, sessions, concepts…"
            className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </div>
      </form>

      <div className="ml-auto hidden items-center gap-2 sm:flex xl:justify-end">
        <Link
          href="/remember"
          className="squircle-sm flex h-12 items-center gap-2 px-3 text-[0.9375rem] font-semibold tabular-nums outline-none hover:bg-card focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw aria-hidden className="size-5 text-tint-violet" />
          {recallDue}
          <span className="sr-only">concepts ready to recall</span>
        </Link>
        <Link
          href="/graph"
          className="squircle-sm flex h-12 items-center gap-2 px-3 text-[0.9375rem] font-semibold tabular-nums outline-none hover:bg-card focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Waypoints aria-hidden className="size-5 text-tint-teal" />
          {conceptCount}
          <span className="sr-only">concepts in your learning graph</span>
        </Link>
      </div>
    </div>
  );
}
