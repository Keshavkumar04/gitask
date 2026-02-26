"use client";

import { useState } from "react";
import {
  Bot,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useProject } from "@/hooks/use-project";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRefetch } from "@/hooks/use-refetch";
import { useSession, authClient } from "@/lib/auth-client";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
];

export const Appsidebar = () => {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { projects, projectId, setProjectId } = useProject();
  const trpc = useTRPC();
  const refetch = useRefetch();
  const router = useRouter();
  const { data: session } = useSession();

  const [projectToDelete, setProjectToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const deleteProject = useMutation({
    ...trpc.project.deleteProject.mutationOptions(),
    onSuccess: () => {
      setProjectToDelete(null);
      refetch();
    },
  });

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="w-8 h-8" />
          {open && (
            <h1 className="text-base font-bold text-primary/80">GitAsk</h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden h-full flex flex-col">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link
                        href={item.url}
                        className={cn({
                          "bg-primary! text-white! text-xs":
                            pathname === item.url,
                        })}
                      >
                        <item.icon className="h-3 w-3" />
                        <span className="text-xs">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="flex-1 flex flex-col min-h-0 pt-0">
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>

          {open && (
            <div className="px-2 mb-2">
              <Link href="/create">
                <Button
                  size="sm"
                  className="w-full text-xs justify-start border hover:text-grey shadow-none"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            </div>
          )}

          <SidebarGroupContent className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
            <SidebarMenu className="gap-1 px-1">
              {projects?.map((project) => {
                return (
                  <SidebarMenuItem key={project.id} className="group/project">
                    <SidebarMenuButton asChild>
                      <div
                        onClick={() => setProjectId(project.id)}
                        className="cursor-pointer flex items-center"
                      >
                        <div
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-sm border text-xs text-primary",
                            {
                              "bg-primary text-white": project.id === projectId,
                            },
                          )}
                        >
                          {project.name[0]}
                        </div>
                        <span className="flex-1 truncate">{project.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete({
                              id: project.id,
                              name: project.name,
                            });
                          }}
                          className="opacity-0 group-hover/project:opacity-100 ml-auto p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="flex items-center gap-2 p-2">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt="avatar"
              className="size-7 rounded-full"
            />
          ) : (
            <div className="size-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium">
              {session?.user?.name?.[0] ?? "?"}
            </div>
          )}
          {open && (
            <>
              <span className="flex-1 text-xs font-medium truncate">
                {session?.user?.name}
              </span>
              <button
                onClick={async () => {
                  await authClient.signOut();
                  router.push("/");
                }}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </SidebarFooter>

      <Dialog
        open={!!projectToDelete}
        onOpenChange={(open) => {
          if (!open) setProjectToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {projectToDelete?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProjectToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteProject.isPending}
              onClick={() => {
                if (projectToDelete) {
                  deleteProject.mutate({ projectId: projectToDelete.id });
                }
              }}
            >
              {deleteProject.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
};
