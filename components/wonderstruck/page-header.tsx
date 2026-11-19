import type { ReactNode } from "react";

/** Standard page title block. `actions` sit to the right on wide screens. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 text-sm font-medium text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[2rem] leading-tight font-semibold sm:text-[2.375rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-[60ch] text-[1.0625rem] leading-relaxed text-foreground/75">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </header>
  );
}

/** Page width + padding shared by every app page, so titles always start in the same place. */
export function PageFrame({ children, accent }: { children: ReactNode; accent?: string }) {
  return (
    <div className={`${accent ?? ""} w-full px-4 pt-6 pb-14 sm:px-6 lg:px-8 lg:pt-8`}>
      {children}
    </div>
  );
}

/** Main column plus a related-content rail that fills wide screens. The rail stacks below on smaller screens. */
export function WithRail({
  children,
  rail,
  railLabel,
}: {
  children: ReactNode;
  rail: ReactNode;
  railLabel: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] 2xl:grid-cols-[minmax(0,1fr)_24rem] 2xl:gap-10">
      <div className="min-w-0">{children}</div>
      <aside aria-label={railLabel} className="min-w-0">
        <div className="flex flex-col gap-5 xl:sticky xl:top-8">{rail}</div>
      </aside>
    </div>
  );
}
