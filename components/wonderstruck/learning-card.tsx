import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LearningBlock } from "@/lib/data";
import { SaveButton } from "./save-button";

/** Glass feed card for Discover and Saved: edge-to-edge image, curiosity title, clear actions. */
export function LearningCard({
  block: b,
  saved = false,
  meta,
  priority = false,
}: {
  block: LearningBlock;
  saved?: boolean;
  meta?: string;
  priority?: boolean;
}) {
  return (
    <article className="glass lift squircle-lg group flex h-full flex-col overflow-hidden">
      <Link
        href={`/learn/${b.id}`}
        tabIndex={-1}
        aria-hidden
        className="relative block aspect-[16/10] overflow-hidden"
      >
        <Image
          src={b.image.src}
          alt=""
          fill
          loading={priority ? "eager" : undefined}
          sizes="(min-width: 1536px) 560px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[oklch(0.17_0.012_265/0.9)] to-transparent" />
        <span className="absolute top-3 left-3 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
          {b.topic}
        </span>
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
          <Clock aria-hidden className="size-3.5" />
          {b.minutes} min
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5 pt-3 sm:p-6 sm:pt-3">
        {meta && (
          <p className="mb-1 text-xs font-semibold text-foreground/60">{meta}</p>
        )}
        <h2 className="text-[1.3125rem] leading-snug font-bold">
          <span className="sr-only">{b.topic}, {b.minutes} minutes. </span>
          <Link href={`/learn/${b.id}`} className="outline-none hover:underline focus-visible:underline">
            {b.question}
          </Link>
        </h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-foreground/75">{b.teaser}</p>
        <div className="mt-auto flex items-center gap-2 pt-5">
          <Button asChild>
            <Link href={`/learn/${b.id}`}>
              Explore
              <ArrowRight aria-hidden className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <SaveButton initial={saved} label={b.question} />
        </div>
      </div>
    </article>
  );
}
