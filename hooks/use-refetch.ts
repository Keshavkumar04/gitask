import { useQueryClient } from "@tanstack/react-query";

export const useRefetch = () => {
  const queryClient = useQueryClient();

  return async () => {
    // This refetches ALL queries that are currently being used on the screen
    await queryClient.refetchQueries({
      type: "active", // Only refetch data that is currently visible
    });
  };
};
