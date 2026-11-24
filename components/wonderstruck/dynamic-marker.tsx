import { connection } from "next/server";

/**
 * Marks a route as request-time without blocking its static shell. Pages whose data lives in client
 * queries but whose `generateMetadata` reads the API render this inside `<Suspense>`.
 */
export async function DynamicMarker() {
  await connection();
  return null;
}
