"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Activity, Choice } from "@/lib/data";
import { cn } from "@/lib/utils";

export function ActivityView({ activity }: { activity: Activity }) {
  return (
    <div>
      <p className="text-xs font-medium text-tint-green">
        {activity.kind === "predict"
          ? "Predict"
          : activity.kind === "order"
            ? "Put in order"
            : "Simulate"}
      </p>
      <h3 className="mt-1 text-[1.1875rem] font-semibold">{activity.title}</h3>
      <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-foreground/80">
        {activity.prompt}
      </p>
      <div className="mt-5">
        {activity.kind === "predict" && <Predict a={activity} />}
        {activity.kind === "order" && <Order a={activity} />}
        {activity.kind === "simulate" && <Simulate a={activity} />}
      </div>
    </div>
  );
}

function Reveal({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <div aria-live="polite" className="rise-in mt-4 squircle-md border border-border bg-background/40 p-4">
      {ok !== undefined && (
        <p className={cn("font-medium", ok ? "text-success" : "text-destructive")}>
          {ok ? "Good prediction." : "Not this time. Here's why:"}
        </p>
      )}
      <p className="mt-1 text-[0.9375rem] leading-relaxed text-foreground/85">{children}</p>
    </div>
  );
}

function Predict({ a }: { a: Extract<Activity, { kind: "predict" }> }) {
  const [pick, setPick] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={a.prompt}>
        {a.options.map((o) => {
          const sel = pick === o.id;
          const ans = o.id === a.answerId;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={sel}
              disabled={done}
              onClick={() => setPick(o.id)}
              className={cn(
                "squircle-sm flex min-h-12 items-center gap-3 border border-border px-4 py-2.5 text-left text-[0.9375rem] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !done && !sel && "hover:border-input hover:bg-accent/60",
                !done && sel && "border-primary/70 bg-primary/10",
                done && ans && "border-success/60 bg-success/10",
                done && sel && !ans && "border-destructive/60 bg-destructive/10",
              )}
            >
              <span className="flex-1">{o.label}</span>
              {done && ans && <Check aria-hidden className="size-4 text-success" />}
              {done && sel && !ans && <X aria-hidden className="size-4 text-destructive" />}
            </button>
          );
        })}
      </div>
      {done ? (
        <Reveal ok={pick === a.answerId}>{a.reveal}</Reveal>
      ) : (
        <Button className="mt-4" disabled={!pick} onClick={() => setDone(true)}>
          Lock in prediction
        </Button>
      )}
    </>
  );
}

/** Deterministic shuffle so server and client agree. */
function scramble(items: Choice[]) {
  const n = items.length;
  const out = items
    .map((x, i) => ({ x, k: (i * 7 + 3) % n }))
    .sort((p, q) => p.k - q.k)
    .map((p) => p.x);
  return out.every((x, i) => x.id === items[i].id) ? [...items].reverse() : out;
}

function Order({ a }: { a: Extract<Activity, { kind: "order" }> }) {
  const start = useMemo(() => scramble(a.items), [a.items]);
  const [list, setList] = useState(start);
  const [done, setDone] = useState(false);
  const ok = list.every((x, i) => x.id === a.items[i].id);

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
  };

  return (
    <>
      <ol className="grid gap-2">
        {list.map((x, i) => {
          const right = done && x.id === a.items[i].id;
          return (
            <li
              key={x.id}
              className={cn(
                "squircle-sm flex min-h-12 items-center gap-3 border border-border py-1.5 pr-1.5 pl-4",
                done && (right ? "border-success/50 bg-success/8" : "border-destructive/50 bg-destructive/8"),
              )}
            >
              <span className="w-5 text-sm font-semibold text-muted-foreground tabular-nums">{i + 1}</span>
              <span className="flex-1 text-[0.9375rem]">{x.label}</span>
              {!done && (
                <span className="flex gap-1">
                  <Button size="icon" variant="ghost" aria-label={`Move ${x.label} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label={`Move ${x.label} down`} disabled={i === list.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown />
                  </Button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {done ? (
        <>
          <Reveal ok={ok}>{a.reveal}</Reveal>
          {!ok && (
            <Button variant="secondary" className="mt-3" onClick={() => { setList(start); setDone(false); }}>
              <RotateCcw aria-hidden />
              Try again
            </Button>
          )}
        </>
      ) : (
        <Button className="mt-4" onClick={() => setDone(true)}>
          Check order
        </Button>
      )}
    </>
  );
}

function Simulate({ a }: { a: Extract<Activity, { kind: "simulate" }> }) {
  const { param } = a;
  const [v, setV] = useState(param.initial);
  const band = a.bands.find((b) => v <= b.upTo) ?? a.bands[a.bands.length - 1];
  return (
    <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_14rem] sm:items-center">
      <div>
        <label htmlFor="sim" className="flex items-baseline justify-between text-sm font-medium">
          {param.label}
          <span className="text-[1.25rem] font-semibold tabular-nums">
            {v} {param.unit}
          </span>
        </label>
        <input
          id="sim"
          type="range"
          min={param.min}
          max={param.max}
          step={param.step}
          value={v}
          onChange={(e) => setV(Number(e.target.value))}
          className="mt-3 h-11 w-full cursor-pointer accent-[var(--primary)]"
        />
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>{param.min} {param.unit}</span>
          <span>{param.max} {param.unit}</span>
        </div>
      </div>
      <div aria-live="polite" className="squircle-md overflow-hidden border border-border">
        <div className="h-16 transition-colors duration-500" style={{ background: band.swatch }} />
        <div className="p-3.5">
          <p className="font-semibold">{band.label}</p>
          <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{band.detail}</p>
        </div>
      </div>
    </div>
  );
}
