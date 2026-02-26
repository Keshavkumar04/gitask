import { Appsidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

const SidebarLayout = async ({ children }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <Appsidebar />

      <main className="w-full h-screen flex flex-col overflow-hidden">
        <div className="flex-1 bg-gray-50 rounded-md border shadow-sm m-2 overflow-auto">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;
