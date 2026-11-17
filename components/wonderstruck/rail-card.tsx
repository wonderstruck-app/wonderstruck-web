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
  children,
  className,
}: {
  icon: ReactNode;
  tone?: IconTone;
  title: string;
  hint?: ReactNode;
  order?: number;
  featured?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Rise
      as="section"
      order={order}
      className={cn("surface squircle-lg p-5", featured && "glow-soft", className)}
    >
      <div className="flex items-center gap-3">
        <IconKey tone={tone} size="sm">
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
