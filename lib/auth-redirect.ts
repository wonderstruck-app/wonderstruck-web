export const HOME_PATH = "/dashboard";

/**
 * A same-origin path that is safe to send the learner to after sign-in. Rejects absolute and
 * protocol-relative URLs (open redirects) and the login page itself (redirect loops).
 */
export function safeNext(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return HOME_PATH;
  if (raw === "/login" || raw.startsWith("/login?") || raw.startsWith("/login/")) return HOME_PATH;
  return raw;
}

/** The login URL that returns to `next` once the learner signs in. */
export function loginPath(next?: string | null): string {
  const target = safeNext(next);
  return target === HOME_PATH ? "/login" : `/login?next=${encodeURIComponent(target)}`;
}
