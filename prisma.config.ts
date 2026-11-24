import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// Load .env / .env.local the same way `next dev` does, so Prisma and the app share one DATABASE_URL.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
