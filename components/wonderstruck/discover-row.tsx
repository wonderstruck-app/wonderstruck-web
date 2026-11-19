import Image from "next/image";
import Link from "next/link";
import type { LearningBlock } from "@/lib/data";
import { SectionHeading } from "./section-heading";

export function DiscoverRow({ blocks }: { blocks: LearningBlock[] }) {
  return (
    <section aria-labelledby="discover-title">
      <SectionHeading
        id="discover-title"
        title="Curated for you"
        href="/discover"
        accent="accent-blue"
        linkLabel="Open Discover"
      />
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
        {blocks.map((b) => (
          <li key={b.id} className="w-[15.5rem] shrink-0 snap-start sm:w-auto">
            <Link
              href={`/learn/${b.id}`}
              className="lift squircle-md group relative isolate flex aspect-[4/5] h-full flex-col justify-end overflow-hidden bg-[oklch(0.17_0.012_265)] outline-none focus-visible:ring-2 focus-visible:ring-ring sm:aspect-[5/6]"
            >
              <Image
                src={b.image.src}
                alt={b.image.alt}
                fill
                sizes="(min-width: 1280px) 320px, (min-width: 640px) 30vw, 248px"
                className="-z-10 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              <span
                aria-hidden
                className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,oklch(0.12_0.01_265/0.95)_0%,oklch(0.12_0.01_265/0.75)_32%,transparent_68%)]"
              />
              <span aria-hidden className="squircle-md pointer-events-none absolute inset-0 ring-1 ring-white/10 ring-inset" />
              <span className="flex flex-col p-4 text-white">
                <span className="text-xs font-medium text-white/65">
                  {b.topic} · {b.minutes} min
                </span>
                <span className="mt-1 text-[0.9375rem] leading-snug font-semibold text-balance">{b.question}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
