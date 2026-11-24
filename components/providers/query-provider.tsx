"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Revisits render from cache instantly and refresh in the background after a minute.
            staleTime: 60_000,
            gcTime: 30 * 60_000,
            retry: 1,
            // Failed reads surface in the route's error boundary rather than as blank views.
            throwOnError: true,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools buttonPosition="bottom-right" />}
    </QueryClientProvider>
  );
}
