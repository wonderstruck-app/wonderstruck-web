"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUp, Keyboard, Mic, MicOff, Puzzle, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Message } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MiraAvatar } from "./brand";
import { IconKey } from "./icon-key";

type VoiceState = "idle" | "listening" | "muted";

const NOT_CONNECTED =
  "I'm not connected in this preview, so I can't answer yet. Your message stays here so you can see how the session will look.";

/**
 * Live session canvas: the conversation with Mira and the activities she sets
 * up share one scrolling surface. Voice is the first input; typing is the fallback.
 */
export function SessionCanvas({
  initialMessages,
  opening,
  activity,
  activityTitle,
  suggestions = [],
}: {
  initialMessages: Message[];
  /** Shown as Mira's first turn when there is no conversation yet. */
  opening: string;
  /** Rendered inline after the conversation so far. */
  activity?: ReactNode;
  activityTitle?: string;
  suggestions?: string[];
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
    if (extra.length) endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [extra]);

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

  return (
    <section
      aria-label="Session canvas"
      className="surface squircle-lg relative flex min-h-[32rem] flex-col lg:h-full lg:min-h-0"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(oklch(1_0_0/0.045)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />

      <div className="relative min-h-0 flex-1 lg:overflow-y-auto">
        <ol aria-live="polite" className="mx-auto flex max-w-[46rem] flex-col gap-5 px-4 py-6 sm:px-8 sm:py-8">
          {messages.map((m) => (
            <Bubble key={m.id} m={m} />
          ))}

          {activity && (
            <li id="activity" className="scroll-mt-6">
              <div className="squircle-lg border border-tint-green/25 bg-[oklch(0.2_0.015_160/0.55)] shadow-[0_18px_40px_-18px_oklch(0_0_0/0.7)] backdrop-blur-sm">
                <div className="flex items-center gap-3 border-b border-tint-green/15 px-5 py-3.5">
                  <IconKey tone="green" size="sm">
                    <Puzzle />
                  </IconKey>
                  <p className="min-w-0 text-sm">
                    <span className="font-semibold">Mira set up an activity</span>
                    {activityTitle && (
                      <span className="text-foreground/65"> · {activityTitle}</span>
                    )}
                  </p>
                </div>
                <div className="p-5 sm:p-6">{activity}</div>
              </div>
            </li>
          )}

          {extra.map((m) => (
            <Bubble key={m.id} m={m} />
          ))}
        </ol>
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-10 mt-auto border-t border-white/8 bg-card/85 p-3 backdrop-blur-xl sm:p-4 lg:bottom-0 lg:rounded-b-[inherit]">
        {suggestions.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto [scrollbar-width:none] *:first:ms-auto *:last:me-auto">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="squircle-sm h-9 shrink-0 border border-border bg-background/40 px-3.5 text-sm font-medium whitespace-nowrap text-foreground/80 transition-colors outline-none hover:border-input hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div
          aria-live="polite"
          className={cn("mb-3 flex items-center gap-3 px-1 text-sm", voice === "idle" && "sr-only")}
        >
          {listening ? (
            <>
              <Waveform />
              <span className="text-foreground/85">
                Listening… voice is a preview and isn&apos;t sent anywhere.
              </span>
            </>
          ) : voice === "muted" ? (
            <span className="text-muted-foreground">
              Microphone muted. Mira won&apos;t hear you until you unmute.
            </span>
          ) : (
            "Voice is off."
          )}
        </div>

        {typing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            className="flex items-end gap-2.5"
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
            <div className="squircle-md flex min-w-0 flex-1 items-end gap-2 border border-white/10 bg-background/60 p-1.5 pl-4 shadow-[inset_0_1px_0_oklch(1_0_0/0.04)] transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring/30">
              <label htmlFor="composer" className="sr-only">
                Type to Mira
              </label>
              <textarea
                id="composer"
                rows={1}
                autoFocus
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
                className="field-sizing-content max-h-40 min-h-9 min-w-0 flex-1 scroll-mt-40 resize-none bg-transparent py-1.5 text-base leading-snug outline-none placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Send"
                disabled={!draft.trim()}
                className="size-9 shrink-0 rounded-full"
              >
                <ArrowUp />
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <Button
              type="button"
              size="icon-lg"
              variant="secondary"
              aria-label="Type instead"
              onClick={() => {
                setVoice("idle");
                setTyping(true);
              }}
              className="justify-self-end"
            >
              <Keyboard />
            </Button>
            <Button
              type="button"
              aria-pressed={listening}
              aria-label={listening ? "Stop talking" : "Talk with Mira"}
              onClick={() => setVoice(listening ? "idle" : "listening")}
              className={cn(
                "size-16 shrink-0 rounded-full p-0 [&_svg:not([class*='size-'])]:size-7",
                listening && "ring-4 ring-primary/25",
              )}
            >
              {listening ? <Square className="fill-current" /> : <Mic />}
            </Button>
            {voice !== "idle" ? (
              <Button
                type="button"
                size="icon-lg"
                variant="secondary"
                aria-pressed={voice === "muted"}
                aria-label={voice === "muted" ? "Unmute microphone" : "Mute microphone"}
                onClick={() => setVoice(voice === "muted" ? "listening" : "muted")}
                className="justify-self-start"
              >
                <MicOff />
              </Button>
            ) : (
              <span className="justify-self-start text-sm text-muted-foreground">Tap to talk</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Bubble({ m }: { m: Message }) {
  if (m.role === "mira")
    return (
      <li className="rise-in flex max-w-[92%] gap-3 self-start">
        <MiraAvatar size={34} className="mt-0.5" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">
            Mira{m.via === "voice" && " · spoke"}
          </p>
          <p className="mt-1 text-[1.0625rem] leading-relaxed text-foreground/90">{m.text}</p>
        </div>
      </li>
    );
  return (
    <li className="rise-in flex max-w-[85%] flex-col items-end gap-1 self-end">
      <span className="text-xs font-semibold text-muted-foreground">
        You{m.via === "voice" && " · spoke"}
      </span>
      <p className="squircle-md bg-white/[0.08] px-4 py-2.5 text-[1rem] leading-relaxed text-foreground">
        {m.text}
      </p>
    </li>
  );
}

function Waveform() {
  return (
    <span aria-hidden className="flex h-5 items-center gap-[3px]">
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
