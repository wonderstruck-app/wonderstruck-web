"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MemoryItem } from "@/lib/data";

const kindLabel: Record<MemoryItem["kind"], string> = {
  interest: "Interest",
  misconception: "Worth revisiting",
  preference: "Preference",
};

/** What Mira remembers about the learner; each item can be removed. */
export function MemoryList({ items: initial }: { items: MemoryItem[] }) {
  const [items, setItems] = useState(initial);

  if (items.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        Mira isn&apos;t remembering anything about you right now.
      </p>
    );

  return (
    <ul className="flex flex-col divide-y divide-ink/6 border-t border-ink/6">
      {items.map((m) => (
        <li key={m.id} className="flex items-start gap-3 py-3 last:pb-0">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">
              {kindLabel[m.kind]}
            </p>
            <p className="mt-0.5 text-[0.9375rem] leading-snug">{m.text}</p>
            <p className="mt-1 text-xs text-muted-foreground">{m.evidence}</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Forget: ${m.text}`}
            onClick={() => setItems(items.filter((x) => x.id !== m.id))}
            className="text-muted-foreground"
          >
            <X />
          </Button>
        </li>
      ))}
    </ul>
  );
}
