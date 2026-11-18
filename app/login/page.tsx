import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark, MiraMascot } from "@/components/wonderstruck/brand";
import {
  GoogleButton,
  GoogleSignIn,
} from "@/components/wonderstruck/google-sign-in";
import { ThemeToggle } from "@/components/wonderstruck/theme-toggle";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
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
            className="mx-auto mb-6 drop-shadow-[0_14px_24px_color-mix(in_oklch,var(--shadow-color)_calc(0.45*var(--shade)*100%),transparent)]"
          />
          <h1 className="text-[2rem] leading-tight font-bold text-balance">
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
            We only use your Google name, email and photo to set up your
            account.
          </p>
        </div>
      </main>
    </div>
  );
}
