"use client";

import { useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecallItem } from "@/lib/data";
import { cn } from "@/lib/utils";

/** One active-recall question with answer selection, checking, and explanation. Remount (key) per item. */
export function RecallQuestion({
  item,
  onChecked,
  after,
  secondary,
  className,
}: {
  item: RecallItem;
  onChecked?: (correct: boolean) => void;
  /** Rendered in place of "Check answer" once checked. */
  after: ReactNode;
  /** Optional quiet action beside the primary button. */
  secondary?: ReactNode;
  className?: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = selected === item.correctId;

  return (
    <div className={cn("flex flex-col", className)}>
      <fieldset disabled={checked}>
        <legend className="text-[0.9375rem] leading-snug font-semibold">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            From “{item.sessionTitle}”
          </span>
          {item.question}
        </legend>
        <div className="mt-3.5 grid gap-2">
          {item.options.map((o) => {
            const isSel = selected === o.id;
            const isAnswer = o.id === item.correctId;
            return (
              <label
                key={o.id}
                className={cn(
                  "squircle-sm flex min-h-11 cursor-pointer items-center gap-3 border border-border px-4 py-2 text-[0.9375rem] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  !checked && "hover:border-input hover:bg-accent/60",
                  !checked && isSel && "border-primary/70 bg-primary/10",
                  checked && isAnswer && "border-success/60 bg-success/10",
                  checked &&
                    isSel &&
                    !isAnswer &&
                    "border-destructive/60 bg-destructive/10",
                  checked && "cursor-default",
                )}
              >
                <input
                  type="radio"
                  name={`recall-${item.id}`}
                  value={o.id}
                  checked={isSel}
                  onChange={() => setSelected(o.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border border-input",
                    isSel && !checked && "border-primary bg-primary",
                  )}
                >
                  {isSel && !checked && (
                    <span className="size-2 rounded-full bg-primary-foreground" />
                  )}
                  {checked && isAnswer && (
                    <Check className="size-3.5 text-success" />
                  )}
                  {checked && isSel && !isAnswer && (
                    <X className="size-3.5 text-destructive" />
                  )}
                </span>
                {o.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div aria-live="polite">
        {checked && (
          <div className="rise-in mt-5">
            <p
              className={cn(
                "font-medium",
                correct ? "text-success" : "text-destructive",
              )}
            >
              {correct ? "That's it." : "Not quite."}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {item.explanation}
            </p>
            <p className="mt-2 text-sm text-foreground/80">
              {correct
                ? "Mira will bring this back in a few days."
                : "Mira will bring this back sooner, with a different angle."}
            </p>
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-5">
        {checked ? (
          after
        ) : (
          <Button
            className="flex-1"
            disabled={!selected}
            onClick={() => {
              setChecked(true);
              onChecked?.(correct);
            }}
          >
            Check answer
          </Button>
        )}
        {secondary}
      </div>
    </div>
  );
}
