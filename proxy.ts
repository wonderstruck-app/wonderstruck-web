import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { loginPath } from "@/lib/auth-redirect";

// Pages anyone can open. Every other page needs a signed-in learner, so new routes are private by default.
const PUBLIC_PATHS = new Set(["/", "/login", "/terms", "/privacy"]);

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  // Validates the session, not just the cookie's presence. The signed cookie cache (lib/auth.ts) keeps
  // this off the database for most requests.
  const session = await auth.api.getSession({ headers: request.headers });
  if (session) return NextResponse.next();

  return NextResponse.redirect(new URL(loginPath(pathname + search), request.url));
}

export const config = {
  matcher: [
    // Everything except API routes (Better Auth and FastAPI check auth themselves), build output and static files.
    "/((?!api/|_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|gif|webp|avif|svg|txt|xml|webmanifest)$).*)",
  ],
};
