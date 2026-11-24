import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { prisma } from "@/lib/db";

// Reads BETTER_AUTH_URL and BETTER_AUTH_SECRET from the environment; the BETTER_AUTH_URL origin is
// trusted automatically. Tables (user, session, account, verification) live in prisma/schema.prisma.
export const auth = betterAuth({
  appName: "Wonderstruck",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account",
    },
  },
  session: {
    // Signed cookie cache so most requests skip the session lookup.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  account: {
    // Google access and refresh tokens are stored AES-256-GCM encrypted.
    encryptOAuthTokens: true,
  },
  databaseHooks: {
    user: {
      create: {
        // Every learner starts with default preferences.
        after: async (user) => {
          await prisma.learnerSettings.upsert({
            where: { userId: user.id },
            create: { userId: user.id },
            update: {},
          });
        },
      },
    },
  },
  // Must stay last so server actions can set auth cookies.
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
