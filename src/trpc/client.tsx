"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import superjson from "superjson";
import { getQueryClient } from "@/trpc/query-client";
import type { AppRouter } from "@/trpc/router";

// Create tRPC context for React Query integration
const { TRPCProvider: TRPCContextProvider, useTRPC } = createTRPCContext<AppRouter>();

export { useTRPC };

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return ""; // browser should use relative url
  }
  // Server-side
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <TRPCContextProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TRPCContextProvider>
  );
}
