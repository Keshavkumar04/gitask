import "server-only";

import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createTRPCContext } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";
import { makeQueryClient } from "./query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
  ctx: () => createTRPCContext({ headers: new Headers() }),
  router: appRouter,
  queryClient: getQueryClient,
});

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}
