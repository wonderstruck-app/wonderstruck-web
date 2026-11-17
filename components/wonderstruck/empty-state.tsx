import type { ReactNode } from "react";
import { MiraMascot } from "./brand";

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="squircle-lg flex flex-col items-center border border-dashed border-border px-6 py-12 text-center">
      <MiraMascot width={96} />
      <h2 className="mt-4 text-[1.1875rem] font-bold">{title}</h2>
      {children && (
        <p className="mt-1.5 max-w-[42ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
          {children}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
