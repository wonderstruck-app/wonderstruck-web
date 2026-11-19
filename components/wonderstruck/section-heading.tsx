import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  id,
  title,
  href,
  linkLabel = "See all",
  accent,
}: {
  id: string;
  title: string;
  href?: string;
  linkLabel?: string;
  /** accent-* class so the link takes the destination's colour. */
  accent?: string;
}) {
  return (
    <div className="mb-3.5 flex items-center justify-between gap-3">
      <h2 id={id} className="text-[1.1875rem] font-semibold">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className={`${accent ?? ""} inline-flex h-10 items-center gap-1.5 rounded-full px-1 text-sm font-medium text-primary-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring`}
        >
          {linkLabel}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      )}
    </div>
  );
}
