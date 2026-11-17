import Link from "next/link";
import { Keyboard, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MiraMascot } from "./brand";

/** Voice-first invitation to explore a block with Mira. Desktop rail card. */
export function MiraInvite({
  href,
  resumeMinutes,
  className,
}: {
  href: string;
  /** Minutes already spent, when a session for this block exists. */
  resumeMinutes?: number;
  className?: string;
}) {
  const resuming = resumeMinutes !== undefined;
  return (
    <section
      aria-labelledby="mira-invite"
      className={cn(
        "surface squircle-lg glow-soft relative overflow-hidden p-6 text-center",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-10 mx-auto size-64 rounded-full bg-[radial-gradient(closest-side,oklch(0.86_0.05_80/0.22),transparent)]"
      />
      <MiraMascot
        width={116}
        className="relative mx-auto drop-shadow-[0_14px_22px_oklch(0_0_0/0.45)]"
      />
      <h2 id="mira-invite" className="relative mt-4 text-[1.3125rem] font-bold text-balance">
        {resuming ? "Pick up with Mira" : "Talk it through with Mira"}
      </h2>
      <p className="relative mx-auto mt-2 max-w-[30ch] text-[0.9375rem] leading-relaxed text-foreground/75">
        {resuming
          ? `You've spent ${resumeMinutes} minutes on this. Carry on where you stopped.`
          : "Ask why, push back, interrupt. Mira asks questions back and sets up activities as you go."}
      </p>
      <div className="relative mt-6 flex flex-col gap-3">
        <Button asChild size="lg" className="w-full">
          <Link href={href}>
            <Mic aria-hidden />
            {resuming ? "Resume by voice" : "Talk with Mira"}
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary" className="w-full">
          <Link href={`${href}#composer`}>
            <Keyboard aria-hidden />
            Type instead
          </Link>
        </Button>
      </div>
      <p className="relative mt-4 text-xs text-muted-foreground">
        Voice is a preview in this build.
      </p>
    </section>
  );
}

/** Small-screen counterpart: a floating voice button above the bottom nav. */
export function MiraFab({ href }: { href: string }) {
  return (
    <Button
      asChild
      size="lg"
      className="fixed right-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-30 h-14 rounded-full pr-6 pl-5 shadow-[0_12px_30px_oklch(0_0_0/0.5)] lg:hidden"
    >
      <Link href={href}>
        <Mic aria-hidden className="size-5" />
        Talk with Mira
      </Link>
    </Button>
  );
}
