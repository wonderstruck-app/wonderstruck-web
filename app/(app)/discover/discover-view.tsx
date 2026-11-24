"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bookmark, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MiraMascot } from "@/components/wonderstruck/brand";
import { RailCard } from "@/components/wonderstruck/rail-card";
import { DiscoverFeed } from "@/components/wonderstruck/discover-feed";
import { PageFrame, PageHeader, WithRail } from "@/components/wonderstruck/page-header";
import { useQuery } from "@tanstack/react-query";
import { Settled } from "@/components/wonderstruck/skeleton";
import { DiscoverSkeleton } from "@/components/wonderstruck/skeletons";
import { useLoadedLate } from "@/lib/use-loaded-late";
import { q } from "@/lib/data/queries";

export function DiscoverView() {
  const { data: blocks } = useQuery(q.blocks());
  const { data: saved } = useQuery(q.saved());
  const late = useLoadedLate(!!(blocks && saved));
  if (!blocks || !saved) return <DiscoverSkeleton />;

  return (
    <Settled late={late}>
      <PageFrame accent="accent-blue">
        <WithRail
          railLabel="Your feed"
          rail={
            <>
              <RailCard
                order={1}
                featured
                icon={<Sparkles />}
                title="Curious about something else?"
                hint="Mira can start from any question"
                centered
                art={<MiraMascot width={88} />}
              >
                <div className="flex items-end gap-3">
                  <p className="flex-1 text-sm leading-relaxed text-foreground/80 max-md:mx-auto max-md:max-w-[32ch] max-md:text-[0.9375rem]">
                    Ask out loud or type. Mira will turn it into a short
                    exploration with something to try.
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

              <RailCard
                order={2}
                essential={false}
                icon={<Bookmark />}
                title="Saved for later"
                hint={`${saved.length} waiting`}
              >
                <ul className="flex flex-col gap-2">
                  {saved.slice(0, 3).map(({ block }) => (
                    <li key={block.id}>
                      <Link
                        href={`/learn/${block.id}`}
                        className="squircle-md group flex items-center gap-3 p-1.5 transition-colors hover:bg-ink/[0.04]"
                      >
                        <span className="squircle-sm relative size-12 shrink-0 overflow-hidden">
                          <Image src={block.image.src} alt="" fill sizes="48px" className="object-cover" />
                        </span>
                        <span className="line-clamp-2 text-sm leading-snug font-medium text-foreground/85 group-hover:text-foreground">
                          {block.question}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/saved"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-ink hover:underline"
                >
                  See all {saved.length}
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </RailCard>

            </>
          }
        >
          <PageHeader
            title="Discover"
            description="Short, surprising ideas picked for what you're curious about. Open one and Mira will explore it with you."
          />
          <div className="mt-6">
            <DiscoverFeed
              blocks={blocks}
              savedIds={saved.map((s) => s.block.id)}
            />
          </div>
        </WithRail>
      </PageFrame>
    </Settled>
  );
}
