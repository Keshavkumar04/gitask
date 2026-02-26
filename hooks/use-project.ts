import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import { useLocalStorage } from "usehooks-ts";

export const useProject = () => {
  const trpc = useTRPC();

  const { data: projects } = useQuery(trpc.project.getProjects.queryOptions());

  const [projectId, setProjectId] = useLocalStorage("gitask-project-id", "");

  const project = projects?.find((project) => project.id === projectId);

  // Auto-select the first project if none is selected or the selected one no longer exists
  useEffect(() => {
    if (projects && projects.length > 0 && !project) {
      setProjectId(projects[0]!.id);
    }
  }, [projects, project, setProjectId]);

  return {
    projects,
    project,
    projectId,
    setProjectId,
  };
};
