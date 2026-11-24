"use client";

import { useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecallItem, RecallResult } from "@/lib/data";
import { useReviewRecall } from "@/lib/data/queries";
import { cn } from "@/lib/utils";

/** One active-recall question with answer selection, checking, and explanation. Remount (key) per item. */
export function RecallQuestion({
  item,
  onChecked,
  after,
  secondary,
  size = "md",
  className,
}: {
  item: RecallItem;
  onChecked?: (correct: boolean) => void;
  /** Rendered in place of "Check answer" once checked. */
  after: ReactNode;
  /** Optional quiet action beside the primary button. */
  secondary?: ReactNode;
  /** `lg` is the focused Recall page: bigger question and roomier options. */
  size?: "md" | "lg";
  className?: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<RecallResult | null>(null);
  const review = useReviewRecall();
  const pending = review.isPending;
  const error = review.isError;
  const checked = result !== null;
  const correct = result?.correct ?? false;

  function check(optionId: string) {
    const finish = (r: RecallResult) => {
      setResult(r);
      onChecked?.(r.correct);
    };
    // The landing showcase carries its answer; real cards are graded (and scheduled) server-side.
    if (item.answer) return finish({ ...item.answer, correct: optionId === item.answer.correctId });
    review.mutate(
      { itemId: item.id, optionId, clientId: crypto.randomUUID() },
      { onSuccess: finish },
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <fieldset disabled={checked || pending}>
        <legend
          className={cn(
            "leading-snug font-medium text-balance",
            size === "lg" ? "text-[1.25rem] font-semibold sm:text-[1.5rem]" : "text-[0.9375rem]",
          )}
        >
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
            From “{item.sessionTitle}”
          </span>
          {item.question}
        </legend>
        <div className={cn("grid gap-2", size === "lg" ? "mt-6 gap-2.5" : "mt-3.5")}>
          {item.options.map((o, i) => {
            const isSel = selected === o.id;
            const isAnswer = o.id === result?.correctId;
            return (
              <label
                key={o.id}
                className={cn(
                  "squircle-sm flex cursor-pointer items-center gap-3 border border-border text-[0.9375rem] transition-colors",
                  size === "lg" ? "min-h-14 px-3 py-2.5 sm:text-base" : "min-h-11 px-4 py-2",
                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  !checked && !isSel && "hover:border-input hover:bg-accent/60",
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
                {size === "lg" ? (
                  <span
                    aria-hidden
                    className={cn(
                      "squircle-sm grid size-8 shrink-0 place-items-center bg-ink/[0.06] text-sm font-semibold text-muted-foreground transition-colors",
                      isSel && !checked && "bg-primary text-primary-foreground",
                      checked && isAnswer && "bg-success text-background",
                      checked && isSel && !isAnswer && "bg-destructive text-background",
                    )}
                  >
                    {checked && isAnswer ? (
                      <Check className="size-4" />
                    ) : checked && isSel ? (
                      <X className="size-4" />
                    ) : (
                      String.fromCharCode(65 + i)
                    )}
                  </span>
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border border-input",
                      isSel && !checked && "border-primary bg-primary",
                    )}
                  >
                    {isSel && !checked && <span className="size-2 rounded-full bg-primary-foreground" />}
                    {checked && isAnswer && <Check className="size-3.5 text-success" />}
                    {checked && isSel && !isAnswer && <X className="size-3.5 text-destructive" />}
                  </span>
                )}
                {o.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div aria-live="polite">
        {error && (
          <p className="rise-in mt-5 text-sm text-destructive">
            Couldn’t check that just now. Try again in a moment.
          </p>
        )}
        {result && (
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
              {result.explanation}
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
            size={size === "lg" ? "lg" : "default"}
            className="flex-1"
            disabled={!selected || pending}
            aria-busy={pending}
            onClick={() => selected && check(selected)}
          >
            {pending ? "Checking…" : "Check answer"}
          </Button>
        )}
        {secondary}
      </div>
    </div>
  );
}
