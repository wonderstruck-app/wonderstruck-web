import Image from "next/image";
import { cn } from "@/lib/utils";

/** Wonderstruck wordmark: text only, with "Wonder" in Mira cream. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("text-[1.25rem] leading-tight font-semibold lg:text-[1.375rem]", className)}>
      <span className="text-primary-ink">Wonder</span>struck
    </span>
  );
}

/** Full-body Mira, for welcome and supportive moments only. */
export function MiraMascot({
  className,
  width = 120,
  loading,
}: {
  className?: string;
  width?: number;
  loading?: "eager" | "lazy";
}) {
  return (
    <Image
      src="/brand/mira-owl.png"
      alt=""
      width={width}
      height={Math.round((width * 867) / 720)}
      loading={loading}
      className={cn("select-none", className)}
    />
  );
}
