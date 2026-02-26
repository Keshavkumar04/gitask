import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ projectId: string }>;
};

const JoinHandler = async (props: Props) => {
  const { projectId } = await props.params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect("");
  }

  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) return redirect("/dashboard");

  try {
    await prisma.userToProject.create({
      data: {
        userId,
        projectId,
      },
    });
  } catch (error) {
    console.log("User already in project");
  }

  return redirect(`/dashboard`);
};

export default JoinHandler;
