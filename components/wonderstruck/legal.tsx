import Link from "next/link";
import { BrandMark } from "@/components/wonderstruck/brand";
import { ThemeToggle } from "@/components/wonderstruck/theme-toggle";

export const SUPPORT_EMAIL = "wonderstruckapp@gmail.com";
export const LEGAL_UPDATED = "November 24, 2026";

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[96rem] flex-col px-5 sm:px-8 lg:px-12">
      <header className="flex h-20 items-center justify-between gap-4">
        <Link
          href="/"
          className="squircle-sm -mx-2 px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandMark />
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 py-10 sm:py-16">
        <article className="mx-auto max-w-[68ch]">
          <p className="text-sm text-muted-foreground">Last updated {LEGAL_UPDATED}</p>
          <h1 className="mt-2 text-[2.25rem] leading-tight font-semibold text-balance sm:text-[2.75rem]">
            {title}
          </h1>
          <div className="mt-5 text-[1.125rem] leading-relaxed text-foreground/80">{intro}</div>
          <div className="mt-12 grid gap-10">{children}</div>
        </article>
      </main>

      <LegalFooter />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 text-[1rem] leading-relaxed text-foreground/85">
      <h2 className="text-[1.25rem] leading-snug font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function LegalList({ children }: { children: React.ReactNode }) {
  return <ul className="grid list-disc gap-2 pl-5 marker:text-primary-ink">{children}</ul>;
}

export function Mail() {
  return (
    <a
      href={`mailto:${SUPPORT_EMAIL}`}
      className="font-medium text-primary-ink underline underline-offset-4"
    >
      {SUPPORT_EMAIL}
    </a>
  );
}

export function LegalFooter() {
  return (
    <footer className="flex flex-col items-center justify-between gap-3 border-t border-ink/10 py-8 text-sm text-muted-foreground sm:flex-row">
      <BrandMark className="text-base lg:text-base" />
      <nav aria-label="Legal" className="flex items-center gap-5">
        <Link href="/terms" className="hover:text-foreground">
          Terms
        </Link>
        <Link href="/privacy" className="hover:text-foreground">
          Privacy
        </Link>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-foreground">
          Contact
        </a>
      </nav>
    </footer>
  );
}
