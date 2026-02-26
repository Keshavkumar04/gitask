"use client";

import { useProject } from "@/hooks/use-project";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

const TeamMembers = () => {
  const { projectId } = useProject();
  const trpc = useTRPC();

  const { data: members } = useQuery({
    ...trpc.project.getTeamMembers.queryOptions({ projectId }),
    enabled: !!projectId,
  });

  return (
    <div className="flex items-center -space-x-2 overflow-hidden">
      {members?.map((member) => (
        <div
          key={member.id}
          className="relative h-8 w-8 rounded-full ring-2 ring-white border border-gray-200 overflow-hidden"
        >
          <Image
            src={member.user.image || ""}
            alt={member.user.name || "Team member"}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default TeamMembers;
