import { loginPath } from "@/lib/auth-redirect";

import { mockSource } from "./mock";
import type { DataSource } from "./types";
import { apiError, makeSource } from "./wire";

// Browser-side FastAPI source. `/api/v1` is proxied to the API by next.config.ts, so the
// Better Auth cookie travels with every same-origin request.

async function request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    method: init.method ?? "GET",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
      ...(init.body !== undefined && { "content-type": "application/json" }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (res.status === 401) {
    // Outside React (shared fetch layer), so a hard navigation is the only option; it also drops stale cache.
    window.location.assign(loginPath(window.location.pathname + window.location.search));
    // Never settles: the page is navigating away.
    return new Promise<T>(() => {});
  }
  if (!res.ok) throw await apiError(res, path);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const clientSource: DataSource =
  process.env.NEXT_PUBLIC_WONDERSTRUCK_DATA === "mock" ? mockSource : makeSource({ request });
