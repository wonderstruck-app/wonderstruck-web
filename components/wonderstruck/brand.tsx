import Image from "next/image";
import { cn } from "@/lib/utils";

/** Wonderstruck logo: full-body Mira with the wordmark. */
export function BrandMark({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 lg:gap-2.5", className)}>
      <Image
        src="/brand/mira-owl.png"
        alt={showWordmark ? "" : "Wonderstruck"}
        width={38}
        height={46}
        className="h-9 w-auto shrink-0 drop-shadow-[0_4px_10px_oklch(0_0_0/0.35)] lg:h-[2.875rem]"
        loading="eager"
      />
      {showWordmark && (
        <span className="text-[1.0625rem] leading-tight font-bold lg:text-[1.1875rem]">
          Wonderstruck
        </span>
      )}
    </span>
  );
}

/** Compact companion avatar for Mira. Decorative by default; pair with visible text. */
export function MiraAvatar({
  size = 40,
  className,
  label,
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[oklch(0.32_0.03_60)] ring-1 ring-white/10",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/mira-head.png"
        alt={label ?? ""}
        width={size}
        height={size}
        className="translate-y-[4%] scale-[1.08]"
      />
    </span>
  );
}

/** Full-body Mira, for welcome and supportive moments only. */
export function MiraMascot({
  className,
  width = 120,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <Image
      src="/brand/mira-owl.png"
      alt=""
      width={width}
      height={Math.round((width * 867) / 720)}
      className={cn("select-none", className)}
    />
  );
}
