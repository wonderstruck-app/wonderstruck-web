import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { apiError, makeSource } from "./wire";

export { ApiError } from "./wire";

// Server-side FastAPI source, for the few reads that still render on the server (metadata).
// It forwards the learner's Better Auth cookie, which the API verifies itself.

const BASE = `${(process.env.API_URL ?? "http://localhost:8000").replace(/\/+$/, "")}/api/v1`;

async function request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  // Per-learner and time-relative (labels use `new Date()`): always render at request time.
  await connection();
  const cookie = (await headers()).get("cookie") ?? "";
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: init.method ?? "GET",
      headers: {
        accept: "application/json",
        cookie,
        ...(init.body !== undefined && { "content-type": "application/json" }),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch (cause) {
    throw new Error(`The Wonderstruck API is unreachable at ${BASE}. Start it with \`npm run api\`.`, {
      cause,
    });
  }
  if (res.status === 401) redirect("/login");
  if (!res.ok) throw await apiError(res, path);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

// `cache` dedupes reads within one render: metadata and the page often ask for the same data.
export const apiSource = makeSource({ request }, cache);
