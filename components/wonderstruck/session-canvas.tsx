"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUp, Keyboard, Mic, MicOff, Puzzle, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Message } from "@/lib/data";
import { useMiraLive } from "@/lib/mira-live";
import { cn } from "@/lib/utils";
import { MiraMascot } from "./brand";
import { IconKey } from "./icon-key";

type VoiceState = "idle" | "listening" | "muted";
type Turn = Message & { interrupted?: boolean };

const NOT_CONNECTED =
  "I'm not connected in this preview, so I can't answer yet. Your message stays here so you can see how the session will look.";

export type LiveTarget = {
  /** Resolves the session to talk in, starting one if needed. */
  getSessionId: () => Promise<string>;
  /** After the call ends and its turns are saved. */
  onClose?: (sessionId: string) => void;
};

const noSession = () => Promise.reject(new Error("No live session in a preview."));

/**
 * Live session: no chat window. The conversation reads as open captions, with
 * Mira standing beside her latest reply. One large speak key leads, with its
 * "Tap to talk" on its left when idle; while live, mute takes that spot and the status sits beneath. Keyboard key on the right.
 */
export function SessionCanvas({
  initialMessages,
  opening,
  activity,
  activityTitle,
  suggestions = [],
  embedded = false,
  live,
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
  /** Talk to Mira for real (Gemini Live). Without it the canvas is a static preview. */
  live?: LiveTarget;
}) {
  const [messages] = useState<Message[]>(
    initialMessages.length
      ? initialMessages
      : [{ id: "open", role: "mira", via: "voice", text: opening }],
  );
  const [extra, setExtra] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [previewVoice, setPreviewVoice] = useState<VoiceState>("idle");
  const mira = useMiraLive({ getSessionId: live?.getSessionId ?? noSession, onClose: live?.onClose });
  const captions: Turn[] = mira.captions;
  const voice: VoiceState = live ? (mira.mic === "off" ? "idle" : mira.mic === "on" ? "listening" : "muted") : previewVoice;
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
    if (extra.length || captions.length) endRef.current?.scrollIntoView({ block: embedded ? "nearest" : "end", behavior: "smooth" });
  }, [extra, captions.length, embedded]);

  function setVoice(next: VoiceState) {
    if (!live) return setPreviewVoice(next);
    if (next === "listening") return voice === "muted" ? mira.setMuted(false) : void mira.startTalking();
    if (next === "muted") return mira.setMuted(true);
    mira.stop();
  }

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    if (live) {
      void mira.sendText(t);
      setDraft("");
      return;
    }
    const n = messages.length + extra.length;
    setExtra((m) => [
      ...m,
      { id: `l${n}`, role: "learner", via: "text", text: t },
      { id: `m${n}`, role: "mira", via: "text", text: NOT_CONNECTED },
    ]);
    setDraft("");
  }

  const listening = voice === "listening";
  const lastMira = [...messages, ...extra, ...captions].findLast((m) => m.role === "mira")?.id;
  const status = !live
    ? listening
      ? "Listening · preview"
      : voice === "muted"
        ? "Muted"
        : "Tap to talk"
    : mira.status === "connecting"
      ? "Connecting to Mira…"
      : mira.speaking
        ? "Mira is speaking"
        : voice === "muted"
          ? "Muted"
          : listening
            ? "Listening"
            : "Tap to talk";
  // Mira glows while the call is live, whether she or the learner is talking.
  const active = listening || mira.speaking;

  return (
    <section
      aria-label="Session with Mira"
      className={cn("relative flex min-w-0 flex-col", !embedded && "min-h-[max(28rem,calc(100dvh-13.5rem))] lg:h-full lg:min-h-0")}
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
            <Line key={m.id} m={m} present={m.id === lastMira} listening={active} />
          ))}

          {activity && (
            <li id="activity" className="scroll-mt-10 sm:pl-[3.75rem]">
              <div className="glass squircle-lg border-ink/10 bg-ink/[0.03]">
                <div className="flex items-center gap-3 px-4 pt-4 sm:px-5">
                  <IconKey tone="green" size="sm">
                    <Puzzle />
                  </IconKey>
                  <p className="min-w-0 text-sm">
                    <span className="font-medium">Mira set up an activity</span>
                    {activityTitle && <span className="text-foreground/60"> · {activityTitle}</span>}
                  </p>
                </div>
                <div className="p-4 sm:p-6">{activity}</div>
              </div>
            </li>
          )}

          {[...extra, ...captions].map((m) => (
            <Line key={m.id} m={m} present={m.id === lastMira} listening={active} />
          ))}
        </ol>
        <div ref={endRef} />
      </div>

      <div
        className={cn(
          "flex shrink-0 flex-col items-center",
          embedded
            ? "gap-6 pt-9"
            : "sticky bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-10 -mx-4 gap-3 border-t border-border bg-white px-4 pt-3 pb-5 sm:-mx-6 sm:gap-4 sm:py-4 sm:px-6 dark:bg-[oklch(0.115_0.006_265)] lg:bottom-0 lg:mx-0 lg:gap-6 lg:border-t-0 lg:bg-transparent lg:px-0 lg:pt-12 lg:pb-2 lg:dark:bg-transparent",
        )}
      >
        {mira.error && (
          <p
            role="alert"
            className="squircle-md flex w-full max-w-[38rem] items-start gap-3 border border-destructive/25 bg-destructive/[0.06] py-2.5 pr-2 pl-4 text-sm leading-relaxed text-foreground/85"
          >
            <span className="min-w-0 flex-1 py-0.5">{mira.error}</span>
            <Button type="button" size="icon-sm" variant="ghost" aria-label="Dismiss" onClick={mira.dismissError}>
              <X />
            </Button>
          </p>
        )}

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
            <div className="squircle-md box-border flex min-h-12 min-w-0 flex-1 items-center border border-ink/10 bg-ink/[0.04] px-4 backdrop-blur-xl transition-colors focus-within:border-primary/45">
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
                className="field-sizing-content max-h-40 min-w-0 flex-1 resize-none bg-transparent py-[11px] text-base leading-6 outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Button type="submit" size="icon-lg" aria-label="Send" disabled={!draft.trim()} className="shrink-0">
              <ArrowUp />
            </Button>
          </form>
        ) : (
          <div className="flex w-full flex-col items-center gap-3 sm:gap-4 lg:gap-6">
            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-5 sm:gap-6">
              <div className="justify-self-end">
                {voice === "idle" ? (
                  <p className="text-sm text-muted-foreground">Tap to talk</p>
                ) : (
                  <Button
                    type="button"
                    size="icon-lg"
                    variant="secondary"
                    className="max-sm:size-10"
                    aria-pressed={voice === "muted"}
                    aria-label={voice === "muted" ? "Unmute microphone" : "Mute microphone"}
                    onClick={() => setVoice(voice === "muted" ? "listening" : "muted")}
                  >
                    <MicOff />
                  </Button>
                )}
              </div>
              <Button
                type="button"
                aria-pressed={listening}
                aria-label={voice !== "idle" ? "End the call" : "Talk with Mira"}
                disabled={live && mira.status === "connecting" && voice === "idle"}
                onClick={() => setVoice(voice !== "idle" ? "idle" : "listening")}
                className={cn(
                  "squircle-md size-13 shrink-0 p-0 [--key-depth:4px] sm:size-16 sm:[--key-depth:5px] [&_svg:not([class*='size-'])]:size-5 sm:[&_svg:not([class*='size-'])]:size-6",
                  voice !== "idle" && "bg-primary text-primary-foreground [--key-edge:var(--primary-edge)] hover:bg-primary",
                )}
              >
                {voice !== "idle" ? <Square className="fill-current" /> : <Mic />}
              </Button>
              <Button
                type="button"
                size="icon-lg"
                variant="secondary"
                aria-label="Type instead"
                className="justify-self-start max-sm:size-10"
                onClick={() => {
                  // Typing keeps the call open (Mira still answers aloud) but frees the mic.
                  if (live) mira.stopTalking();
                  else setPreviewVoice("idle");
                  setTyping(true);
                }}
              >
                <Keyboard />
              </Button>
            </div>
            {(voice !== "idle" || mira.status === "connecting" || mira.speaking) && (
              <p aria-live="polite" className="flex h-5 items-center gap-2.5 text-sm text-muted-foreground">
                {active && <Waveform />}
                <span className={cn(active && "text-foreground/85")}>{status}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/** Centred caption-style turn: Mira leads in full contrast, the learner is quieter. */
function Line({ m, present, listening }: { m: Turn; present: boolean; listening: boolean }) {
  const mira = m.role === "mira";
  return (
    <li className="rise-in grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2.5 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:items-start sm:gap-x-4">
      <span
        aria-hidden
        className={cn(
          "relative mb-2 place-items-center sm:row-span-2 sm:mb-0 sm:grid sm:self-start",
          present ? "grid" : "hidden",
        )}
      >
        {present && (
          <>
            <span
              className={cn(
                "absolute hidden size-12 rounded-full dark:block bg-[radial-gradient(closest-side,oklch(0.9_0.05_82/0.22),transparent)] transition-opacity duration-500 sm:size-20",
                listening ? "breathe" : "opacity-60",
              )}
            />
            <MiraMascot
              width={44}
              className="relative h-auto w-7 dark:drop-shadow-[0_6px_12px_color-mix(in_oklch,var(--shadow-color)_calc(0.4*var(--shade)*100%),transparent)] sm:w-11"
            />
          </>
        )}
      </span>
      <p
        className={cn(
          "mb-1.5 text-xs font-medium sm:col-span-1 sm:col-start-2",
          present ? "col-start-2 max-sm:mb-2" : "col-span-2", mira ? "text-primary-ink/80" : "text-muted-foreground")}>
        {mira ? "Mira" : "You"}
        {m.via === "voice" && " · spoke"}
        {m.interrupted && " · cut off"}
      </p>
      <p
        className={cn(
          "col-span-2 text-pretty sm:col-span-1 sm:col-start-2",
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
