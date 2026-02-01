"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useTRPC } from "@/lib/trpc/client"; // <--- 1. Import hook
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useRefetch } from "@/hooks/use-refetch";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const refetch = useRefetch();
  const trpc = useTRPC();

  //   function onSubmit(data: FormInput) {
  //     console.log(data);
  //     return true;
  //   }

  //   const createProject = trpc.project.createProject.useMutation({
  //     onSuccess: () => {
  //       toast.success("Project created!");
  //       reset(); // Clear the form
  //     },
  //     onError: () => {
  //       toast.error("Failed to create Project");
  //     },
  //   });

  //   function onSubmit(data: FormInput) {
  //     // <--- 4. Call the mutation
  //     createProject.mutate(data);
  //   }

  const createProject = useMutation({
    ...trpc.project.createProject.mutationOptions(), // Spread the tRPC options here
    onSuccess: () => {
      toast.success("Project created!");
      refetch();
      reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create project");
    },
  });

  function onSubmit(data: FormInput) {
    // 3. The call remains the same
    createProject.mutate(data);
  }

  return (
    <div>
      <div>
        <h1>link your github repo</h1>
        <p>Enter the url of your repo to link</p>
      </div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            {...register("projectName", { required: true })}
            placeholder="Project name"
            required
          />
          <Input
            {...register("repoUrl", { required: true })}
            placeholder="Github Url"
            type="url"
            required
          />
          <Input
            {...register("githubToken")}
            placeholder="Github Token (Optional)"
          />

          <Button type="submit" disabled={createProject.isPending}>
            Create Project
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;
