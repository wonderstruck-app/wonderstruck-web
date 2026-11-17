import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  id,
  title,
  href,
  linkLabel = "See all",
}: {
  id: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-3.5 flex items-center justify-between gap-3">
      <h2 id={id} className="text-[1.1875rem] font-bold">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex h-10 items-center gap-1.5 rounded-full px-1 text-sm font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {linkLabel}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      )}
    </div>
  );
}
