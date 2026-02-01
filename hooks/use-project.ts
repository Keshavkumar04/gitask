import { useQuery } from "@tanstack/react-query"; // <--- 1. Import useQuery
import { useTRPC } from "@/lib/trpc/client";
import { useLocalStorage } from "usehooks-ts";

export const useProject = () => {
  const trpc = useTRPC(); // <--- 2. Call the hook to get the client instance

  // <--- 3. Use the new syntax: useQuery + queryOptions
  const { data: projects } = useQuery(trpc.project.getProjects.queryOptions());

  const [projectId, setProjectId] = useLocalStorage("gitask-project-id", "");

  const project = projects?.find((project) => project.id === projectId);

  return {
    projects,
    project,
    projectId,
    setProjectId, // <--- 4. Added missing comma here
  };
};
