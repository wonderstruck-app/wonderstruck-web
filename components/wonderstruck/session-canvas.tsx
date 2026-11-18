"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUp, Keyboard, Mic, MicOff, Puzzle, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Message } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MiraMascot } from "./brand";
import { IconKey } from "./icon-key";

type VoiceState = "idle" | "listening" | "muted";

const NOT_CONNECTED =
  "I'm not connected in this preview, so I can't answer yet. Your message stays here so you can see how the session will look.";

/**
 * Live session: no chat window. The conversation reads as open captions, with
 * Mira standing beside her latest reply. One large speak key leads, with its
 * status beside it; typing and mute are small keys on the other side.
 */
export function SessionCanvas({
  initialMessages,
  opening,
  activity,
  activityTitle,
  suggestions = [],
  embedded = false,
}: {
  initialMessages: Message[];
  /** Shown as Mira's first turn when there is no conversation yet. */
  opening: string;
  /** Rendered inline after the conversation so far. */
  activity?: ReactNode;
  activityTitle?: string;
  suggestions?: string[];
  /** Inline preview (e.g. the landing page): no page-height layout, sticky dock or edge fade. */
  embedded?: boolean;
}) {
  const [messages] = useState<Message[]>(
    initialMessages.length
      ? initialMessages
      : [{ id: "open", role: "mira", via: "voice", text: opening }],
  );
  const [extra, setExtra] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [voice, setVoice] = useState<VoiceState>("idle");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#composer") setTyping(true);
    };
    const id = setTimeout(onHash, 0);
    window.addEventListener("hashchange", onHash);
    return () => {
      clearTimeout(id);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  useEffect(() => {
    if (extra.length) endRef.current?.scrollIntoView({ block: embedded ? "nearest" : "end", behavior: "smooth" });
  }, [extra, embedded]);

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    const n = messages.length + extra.length;
    setExtra((m) => [
      ...m,
      { id: `l${n}`, role: "learner", via: "text", text: t },
      { id: `m${n}`, role: "mira", via: "text", text: NOT_CONNECTED },
    ]);
    setDraft("");
  }

  const listening = voice === "listening";
  const lastMira = [...messages, ...extra].findLast((m) => m.role === "mira")?.id;
  const status = listening ? "Listening · preview" : voice === "muted" ? "Muted" : "Tap to talk";

  return (
    <section
      aria-label="Session with Mira"
      className={cn("relative flex min-w-0 flex-col", !embedded && "min-h-[34rem] lg:h-full lg:min-h-0")}
    >
      <div
        className={cn(
          "relative min-h-0 flex-1",
          !embedded &&
            "[mask-image:linear-gradient(to_bottom,transparent,black_3rem,black_calc(100%-2rem),transparent)] lg:overflow-y-auto [scrollbar-width:none]",
        )}
      >
        <ol aria-label="Conversation" className={cn("mx-auto flex max-w-[44rem] flex-col gap-7 px-1", !embedded && "py-10")}>
          {messages.map((m) => (
            <Line key={m.id} m={m} present={m.id === lastMira} listening={listening} />
          ))}

          {activity && (
            <li id="activity" className="scroll-mt-10 pl-12 sm:pl-[3.75rem]">
              <div className="glass squircle-lg border-ink/10 bg-ink/[0.03]">
                <div className="flex items-center gap-3 px-5 pt-4">
                  <IconKey tone="green" size="sm">
                    <Puzzle />
                  </IconKey>
                  <p className="min-w-0 text-sm">
                    <span className="font-semibold">Mira set up an activity</span>
                    {activityTitle && <span className="text-foreground/60"> · {activityTitle}</span>}
                  </p>
                </div>
                <div className="p-5 sm:p-6">{activity}</div>
              </div>
            </li>
          )}

          {extra.map((m) => (
            <Line key={m.id} m={m} present={m.id === lastMira} listening={listening} />
          ))}
        </ol>
        <div ref={endRef} />
      </div>

      <div
        className={cn(
          "flex shrink-0 flex-col items-center gap-4",
          embedded
            ? "pt-9"
            : "sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-10 bg-gradient-to-t from-background from-65% to-transparent pt-12 pb-3 lg:bottom-0 lg:bg-none lg:pb-2",
        )}
      >
        {suggestions.length > 0 && !typing && (
          <div className="flex w-full min-w-0 [justify-content:safe_center] gap-1 overflow-x-auto px-1 [scrollbar-width:none]">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="h-8 shrink-0 rounded-full px-3 text-sm whitespace-nowrap text-muted-foreground transition-colors outline-none hover:bg-ink/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {typing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            className="flex w-full max-w-[38rem] items-end gap-2.5"
          >
            <Button
              type="button"
              size="icon-lg"
              variant="secondary"
              aria-label="Switch to voice"
              onClick={() => {
                setTyping(false);
                setVoice("listening");
              }}
              
            >
              <Mic />
            </Button>
            <div className="flex min-w-0 flex-1 items-end gap-2 rounded-[1.5rem] border border-ink/10 bg-ink/[0.04] p-1.5 pl-4 backdrop-blur-xl transition-colors focus-within:border-primary/45">
              <label htmlFor="composer" className="sr-only">
                Type to Mira
              </label>
              <textarea
                id="composer"
                rows={1}
                autoFocus={!embedded}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(draft);
                  }
                  if (e.key === "Escape" && !draft) setTyping(false);
                }}
                placeholder="Type to Mira…"
                className="field-sizing-content max-h-40 min-h-9 min-w-0 flex-1 resize-none bg-transparent py-1.5 text-base leading-snug outline-none placeholder:text-muted-foreground"
              />
              <Button type="submit" size="icon" aria-label="Send" disabled={!draft.trim()} className="size-9 shrink-0">
                <ArrowUp />
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-5">
            <div className="flex items-center gap-2.5 justify-self-end">
              {voice !== "idle" && (
                <Button
                  type="button"
                  size="icon-lg"
                  variant="secondary"
                  aria-pressed={voice === "muted"}
                  aria-label={voice === "muted" ? "Unmute microphone" : "Mute microphone"}
                  onClick={() => setVoice(voice === "muted" ? "listening" : "muted")}
                >
                  <MicOff />
                </Button>
              )}
              <Button
                type="button"
                size="icon-lg"
                variant="secondary"
                aria-label="Type instead"
                onClick={() => {
                  setVoice("idle");
                  setTyping(true);
                }}
              >
                <Keyboard />
              </Button>
            </div>
            <Button
              type="button"
              aria-pressed={listening}
              aria-label={listening ? "Stop talking" : "Talk with Mira"}
              onClick={() => setVoice(listening ? "idle" : "listening")}
              className={cn(
                "squircle-md size-20 shrink-0 p-0 [--key-depth:6px] [&_svg:not([class*='size-'])]:size-8",
                listening && "bg-primary text-primary-foreground [--key-edge:var(--primary-edge)] hover:bg-primary",
              )}
            >
              {listening ? <Square className="fill-current" /> : <Mic />}
            </Button>
            <p aria-live="polite" className="flex items-center gap-2.5 justify-self-start text-sm text-muted-foreground">
              {listening && <Waveform />}
              <span className={cn(listening && "text-foreground/85")}>{status}</span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/** Centred caption-style turn: Mira leads in full contrast, the learner is quieter. */
function Line({ m, present, listening }: { m: Message; present: boolean; listening: boolean }) {
  const mira = m.role === "mira";
  return (
    <li className="rise-in grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-x-4">
      <span aria-hidden className="relative row-span-2 grid place-items-center self-start">
        {present && (
          <>
            <span
              className={cn(
                "absolute size-16 rounded-full bg-[radial-gradient(closest-side,oklch(0.9_0.05_82/0.22),transparent)] transition-opacity duration-500 sm:size-20",
                listening ? "breathe" : "opacity-60",
              )}
            />
            <MiraMascot
              width={44}
              className="relative h-auto w-9 drop-shadow-[0_6px_12px_color-mix(in_oklch,var(--shadow-color)_calc(0.4*var(--shade)*100%),transparent)] sm:w-11"
            />
          </>
        )}
      </span>
      <p className={cn("col-start-2 mb-1.5 text-xs font-semibold", mira ? "text-primary-ink/80" : "text-muted-foreground")}>
        {mira ? "Mira" : "You"}
        {m.via === "voice" && " · spoke"}
      </p>
      <p
        className={cn(
          "col-start-2 text-pretty",
          mira
            ? "text-[1.1875rem] leading-relaxed text-foreground sm:text-[1.3125rem]"
            : "text-[1rem] leading-relaxed text-foreground/60",
        )}
      >
        {m.text}
      </p>
    </li>
  );
}

function Waveform() {
  return (
    <span aria-hidden className="flex h-4 items-center gap-[3px]">
      {[0.5, 0.9, 0.6, 1, 0.7].map((h, i) => (
        <span
          key={i}
          className="w-[3px] origin-center animate-[wave_1s_ease-in-out_infinite] rounded-full bg-primary motion-reduce:animate-none"
          style={{ height: `${h * 100}%`, animationDelay: `${i * 120}ms` }}
        />
      ))}
    </span>
  );
}
