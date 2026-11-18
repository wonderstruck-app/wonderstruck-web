import Link from "next/link";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Learner } from "@/lib/data";
import { MiraMascot } from "./brand";

const greetings = [
  ["morning", "Good morning,"],
  ["afternoon", "Good afternoon,"],
  ["evening", "Good evening,"],
  ["night", "Still curious,"],
] as const;

export function Hero({ learner }: { learner: Learner }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="hero-sky @container squircle-lg relative isolate overflow-hidden border border-ink/10 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.08)]"
    >
      <div className="flex min-h-[19rem] items-end">
        <div className="relative z-10 flex w-full flex-col items-center px-6 pt-6 pb-7 text-center sm:p-10 @2xl:max-w-[30rem] @2xl:items-start @2xl:text-left">
          <MiraMascot
            width={124}
            loading="eager"
            className="pointer-events-none mb-3 drop-shadow-[0_14px_24px_color-mix(in_oklch,var(--shadow-color)_calc(0.45*var(--shade)*100%),transparent)] @2xl:hidden"
          />
          <h1
            id="hero-title"
            className="text-[2.25rem] leading-[1.08] font-bold sm:text-[2.875rem]"
          >
            {greetings.map(([part, text]) => (
              <span key={part} className={`daypart daypart-${part}`}>
                {text}
              </span>
            ))}
            <br />
            <span className="text-primary-ink">{learner.name}.</span>
          </h1>
          <p className="mt-4 max-w-[30ch] text-[1.0625rem] leading-relaxed text-foreground/80">
            Something caught your eye today? Ask Mira and wander through it
            together.
          </p>
          <div className="mt-7 grid w-full gap-3 sm:w-auto sm:grid-cols-2 @2xl:flex @2xl:flex-wrap @2xl:items-center">
            <Button size="lg" asChild>
              <Link href="/explore">
                <Mic aria-hidden className="size-[1.15rem]" />
                Talk with Mira
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              asChild
            >
              <Link href="/explore#composer">Type instead</Link>
            </Button>
          </div>
        </div>

        <MiraMascot
          width={220}
          loading="eager"
          className="pointer-events-none absolute right-[6%] bottom-0 hidden translate-y-[6%] drop-shadow-[0_18px_30px_color-mix(in_oklch,var(--shadow-color)_calc(0.45*var(--shade)*100%),transparent)] @2xl:block @4xl:right-[9%]"
        />
      </div>
    </section>
  );
}
