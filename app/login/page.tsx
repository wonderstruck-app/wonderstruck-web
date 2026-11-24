import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark, MiraMascot } from "@/components/wonderstruck/brand";
import {
  GoogleButton,
  GoogleSignIn,
} from "@/components/wonderstruck/google-sign-in";
import { ThemeToggle } from "@/components/wonderstruck/theme-toggle";
import { safeNext } from "@/lib/auth-redirect";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[96rem] flex-col px-5 sm:px-8 lg:px-12">
      <header className="flex h-20 items-center justify-between">
        <Link
          href="/"
          className="squircle-sm -mx-2 px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandMark />
        </Link>
        <ThemeToggle />
      </header>

      <main className="grid flex-1 place-items-center pb-20">
        <div className="w-full max-w-[24rem] text-center">
          <MiraMascot
            width={112}
            loading="eager"
            className="mx-auto mb-6 dark:drop-shadow-[0_14px_24px_color-mix(in_oklch,var(--shadow-color)_calc(0.45*var(--shade)*100%),transparent)]"
          />
          <h1 className="text-[2rem] leading-tight font-semibold text-balance">
            Welcome to Wonderstruck
          </h1>
          <p className="mx-auto mt-3 max-w-[32ch] text-[1.0625rem] leading-relaxed text-muted-foreground">
            Sign in to keep your sessions, recaps and learning graph in one
            place.
          </p>

          <div className="mt-8">
            <Suspense
              fallback={
                <div className="grid gap-3">
                  <GoogleButton />
                  <p className="min-h-5" />
                </div>
              }
            >
              <GoogleSignIn />
            </Suspense>
          </div>

          <p className="mx-auto mt-4 max-w-[34ch] text-[0.8125rem] leading-relaxed text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>

      <Suspense>
        <RedirectIfSignedIn searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/** Uses the real session (not just the cookie), so a stale cookie can't cause a redirect loop. */
async function RedirectIfSignedIn({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  if (!(await getSession())) return null;
  const { next } = await searchParams;
  redirect(safeNext(typeof next === "string" ? next : null));
}
