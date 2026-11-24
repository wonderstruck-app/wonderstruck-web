import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BlockCard } from "@/lib/data";
import { SaveButton } from "./save-button";

/**
 * Full-bleed feed card for Discover and Saved: the image is the card, with a deep
 * bottom scrim carrying the topic, title, caption and actions in white.
 * The overlay is scoped `dark` so keys render with their dark-theme colours on the photo.
 */
export function LearningCard({
  block: b,
  saved = false,
  meta,
  priority = false,
}: {
  block: BlockCard;
  saved?: boolean;
  meta?: string;
  priority?: boolean;
}) {
  return (
    <article className="lift squircle-lg group relative isolate flex aspect-[4/5] h-full w-full min-w-0 min-h-[26rem] flex-col justify-end overflow-hidden bg-[oklch(0.17_0.012_265)] md:aspect-[5/6]">
      <Image
        src={b.image.src}
        alt=""
        fill
        loading={priority ? "eager" : undefined}
        sizes="(min-width: 1536px) 560px, (min-width: 768px) 50vw, 100vw"
        className="-z-10 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,oklch(0.12_0.01_265/0.96)_0%,oklch(0.12_0.01_265/0.88)_28%,oklch(0.12_0.01_265/0.45)_55%,transparent_75%),linear-gradient(to_bottom,oklch(0.12_0.01_265/0.35),transparent_22%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 squircle-lg ring-1 ring-white/10 ring-inset" />

      <div className="dark absolute top-4 right-4 left-4 flex items-start justify-between gap-3">
        <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/15 backdrop-blur-md">
          {b.topic}
        </span>
        <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium text-white/90 tabular-nums ring-1 ring-white/15 backdrop-blur-md">
          {b.minutes} min
        </span>
      </div>

      <div className="dark flex flex-col p-5 text-white sm:p-6">
        {meta && <p className="mb-1.5 text-xs font-medium text-white/65">{meta}</p>}
        <h2 className="text-[1.375rem] leading-[1.2] font-semibold text-balance sm:text-[1.5rem]">
          <span className="sr-only">{b.topic}, {b.minutes} minutes. </span>
          <Link
            href={`/learn/${b.id}`}
            className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline"
          >
            {b.question}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-relaxed text-pretty text-white/75">{b.teaser}</p>
        <div className="relative z-10 mt-5 flex items-center gap-2.5">
          <Button asChild>
            <Link href={`/learn/${b.id}`} tabIndex={-1}>
              Explore
              <ArrowRight aria-hidden className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <SaveButton blockId={b.id} initial={saved} label={b.question} />
        </div>
      </div>
    </article>
  );
}
