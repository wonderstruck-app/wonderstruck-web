"use client";

import { useId, useState, useSyncExternalStore, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Learner, Settings } from "@/lib/data";
import { cn } from "@/lib/utils";

const paces: Settings["voice"]["pace"][] = ["relaxed", "natural", "brisk"];

/** Settings form. Local state only in the preview; save handlers wire to the API later. */
export function SettingsForm({
  learner,
  settings,
}: {
  learner: Learner;
  settings: Settings;
}) {
  const [interests, setInterests] = useState(settings.interests);
  const [voice, setVoice] = useState(settings.voice);
  const [privacy, setPrivacy] = useState(settings.privacy);

  return (
    <div className="flex flex-col gap-6">
      <Section title="Profile">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/15 text-lg font-semibold text-primary-ink">
            {learner.initials}
          </span>
          <div className="min-w-0">
            <p className="font-semibold">{learner.name}</p>
            <p className="truncate text-sm text-muted-foreground">{learner.email}</p>
          </div>
        </div>
      </Section>

      <Appearance />

      <Section
        id="interests"
        title="Interests"
        description="Shapes what appears in Discover. Your sessions shape it too."
      >
        <div role="group" aria-label="Interests" className="flex flex-wrap gap-2">
          {interests.map((i) => (
            <button
              key={i.topic}
              type="button"
              aria-pressed={i.selected}
              onClick={() =>
                setInterests(
                  interests.map((x) =>
                    x.topic === i.topic ? { ...x, selected: !x.selected } : x,
                  ),
                )
              }
              className={cn(
                "squircle-sm h-10 border px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i.selected
                  ? "border-primary/50 bg-primary/12 text-primary-ink"
                  : "border-border text-muted-foreground hover:border-input hover:text-foreground",
              )}
            >
              {i.topic}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Mira's voice" description="Voice is a preview and isn't connected yet.">
        <fieldset>
          <legend className="sr-only">Voice</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {voice.voices.map((v) => (
              <label
                key={v.id}
                className={cn(
                  "squircle-md cursor-pointer border p-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  voice.voiceId === v.id
                    ? "border-primary/50 bg-primary/8"
                    : "border-border hover:border-input",
                )}
              >
                <input
                  type="radio"
                  name="voice"
                  value={v.id}
                  checked={voice.voiceId === v.id}
                  onChange={() => setVoice({ ...voice, voiceId: v.id })}
                  className="sr-only"
                />
                <span className="block font-semibold">{v.label}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{v.detail}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="mb-2 text-sm font-medium">Speaking pace</legend>
          <div className="squircle-sm inline-flex gap-1 border border-border bg-background/40 p-1">
            {paces.map((p) => (
              <label
                key={p}
                className={cn(
                  "squircle-sm flex h-9 cursor-pointer items-center px-4 text-sm font-medium capitalize transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  voice.pace === p ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <input
                  type="radio"
                  name="pace"
                  value={p}
                  checked={voice.pace === p}
                  onChange={() => setVoice({ ...voice, pace: p })}
                  className="sr-only"
                />
                {p}
              </label>
            ))}
          </div>
        </fieldset>

        <Toggle
          className="mt-5"
          label="Let me interrupt Mira"
          detail="Start talking and Mira stops to listen."
          checked={voice.interruptible}
          onChange={(v) => setVoice({ ...voice, interruptible: v })}
        />
      </Section>

      <Section title="Privacy and memory">
        <div className="flex flex-col gap-5">
          <Toggle
            label="Keep conversation transcripts"
            detail="Needed for recaps. Off means sessions keep only the recap."
            checked={privacy.keepTranscripts}
            onChange={(v) => setPrivacy({ ...privacy, keepTranscripts: v })}
          />
          <Toggle
            label="Remember things I get wrong"
            detail="Mira revisits misunderstandings later, gently."
            checked={privacy.rememberMisconceptions}
            onChange={(v) => setPrivacy({ ...privacy, rememberMisconceptions: v })}
          />
          <Toggle
            label="Personalize Discover"
            detail="Use your sessions and graph to choose blocks."
            checked={privacy.personalizeDiscover}
            onChange={(v) => setPrivacy({ ...privacy, personalizeDiscover: v })}
          />
        </div>
      </Section>

      <Section title="Your data">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary">
            <Download aria-hidden />
            Export everything
          </Button>
          <Button variant="destructive">
            <Trash2 aria-hidden />
            Delete account
          </Button>
        </div>
      </Section>
    </div>
  );
}

const themes = [
  ["system", "Match device"],
  ["light", "Light"],
  ["dark", "Dark"],
] as const;

const noop = () => () => {};

function Appearance() {
  const { theme, setTheme } = useTheme();
  // The stored theme is only known on the client.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  return (
    <Section title="Appearance">
      <fieldset>
        <legend className="sr-only">Theme</legend>
        <div className="squircle-sm inline-flex gap-1 border border-border bg-background/40 p-1">
          {themes.map(([value, label]) => (
            <label
              key={value}
              className={cn(
                "squircle-sm flex h-9 cursor-pointer items-center px-4 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                mounted && theme === value ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <input
                type="radio"
                name="theme"
                value={value}
                checked={mounted && theme === value}
                onChange={() => setTheme(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
    </Section>
  );
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const hid = useId();
  return (
    <section
      id={id}
      aria-labelledby={hid}
      className="surface squircle-lg scroll-mt-8 p-5 sm:p-6"
    >
      <h2 id={hid} className="text-[1.125rem] font-semibold">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Toggle({
  label,
  detail,
  checked,
  onChange,
  className,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <label htmlFor={id} className="cursor-pointer">
        <span className="block font-medium">{label}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{detail}</span>
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
