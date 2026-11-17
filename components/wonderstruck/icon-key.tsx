import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  cream: "var(--primary)",
  blue: "var(--tint-blue)",
  green: "var(--tint-green)",
  honey: "var(--tint-honey)",
} as const;

export type IconTone = keyof typeof tones;

/** Small tinted 3D tile that holds a section or mode icon. */
export function IconKey({
  tone = "cream",
  size = "md",
  children,
  className,
}: {
  tone?: IconTone;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      style={{ "--chip": tones[tone] } as CSSProperties}
      className={cn(
        "icon-key squircle-sm grid shrink-0 place-items-center",
        size === "sm" && "size-8 [&_svg]:size-4",
        size === "md" && "size-10 [&_svg]:size-5",
        size === "lg" && "size-12 [&_svg]:size-6",
        className,
      )}
    >
      {children}
    </span>
  );
}
