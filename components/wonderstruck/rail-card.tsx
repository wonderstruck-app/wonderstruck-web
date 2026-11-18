import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconKey, type IconTone } from "./icon-key";
import { Rise } from "./rise";

/** Lit card for rail content: icon key, title, optional hint, body. */
export function RailCard({
  icon,
  tone,
  title,
  hint,
  order = 0,
  featured = false,
  essential = true,
  centered = false,
  art,
  children,
  className,
}: {
  icon: ReactNode;
  tone?: IconTone;
  title: string;
  hint?: ReactNode;
  order?: number;
  featured?: boolean;
  /** Non-essential cards are dropped on phones to keep the stacked rail short. */
  essential?: boolean;
  /** On phones: art on top, centred header and body, no icon key. */
  centered?: boolean;
  /** Shown above the header on phones when `centered`. */
  art?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Rise
      as="section"
      order={order}
      className={cn(
        "surface squircle-lg p-5",
        featured && "glow-soft",
        !essential && "max-md:hidden",
        centered && "max-md:px-6 max-md:pt-6 max-md:text-center",
        className,
      )}
    >
      {centered && art && <div className="mb-3 flex justify-center md:hidden">{art}</div>}
      <div className={cn("flex items-center gap-3", centered && "max-md:justify-center")}>
        <IconKey tone={tone} size="sm" className={cn(centered && "max-md:hidden")}>
          {icon}
        </IconKey>
        <div className="min-w-0">
          <h2 className="leading-snug font-bold">{title}</h2>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </Rise>
  );
}
