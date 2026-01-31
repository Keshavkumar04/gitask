import { auth } from "@/lib/auth"; // import from your server config
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/"); // Redirect if not logged in
  }

  return (
    <main>
      <h1>Welcome, {session.user.name}!</h1>
      <p>Email: {session.user.email}</p>
      <img
        src={session.user.image || ""}
        alt="Avatar"
        width={50}
        height={50}
        style={{ borderRadius: "50%" }}
      />
    </main>
  );
}
