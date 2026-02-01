// import { auth } from "@/lib/auth"; // import from your server config
// import { headers } from "next/headers";
// import { redirect } from "next/navigation";

// export default async function DashboardPage() {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   if (!session) {
//     return redirect("/"); // Redirect if not logged in
//   }

//   return (
//     <main>
//       <h1>Welcome, {session.user.name}!</h1>
//       <p>Email: {session.user.email}</p>
//       <img
//         src={session.user.image || ""}
//         alt="Avatar"
//         width={50}
//         height={50}
//         style={{ borderRadius: "50%" }}
//       />
//     </main>
//   );
// }

// app/dashboard/page.tsx
"use client"; // We use a client component to start simple

import { useProject } from "@/hooks/use-project";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const trpc = useTRPC();
  const { project } = useProject();

  // Call the 'user.me' procedure we created earlier
  const { data, isLoading } = useQuery(trpc.user.me.queryOptions());

  if (isLoading) return <div>Loading user data...</div>;

  return (
    <div>
      <div>
        <div>
          <Github />
          <p>
            This project is linkden to{" "}
            <Link href={project?.githubUrl ?? ""}>
              {project?.githubUrl}
              <ExternalLink />
            </Link>
          </p>
        </div>
        <div>team members invite button archive button</div>
        <div>Ask question card</div>
      </div>
      <div>commit log</div>
    </div>
  );
}
