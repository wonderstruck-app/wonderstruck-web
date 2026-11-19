import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toneColor, type IconTone } from "./icon-key";

/** Surface washed with one tint: a faint fill and a matching hairline. */
export function Tinted({
  tone,
  as: Tag = "div",
  className,
  children,
}: {
  tone: IconTone;
  as?: "div" | "li";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      style={{ "--t": toneColor[tone] } as CSSProperties}
      className={cn(
        "border border-[color-mix(in_oklch,var(--t)_22%,transparent)] bg-[color-mix(in_oklch,var(--t)_7%,var(--card))]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
