import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import type { Learner } from "@/lib/data/types";

/** The Better Auth session for this request, or null. Deduplicated per render. */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

/**
 * The signed-in learner, narrowed to what the UI needs. Redirects to /login when there is no
 * valid session; proxy.ts already gates pages, so this is a second line of defence.
 */
export const getCurrentLearner = cache(async (): Promise<Learner> => {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id, name, email, image } = session.user;
  const display = name.trim() || email.split("@")[0];
  return {
    id,
    name: display,
    firstName: display.split(/\s+/)[0],
    initials: initialsOf(display),
    email,
    image: image ?? null,
  };
});

function initialsOf(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts.at(-1)![0] : name.slice(0, 2);
  return letters.toUpperCase();
}
