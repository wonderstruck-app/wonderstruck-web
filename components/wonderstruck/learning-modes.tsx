import Link from "next/link";
import { ArrowRight, Compass, Mic, Puzzle, RotateCcw } from "lucide-react";
import type { LearningMode } from "@/lib/data";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

const icons = {
  discover: Compass,
  explore: Mic,
  interact: Puzzle,
  recall: RotateCcw,
};

// White glyphs on every key, so faces are mid-tone in both themes.
const tints = {
  blue: {
    tile: "bg-tint-blue/10 hover:bg-tint-blue/15",
    face: "[--face:var(--tint-blue)] dark:[--face:oklch(0.6_0.13_245)]",
  },
  cream: {
    tile: "bg-primary/16 hover:bg-primary/24 dark:bg-primary/8 dark:hover:bg-primary/12",
    face: "[--face:var(--primary-ink)] dark:[--face:oklch(0.68_0.09_80)]",
  },
  green: {
    tile: "bg-tint-green/10 hover:bg-tint-green/15",
    face: "[--face:var(--tint-green)] dark:[--face:oklch(0.6_0.13_155)]",
  },
  violet: {
    tile: "bg-tint-violet/10 hover:bg-tint-violet/15",
    face: "[--face:var(--tint-violet)] dark:[--face:oklch(0.6_0.14_295)]",
  },
} as const;

const modeTint = {
  discover: "blue",
  explore: "cream",
  interact: "green",
  recall: "violet",
} as const;

export function LearningModes({ modes }: { modes: LearningMode[] }) {
  return (
    <section aria-labelledby="modes-title">
      <SectionHeading id="modes-title" title="Ways to wonder" />
      <ul className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {modes.map((m) => {
          const Icon = icons[m.id];
          const t = tints[modeTint[m.id]];
          return (
            <li key={m.id}>
              <Link
                href={m.href}
                className={cn(
                  "squircle-md group flex h-full flex-col gap-4 p-4 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  t.tile,
                )}
              >
                <span className="flex items-start justify-between">
                  <span
                    className={cn(
                      "key squircle-sm grid size-11 shrink-0 place-items-center",
                      "bg-(--face) text-white [--key-edge:color-mix(in_oklch,var(--face)_72%,black)]",
                      t.face,
                    )}
                  >
                    <Icon aria-hidden className="size-5 stroke-[2.25]" />
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.9375rem] leading-tight font-bold">
                    {m.label}
                  </span>
                  <span className="mt-0.5 block text-[0.8125rem] text-muted-foreground">
                    {m.detail}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
