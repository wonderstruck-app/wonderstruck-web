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
        linkLabel="Open Discover"
      />
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
        {blocks.map((b) => (
          <li key={b.id} className="w-[15.5rem] shrink-0 snap-start sm:w-auto">
            <Link
              href={`/learn/${b.id}`}
              className="glass squircle-md group flex h-full flex-col overflow-hidden outline-none transition-[background-color,border-color] hover:border-white/16 hover:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="squircle-sm relative m-1.5 mb-0 aspect-[16/10] overflow-hidden">
                <Image
                  src={b.image.src}
                  alt={b.image.alt}
                  fill
                  sizes="(min-width: 1280px) 320px, (min-width: 640px) 30vw, 248px"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              </div>
              <div className="flex flex-1 flex-col p-3.5">
                <p className="text-xs font-semibold text-foreground/60">
                  {b.topic} · {b.minutes} min
                </p>
                <h3 className="mt-1 text-[0.9375rem] leading-snug font-bold">
                  {b.question}
                </h3>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
