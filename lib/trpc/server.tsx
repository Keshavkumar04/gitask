// lib/trpc/server.ts
import "server-only";

import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createTRPCContext } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";
import { makeQueryClient } from "./query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

// 1. Create a stable getter for the query client per request
export const getQueryClient = cache(makeQueryClient);

// 2. Create the tRPC proxy for server components
export const trpc = createTRPCOptionsProxy({
  ctx: () => createTRPCContext({ headers: new Headers() }), // Adjusted for simple header passing
  router: appRouter,
  queryClient: getQueryClient,
});

// 3. Helper to hydrate the data to the client
export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}