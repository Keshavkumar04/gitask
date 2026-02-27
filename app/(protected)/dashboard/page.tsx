"use client";

import AskQuestionCard from "@/components/AskQuestionCard";
import CommitLog from "@/components/CommitLog";
import InviteButton from "@/components/InviteButton";
import TeamMembers from "@/components/TeamMembers";
import { useProject } from "@/hooks/use-project";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Github, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const trpc = useTRPC();
  const { project } = useProject();

  const { data: projects, isLoading: projectsLoading } = useQuery({
    ...trpc.project.getProjects.queryOptions(),
    refetchInterval: (query) =>
      query.state.data?.some((p) => p.status === "INDEXING") ? 5000 : false,
  });

  const { data: user, isLoading: userLoading } = useQuery(
    trpc.user.me.queryOptions(),
  );

  if (projectsLoading || userLoading) return null;

  if (!project && (!projects || projects.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="w-full max-w-xs text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center size-10 rounded-full bg-primary/10">
              <Github className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h1 className="text-base font-semibold text-gray-900">
            No projects yet
          </h1>
          <p className="text-xs text-gray-500 mt-1 mb-5">
            Link a GitHub repository to get started.
          </p>
          <Link href="/create">
            <Button size="sm" className="w-full text-xs">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create Project
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
          <Github className="h-4 w-4 text-gray-700" />
          <div className="h-4 w-px bg-gray-200 mx-2"></div>
          <span className="text-xs font-medium text-gray-600">
            This project is linked to
          </span>
          <Link
            href={project?.githubUrl ?? ""}
            target="_blank"
            className="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-xs"
          >
            {project?.githubUrl}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <TeamMembers />
          <InviteButton />
        </div>
      </div>

      {project?.status === "INDEXING" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
          <div className="text-sm text-yellow-800">
            <span>
              This project is being indexed. You can ask questions once indexing
              is complete.
            </span>
            {project.fileCount && (
              <span className="block text-xs text-yellow-600 mt-1">
                Estimated time: ~
                {Math.max(1, Math.ceil((project.fileCount * 12) / 60))} minutes
                ({project.fileCount} files)
              </span>
            )}
          </div>
        </div>
      )}

      {project?.status === "FAILED" && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <span className="text-sm text-red-800">
            Indexing failed for this project. Your credits have been refunded.
          </span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          {project?.status === "READY" ? (
            <AskQuestionCard />
          ) : project?.status === "INDEXING" ? (
            <div className="rounded-lg border bg-white p-6 text-center text-sm text-gray-500">
              Indexing in progress... Questions will be available once complete.
            </div>
          ) : null}
        </div>

        {project?.status === "READY" && (
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                Commit History
              </h2>
            </div>
            <CommitLog />
          </div>
        )}
      </div>
    </div>
  );
}
