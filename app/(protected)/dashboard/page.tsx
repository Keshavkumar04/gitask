"use client";

import AskQuestionCard from "@/components/AskQuestionCard";
import CommitLog from "@/components/CommitLog";
import InviteButton from "@/components/InviteButton";
import TeamMembers from "@/components/TeamMembers";
import { useProject } from "@/hooks/use-project";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Github, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const trpc = useTRPC();
  const { project } = useProject();

  const { data: projects, isLoading: projectsLoading } = useQuery(
    trpc.project.getProjects.queryOptions(),
  );

  const { data: user, isLoading: userLoading } = useQuery(
    trpc.user.me.queryOptions(),
  );

  if (projectsLoading || userLoading) return null;

  if (!project && (!projects || projects.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-6 text-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full">
          <div className="flex justify-center mb-4">
            <Github className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No projects yet
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Link a GitHub repository to get started with Code Council.
          </p>
          <Link href="/create">
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
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

      <div className="space-y-4">
        <div>
          <AskQuestionCard />
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Commit History
            </h2>
          </div>
          <CommitLog />
        </div>
      </div>
    </div>
  );
}
