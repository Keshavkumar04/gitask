"use client";

import { useProject } from "@/hooks/use-project";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";

const CommitLog = () => {
  const { projectId, project } = useProject();
  const trpc = useTRPC();

  const { data: commits } = useQuery({
    // 1. Spread the tRPC options
    ...trpc.project.getCommits.queryOptions({ projectId }),

    // 2. Add extra React Query options here
    // This query will NOT run if projectId is empty or undefined
    enabled: !!projectId,
  });

  return (
    <>
      <ul>
        {commits?.map((commit, commitIdx) => {
          return (
            <li key={commit.id}>
              <div
                className={cn(
                  commitIdx === commits.length - 1 ? "h-6" : "-bottom-6",
                  "absolute left-0 top-0 flex w-6 justify-center",
                )}
              >
                <div></div>
                <>
                  <img src={commit.commitAuthorAvatar} alt="commit avatar" />
                  <div>
                    <div>
                      <Link
                        target="_blank"
                        href={`${project?.githubUrl}/commits/${commit.commitHash}`}
                      >
                        <span>{commit.commitAuthorName}</span>{" "}
                        <span>
                          Commited
                          <ExternalLink />
                        </span>
                      </Link>
                    </div>
                  </div>
                  <span>{commit.commitMessage}</span>
                  <pre>{commit.summary}</pre>
                </>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default CommitLog;
