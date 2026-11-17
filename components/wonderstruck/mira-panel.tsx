"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, MicOff, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Message } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MiraAvatar } from "./brand";

type VoiceState = "idle" | "listening" | "muted";

const NOT_CONNECTED =
  "I'm not connected in this preview, so I can't answer yet. Your message is kept here so you can see how the conversation will look.";

/**
 * Mira conversation surface. Voice and replies are preview-only: the mic shows
 * the listening state and typed messages get an honest "not connected" note.
 */
export function MiraPanel({
  initialMessages = [],
  suggestions = [],
  context,
  composerId,
  className,
  tall = false,
}: {
  initialMessages?: Message[];
  suggestions?: string[];
  /** What Mira is focused on, e.g. the block question. */
  context?: string;
  composerId?: string;
  className?: string;
  tall?: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [voice, setVoice] = useState<VoiceState>("idle");
  const logRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [
      ...m,
      { id: `l${m.length}`, role: "learner", via: "text", text: t },
      { id: `m${m.length}`, role: "mira", via: "text", text: NOT_CONNECTED },
    ]);
    setDraft("");
  }

  const listening = voice === "listening";

  return (
    <section
      aria-label="Conversation with Mira"
      className={cn(
        "surface squircle-lg flex min-h-0 flex-col",
        className,
      )}
    >
      <header className="flex items-center gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        <MiraAvatar size={40} />
        <div className="min-w-0 flex-1">
          <p className="font-bold">Mira</p>
          <p className="truncate text-xs text-muted-foreground">
            {context ? `Exploring: ${context}` : "Your curious companion"}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          Preview
        </span>
      </header>

      <ol
        ref={logRef}
        aria-live="polite"
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 sm:px-5",
          tall ? "min-h-[20rem]" : "max-h-[28rem] min-h-[14rem]",
        )}
      >
        {messages.length === 0 && (
          <li className="m-auto max-w-[34ch] py-6 text-center text-sm leading-relaxed text-muted-foreground">
            Ask anything, out loud or by typing. Mira explains, asks you
            questions back, and adapts to what you already know.
          </li>
        )}
        {messages.map((m) => (
          <li
            key={m.id}
            className={cn(
              "flex max-w-[88%] flex-col gap-1",
              m.role === "learner" ? "self-end items-end" : "self-start",
            )}
          >
            <span className="text-xs font-semibold text-muted-foreground">
              {m.role === "mira" ? "Mira" : "You"}
              {m.via === "voice" && " · voice"}
            </span>
            <p
              className={cn(
                "squircle-md px-4 py-2.5 text-[0.9375rem] leading-relaxed",
                m.role === "learner"
                  ? "bg-secondary text-foreground"
                  : "border border-border bg-background/40 text-foreground/90",
              )}
            >
              {m.text}
            </p>
          </li>
        ))}
      </ol>

      {suggestions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:px-5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="squircle-sm h-9 shrink-0 border border-border px-3.5 text-sm font-medium whitespace-nowrap text-foreground/80 transition-colors outline-none hover:border-input hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-border p-3 sm:p-4">
        <div
          aria-live="polite"
          className={cn(
            "mb-3 flex items-center gap-3 px-1 text-sm",
            voice === "idle" && "sr-only",
          )}
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className="flex items-end gap-2"
        >
          <Button
            type="button"
            size="icon-lg"
            variant={listening ? "default" : "secondary"}
            aria-pressed={listening}
            aria-label={listening ? "Stop talking" : "Talk with Mira"}
            onClick={() => setVoice(listening ? "idle" : "listening")}
          >
            {listening ? <Square className="fill-current" /> : <Mic />}
          </Button>
          {voice !== "idle" && (
            <Button
              type="button"
              size="icon-lg"
              variant="ghost"
              aria-pressed={voice === "muted"}
              aria-label={voice === "muted" ? "Unmute microphone" : "Mute microphone"}
              onClick={() => setVoice(voice === "muted" ? "listening" : "muted")}
            >
              <MicOff />
            </Button>
          )}
          <label htmlFor={composerId ?? "mira-composer"} className="sr-only">
            Message Mira
          </label>
          <textarea
            id={composerId ?? "mira-composer"}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            placeholder="Ask Mira anything…"
            className="squircle-sm min-h-12 flex-1 resize-none border border-input bg-background/50 px-4 py-3 text-[0.9375rem] leading-snug outline-none placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <Button
            type="submit"
            size="icon-lg"
            aria-label="Send"
            disabled={!draft.trim()}
          >
            <ArrowUp />
          </Button>
        </form>
      </div>
    </section>
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
