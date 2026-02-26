"use client";

import { useProject } from "@/hooks/use-project";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";

const CommitLog = () => {
  const { projectId, project } = useProject();
  const trpc = useTRPC();

  const { data: commits } = useQuery({
    ...trpc.project.getCommits.queryOptions({ projectId }),
    enabled: !!projectId,
  });

  return (
    <ul className="space-y-6">
      {commits?.map((commit, commitIdx) => {
        return (
          <li key={commit.id} className="relative flex gap-x-4">
            <div
              className={cn(
                commitIdx === commits.length - 1 ? "h-6" : "-bottom-6",
                "absolute left-0 top-0 flex w-6 justify-center",
              )}
            >
              <div className="w-px translate-x-1 bg-gray-200" />
            </div>

            {/* Avatar */}
            <div className="relative flex h-8 w-8 flex-none items-center justify-center bg-white z-10">
              <img
                src={commit.commitAuthorAvatar}
                alt="avatar"
                className="h-8 w-8 rounded-full bg-gray-50 border border-gray-200"
              />
            </div>

            <div className="flex-auto min-w-0 rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between gap-x-4">
                <div className="py-0.5 text-xs leading-5 text-gray-500">
                  <span className="font-medium text-gray-900">
                    {commit.commitAuthorName}
                  </span>{" "}
                  <a
                    href={`${project?.githubUrl}/commit/${commit.commitHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center hover:underline"
                  >
                    committed
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="mb-2 mt-1">
                <p className="text-sm font-semibold text-gray-800 leading-6">
                  {commit.commitMessage}
                </p>
              </div>

              <pre className="mt-2 w-full overflow-x-auto rounded-md bg-gray-50 p-2 text-xs text-gray-600 font-mono">
                {commit.summary}
              </pre>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default CommitLog;
