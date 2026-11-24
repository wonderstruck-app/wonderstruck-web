import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Staggered entrance wrapper; `order` sets the delay step. Disabled under reduced motion in CSS. */
export function Rise({
  order,
  children,
  className,
  as: Tag = "div",
}: {
  order: number;
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  return (
    <Tag
      data-rise
      className={cn("rise-in", className)}
      style={{ "--rise-order": order } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
