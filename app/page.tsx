import Link from "next/link";
import { Compass, Flag, Hand, HeartHandshake, Mic, RotateCcw, Sparkles, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/wonderstruck/brand";
import {
  ActivityPreview,
  DiscoverPreview,
  FeatureRow,
  GraphPreview,
  HeroMira,
  MiraPreview,
  Principle,
  RememberPreview,
} from "@/components/wonderstruck/landing";
import { ThemeToggle } from "@/components/wonderstruck/theme-toggle";
import { getBlocks, getGraph, getRecallQueue } from "@/lib/data";

export default async function Home() {
  const [blocks, graph, recall] = await Promise.all([
    getBlocks(),
    getGraph(),
    getRecallQueue(),
  ]);
  const byId = (id: string) => blocks.find((b) => b.id === id);
  const fan = ["octopus-arms", "aurora-green"]
    .map(byId)
    .filter((b): b is NonNullable<typeof b> => Boolean(b));
  const octopus = byId("octopus-arms");
  const auroraFirst = [...recall].sort(
    (a, b) => Number(b.conceptId === "auroral-emission") - Number(a.conceptId === "auroral-emission"),
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[96rem] flex-col px-5 sm:px-8 lg:px-12">
      <header className="flex h-20 items-center justify-between gap-4">
        <BrandMark />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="secondary" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section
          aria-labelledby="landing-title"
          className="hero-sky squircle-lg relative isolate overflow-hidden border border-ink/10"
        >
          <div aria-hidden className="hero-inset squircle-lg" />
          <div className="grid items-center gap-6 px-6 pt-12 sm:px-12 sm:pt-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-10 lg:px-16 lg:pt-10">
            <div className="text-center lg:py-16 lg:text-left">
              <h1
                id="landing-title"
                className="text-[2.5rem] leading-[1.02] font-bold text-balance sm:text-[3.375rem] xl:text-[4.25rem]"
              >
                Less doomscrolling.
                <br />
                <span className="text-primary-ink">More wondering.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-[40ch] text-[1.125rem] leading-relaxed text-foreground/80 sm:text-[1.25rem] lg:mx-0">
                Wonderstruck turns the things you&apos;re curious about into
                things you truly understand. Mira, your AI tutor, talks it
                through with you and helps you remember it.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Button size="lg" asChild>
                  <Link href="/login">Start wondering</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="#how">See how it works</Link>
                </Button>
              </div>
            </div>
            <HeroMira />
          </div>
        </section>

        <section
          aria-labelledby="why-title"
          className="mx-auto max-w-[56rem] py-24 text-center sm:py-32"
        >
          <h2
            id="why-title"
            className="text-[2rem] leading-[1.1] font-bold text-balance sm:text-[3rem]"
          >
            Not another feed.{" "}
            <span className="text-muted-foreground">Not another course.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[54ch] text-[1.125rem] leading-relaxed text-foreground/80 sm:text-[1.25rem]">
            Feeds keep you scrolling, and you forget it all by dinner. Courses
            ask you to commit before you&apos;re even curious. Wonderstruck
            starts with the question you actually have, and stays with you until
            it makes sense.
          </p>
        </section>

        <section
          id="how"
          aria-labelledby="how-title"
          className="scroll-mt-6"
        >
          <h2 id="how-title" className="sr-only">
            How Wonderstruck works
          </h2>
          <div className="space-y-28 sm:space-y-36">
            <FeatureRow
              id="f-discover"
              tone="blue"
              accent="accent-blue"
              icon={<Compass />}
              title="Start with a question, not a syllabus"
              preview={<DiscoverPreview blocks={fan} />}
            >
              <p>
                Browse short, fascinating questions from science, history,
                nature and the mind. When one catches your eye, tap it.
                That&apos;s today&apos;s lesson.
              </p>
            </FeatureRow>

            <FeatureRow
              id="f-mira"
              tone="honey"
              icon={<Mic />}
              title="Talk it through with Mira"
              preview={<MiraPreview />}
              flip
            >
              <p>
                Mira is your AI tutor, and you can simply talk to her. Ask why,
                interrupt, or say &ldquo;I don&apos;t get it.&rdquo; She
                explains it your way, at your pace.
              </p>
              <p>Prefer typing? That works too.</p>
            </FeatureRow>

            {octopus && (
              <FeatureRow
                id="f-interact"
                tone="green"
                accent="accent-green"
                icon={<Hand />}
                title="Learn it by doing it"
                preview={<ActivityPreview block={octopus} />}
              >
                <p>
                  Mira builds a quick activity for whatever you&apos;re
                  exploring: predict what happens, move a slider, put the steps
                  in order. Trying it yourself is what makes it click.
                </p>
              </FeatureRow>
            )}

            {auroraFirst.length > 0 && (
              <FeatureRow
                id="f-remember"
                tone="violet"
                accent="accent-violet"
                icon={<RotateCcw />}
                title="Remember it for good"
                preview={<RememberPreview queue={auroraFirst} />}
                flip
              >
                <p>
                  Every session ends with a short recap of what you learned. A
                  few days later, Mira asks you one quick question to bring it
                  back, just before you&apos;d forget.
                </p>
                <p>A minute of recall beats an hour of rereading.</p>
              </FeatureRow>
            )}

            <FeatureRow
              id="f-graph"
              tone="teal"
              accent="accent-teal"
              icon={<Waypoints />}
              title="Watch your knowledge connect"
              preview={<GraphPreview graph={graph} />}
            >
              <p>
                Everything you learn joins your own learning graph, linked by
                meaning. The wind that blows a nebula&apos;s bubble turns out to
                be a cousin of the one that lights up auroras.
              </p>
              <p>You see what you know, and what to wonder about next.</p>
            </FeatureRow>
          </div>
        </section>

        <section aria-labelledby="values-title" className="py-28 sm:py-36">
          <h2
            id="values-title"
            className="text-center text-[1.75rem] leading-tight font-bold text-balance sm:text-[2.25rem]"
          >
            Built to leave you smarter, not hooked
          </h2>
          <ul className="mx-auto mt-12 grid max-w-[72rem] gap-4 sm:grid-cols-3 sm:gap-6">
            <Principle tone="green" icon={<Flag />} title="Sessions that end">
              Each one wraps up with a recap, not another autoplay.
            </Principle>
            <Principle tone="rose" icon={<HeartHandshake />} title="No guilt trips">
              No streaks or leaderboards. Come back because you&apos;re
              curious.
            </Principle>
            <Principle tone="violet" icon={<Sparkles />} title="Mira gets to know you">
              She remembers what you know and where you got stuck, so every
              session starts from you.
            </Principle>
          </ul>
        </section>

        <section
          aria-labelledby="cta-title"
          className="hero-sky squircle-lg relative isolate mb-16 overflow-hidden border border-ink/10 px-6 py-20 text-center sm:py-28"
        >
          <div aria-hidden className="hero-inset squircle-lg" />
          <h2
            id="cta-title"
            className="text-[2rem] leading-[1.1] font-bold text-balance sm:text-[3rem]"
          >
            What are you wondering about today?
          </h2>
          <p className="mx-auto mt-4 max-w-[44ch] text-[1.125rem] leading-relaxed text-foreground/80">
            Sign in with Google and start your first session with Mira.
          </p>
          <Button size="lg" asChild className="mt-9">
            <Link href="/login">Start wondering</Link>
          </Button>
        </section>
      </main>

      <footer className="flex flex-col items-center justify-between gap-3 border-t border-ink/10 py-8 text-sm text-muted-foreground sm:flex-row">
        <BrandMark className="text-base lg:text-base" />
        <p>Wonderstruck is in preview.</p>
      </footer>
    </div>
  );
}
