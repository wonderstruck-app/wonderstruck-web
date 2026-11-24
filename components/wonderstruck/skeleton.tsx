import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

const pulse = "motion-safe:animate-pulse";

/** Placeholder for loading data. Use `dark` on photo cards and other dark panels. */
export function Bone({ className, dark = false, style }: { className?: string; dark?: boolean; style?: CSSProperties }) {
  return (
    <span aria-hidden style={style} className={cn("block", pulse, dark ? "bg-white/10" : "bg-ink/[0.06]", className)} />
  );
}

/**
 * One line of loading text. Give it the real text's size and leading in `className` so it takes exactly
 * that line's height and the content lands without a shift.
 */
export function TextBone({
  className,
  width,
  dark = false,
}: {
  className?: string;
  width: string;
  dark?: boolean;
}) {
  return (
    <span aria-hidden className={cn("block", className)}>
      <span
        className={cn("inline-block h-[0.7em] rounded-full align-middle", pulse, dark ? "bg-white/12" : "bg-ink/[0.07]")}
        style={{ width }}
      />
      {"\u200b"}
    </span>
  );
}

/** Announces loading once; the skeleton itself is hidden from assistive tech. */
export function LoadingStatus() {
  return (
    <p role="status" className="sr-only">
      Loading
    </p>
  );
}

/** Wraps content that replaced a skeleton so its cards don't fade in a second time. */
export function Settled({ late, children }: { late: boolean; children: ReactNode }) {
  return <div className={cn("contents", late && "[&_[data-rise]]:animate-none")}>{children}</div>;
}

export const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Same footprint as LearnerAvatar while the session loads. */
export function AvatarPlaceholder({ className }: { className?: string }) {
  return <span aria-hidden className={cn("block shrink-0 rounded-full bg-ink/[0.06]", className)} />;
}

/** Holds the greeting's line while the first name loads. */
export function NamePlaceholder() {
  return (
    <span
      aria-hidden
      className="inline-block h-[0.8em] w-[4.5ch] rounded-lg bg-ink/[0.07] align-baseline"
    />
  );
}

export function ProfilePlaceholder() {
  return (
    <div aria-hidden className="flex items-center gap-4">
      <AvatarPlaceholder className="size-14" />
      <div className="grid flex-1 gap-2">
        <span className="h-4 w-36 rounded-md bg-ink/[0.07]" />
        <span className="h-3.5 w-48 rounded-md bg-ink/[0.05]" />
      </div>
    </div>
  );
}
