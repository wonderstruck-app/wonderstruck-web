import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, Puzzle } from "lucide-react";
import { IconKey } from "@/components/wonderstruck/icon-key";
import { MiraFab, MiraInvite } from "@/components/wonderstruck/mira-invite";
import { PageFrame } from "@/components/wonderstruck/page-header";
import { SaveButton } from "@/components/wonderstruck/save-button";
import { getBlock, getSavedBlocks, getSessionForBlock } from "@/lib/data";

type Props = { params: Promise<{ blockId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const block = await getBlock((await params).blockId);
  return { title: block?.question ?? "Learning block" };
}

export default function LearnPage({ params }: Props) {
  return (
    <PageFrame>
      <Suspense fallback={<LearnSkeleton />}>
        <Learn params={params} />
      </Suspense>
    </PageFrame>
  );
}

async function Learn({ params }: Props) {
  const { blockId } = await params;
  const [block, session, saved] = await Promise.all([
    getBlock(blockId),
    getSessionForBlock(blockId),
    getSavedBlocks(),
  ]);
  if (!block) notFound();

  const exploreHref = `/explore/${block.id}`;
  const isSaved = saved.some((s) => s.block.id === block.id);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] xl:gap-10 2xl:grid-cols-[minmax(0,1fr)_23rem]">
      <article className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/discover"
            className="squircle-sm -ml-2 inline-flex h-10 items-center gap-1.5 px-2 text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Discover
          </Link>
          <SaveButton initial={isSaved} label={block.question} />
        </div>

        <header className="squircle-lg relative mt-4 isolate flex aspect-[4/5] flex-col justify-end overflow-hidden p-5 sm:aspect-[16/9] sm:p-8 xl:aspect-[21/9]">
          <Image
            src={block.image.src}
            alt={block.image.alt}
            fill
            priority
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="-z-10 object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-t from-[oklch(0.12_0.01_265)] via-[oklch(0.12_0.01_265/0.55)] to-transparent"
          />
          <div className="flex flex-wrap gap-2 text-xs font-medium text-white/90">
            <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 backdrop-blur-md">
              {block.topic}
            </span>
            <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 backdrop-blur-md">
              {block.minutes} min read
            </span>
          </div>
          <h1 className="mt-3 max-w-[26ch] text-[1.625rem] leading-[1.15] font-semibold text-balance text-white sm:text-[2rem] xl:text-[2.375rem]">
            {block.question}
          </h1>
        </header>

        <div className="mx-auto mt-10 max-w-[65ch] sm:mt-12">
          <p className="text-[1.0625rem] leading-relaxed font-medium text-foreground sm:text-[1.125rem]">
            {block.teaser}
          </p>
          <div className="mt-6 flex flex-col gap-5 text-[0.9688rem] leading-[1.75] text-foreground/85 sm:text-base">
            {block.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {block.activity && (
            <Link
              href={`${exploreHref}#activity`}
              className="squircle-lg group mt-10 flex items-center gap-4 border border-tint-green/25 bg-tint-green/[0.06] p-4 outline-none transition-colors hover:bg-tint-green/10 focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
            >
              <IconKey tone="green">
                <Puzzle />
              </IconKey>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">Try it: {block.activity.title}</span>
                <span className="block text-sm text-foreground/70">
                  A hands-on activity inside your session with Mira
                </span>
              </span>
              <ArrowRight
                aria-hidden
                className="size-5 shrink-0 text-foreground/60 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </Link>
          )}

          <section aria-labelledby="sources" className="mt-12">
            <h2 id="sources" className="text-[1.0625rem] font-semibold">
              Sources
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {block.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="squircle-md group flex h-full items-start gap-3 border border-border bg-card/60 p-4 outline-none transition-colors hover:border-input hover:bg-card focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9375rem] leading-snug font-medium">
                        {s.title}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {s.publisher}
                      </span>
                    </span>
                    <ExternalLink
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
                    />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>

      <aside aria-label="Explore with Mira" className="hidden lg:block">
        <MiraInvite
          href={exploreHref}
          resumeMinutes={session?.minutes}
          className="sticky top-6"
        />
      </aside>
      <MiraFab href={exploreHref} />
    </div>
  );
}

function LearnSkeleton() {
  return (
    <div
      aria-busy
      aria-label="Loading"
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]"
    >
      <div className="flex flex-col gap-4">
        <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
        <div className="h-10 w-3/4 animate-pulse rounded-lg bg-secondary" />
        <div className="squircle-lg aspect-[21/9] animate-pulse bg-secondary" />
      </div>
      <div className="squircle-lg hidden h-[32rem] animate-pulse bg-card lg:block" />
    </div>
  );
}
