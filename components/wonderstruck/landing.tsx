import type { CSSProperties, ReactNode } from "react";
import { Check } from "lucide-react";
import type { LearningBlock, LearningGraph, Message, RecallItem } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MiraMascot } from "./brand";
import { ActivityView } from "./activity";
import { GraphSnapshot } from "./graph-snapshot";
import { LearningCard } from "./learning-card";
import { RecallCard } from "./recall-card";
import { SessionCanvas } from "./session-canvas";
import { IconKey, toneColor, type IconTone } from "./icon-key";
import { Tinted } from "./tinted";

/** Hero visual: Mira on her own, standing on the hero's bottom edge. */
export function HeroMira() {
  return (
    <div className="flex justify-center self-end lg:justify-end lg:pr-6">
      <MiraMascot
        width={480}
        loading="eager"
        className="pointer-events-none w-48 translate-y-[3%] drop-shadow-[0_18px_30px_color-mix(in_oklch,var(--shadow-color)_calc(0.45*var(--shade)*100%),transparent)] sm:w-64 lg:w-full lg:max-w-[22rem]"
      />
    </div>
  );
}

/** One core feature: a plain-language promise beside a picture of the product doing it. */
export function FeatureRow({
  id,
  tone,
  icon,
  title,
  children,
  preview,
  accent,
  flip = false,
}: {
  id: string;
  tone: IconTone;
  accent?: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
  preview: ReactNode;
  flip?: boolean;
}) {
  return (
    <article
      aria-labelledby={id}
      style={{ "--t": toneColor[tone] } as CSSProperties}
      className={cn(
        "grid items-center gap-10 lg:gap-14 xl:gap-16",
        flip ? "lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]",
        accent,
      )}
    >
      <div className={cn("max-w-[32rem]", flip && "lg:order-2 lg:justify-self-start")}>
        <IconKey tone={tone} size="lg">
          {icon}
        </IconKey>
        <h3
          id={id}
          className="mt-6 text-[1.875rem] leading-[1.1] font-semibold sm:text-[2.5rem]"
        >
          {title}
        </h3>
        <div className="mt-4 space-y-3 text-[1.0625rem] leading-relaxed text-muted-foreground sm:text-[1.1875rem]">
          {children}
        </div>
      </div>
      <div
        className={cn(
          "squircle-lg min-w-0 border border-[color-mix(in_oklch,var(--t)_22%,transparent)] bg-[radial-gradient(120%_90%_at_50%_0%,color-mix(in_oklch,var(--t)_18%,transparent),color-mix(in_oklch,var(--t)_4%,transparent)_75%)] p-3 sm:p-6",
          flip && "lg:order-1",
        )}
      >
        {preview}
      </div>
    </article>
  );
}

/** A slice of the real Discover feed. */
export function DiscoverPreview({ blocks }: { blocks: LearningBlock[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
      {blocks.slice(0, 2).map((b) => (
        <LearningCard key={b.id} block={b} />
      ))}
    </div>
  );
}

const conversation: Message[] = [
  {
    id: "c1",
    role: "mira",
    via: "voice",
    text: "Here's the strange part: about two-thirds of an octopus's neurons live in its arms, not its brain.",
  },
  { id: "c2", role: "learner", via: "voice", text: "Wait, so the arms can decide things on their own?" },
  {
    id: "c3",
    role: "mira",
    via: "voice",
    text: "A little, yes. Picture the brain as a manager, and each arm as a team that sorts out the details.",
  },
];

/** The real session canvas, embedded: same captions and voice keys as a live session. */
export function MiraPreview() {
  return (
    <figure className="glass squircle-lg p-6 sm:p-9">
      <figcaption className="sr-only">
        An example voice conversation with Mira about octopus arms.
      </figcaption>
      <SessionCanvas embedded initialMessages={conversation} opening="" />
    </figure>
  );
}

/** The real activity Mira hands over mid-session; visitors can try it. */
export function ActivityPreview({ block }: { block: LearningBlock }) {
  if (!block.activity) return null;
  return (
    <figure className="glass squircle-lg p-6 sm:p-9">
      <figcaption className="mb-5 flex items-center gap-2.5 text-sm font-medium">
        <IconKey tone="green" size="sm">
          <Check />
        </IconKey>
        Mira set up an activity
      </figcaption>
      <ActivityView activity={block.activity} />
    </figure>
  );
}

/** A session recap with the real recall card resting on top of it. */
export function RememberPreview({ queue }: { queue: RecallItem[] }) {
  const ideas = [
    "Green comes from oxygen, about 100 to 250 km up.",
    "Earth's magnetic field funnels particles to the poles.",
    "It isn't reflected sunlight. Excited atoms give off the light.",
  ];
  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <figure className="glass squircle-lg p-6 sm:w-[86%] sm:p-8">
        <figcaption>
          <p className="text-sm font-medium text-muted-foreground">Session recap</p>
          <p className="mt-1 text-[1.25rem] leading-snug font-semibold">{queue[0]?.sessionTitle}</p>
        </figcaption>
        <ul className="mt-5 space-y-3">
          {ideas.map((t) => (
            <li key={t} className="flex gap-3 leading-relaxed text-foreground/85">
              <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-tint-violet [corner-shape:round]" />
              {t}
            </li>
          ))}
        </ul>
      </figure>
      <div className="self-end sm:w-[78%]">
        <RecallCard queue={queue} />
      </div>
    </div>
  );
}

/** The real graph snapshot from Today. */
export function GraphPreview({ graph }: { graph: LearningGraph }) {
  return <GraphSnapshot graph={graph} />;
}

/** One principle on its own tinted tile; three sit side by side with clear gaps. */
export function Principle({
  tone,
  icon,
  title,
  children,
}: {
  tone: IconTone;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Tinted as="li" tone={tone} className="squircle-lg flex flex-col gap-5 p-6 text-left sm:p-8">
      <IconKey tone={tone}>{icon}</IconKey>
      <div>
        <p className="text-[1.25rem] font-semibold">{title}</p>
        <p className="mt-2 leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </Tinted>
  );
}
