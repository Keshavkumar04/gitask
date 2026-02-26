"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useTRPC } from "@/lib/trpc/client";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useRefetch } from "@/hooks/use-refetch";
import { Github, Info, Loader2 } from "lucide-react";
import { useState } from "react";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset, watch } = useForm<FormInput>();
  const refetch = useRefetch();
  const trpc = useTRPC();

  const [fileCount, setFileCount] = useState(0);
  const [userCredits, setUserCredits] = useState(0);
  const [hasChecked, setHasChecked] = useState(false);

  const checkCredits = useMutation({
    ...trpc.project.checkCredits.mutationOptions(),
    onSuccess: (data) => {
      setFileCount(data.fileCount);
      setUserCredits(data.userCredits);
      setHasChecked(true);
      if (data.userCredits < data.fileCount) {
        toast.error("Not enough credits for this repository");
      }
    },
    onError: () => {
      toast.error("Failed to check credits. Check the URL and try again.");
    },
  });

  const createProject = useMutation({
    ...trpc.project.createProject.mutationOptions(),
    onSuccess: () => {
      toast.success("Project created successfully!");
      refetch();
      reset();
      setHasChecked(false);
    },
    onError: () => {
      toast.error("Failed to create project");
    },
  });

  function onSubmit(data: FormInput) {
    createProject.mutate(data);
  }

  const repoUrl = watch("repoUrl");
  const githubToken = watch("githubToken");

  const hasEnoughCredits = userCredits >= fileCount;

  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/10">
            <Github className="h-5 w-5 text-primary" />
          </div>
        </div>
        <h1 className="text-base font-semibold text-gray-900 text-center">
          Link GitHub Repo
        </h1>
        <p className="text-xs text-gray-500 text-center mt-1 mb-6">
          Enter the URL of your repository to link it.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input
            {...register("projectName", { required: true })}
            placeholder="Project Name"
            required
            className="bg-white text-xs h-9"
          />

          <Input
            {...register("repoUrl", {
              required: true,
              onChange: () => setHasChecked(false),
            })}
            placeholder="GitHub URL"
            type="url"
            required
            className="bg-white text-xs h-9"
          />

          <Input
            {...register("githubToken")}
            placeholder="GitHub Token (Optional)"
            className="bg-white text-xs h-9"
          />

          {hasChecked && (
            <p className="text-xs text-center text-gray-500">
              This repo has{" "}
              <span className="font-semibold text-gray-900">{fileCount}</span>{" "}
              files. You have{" "}
              <span
                className={`font-semibold ${hasEnoughCredits ? "text-green-600" : "text-red-600"}`}
              >
                {userCredits}
              </span>{" "}
              credits.
            </p>
          )}

          {!hasChecked ? (
            <Button
              type="button"
              className="w-full h-9 text-xs"
              disabled={checkCredits.isPending || !repoUrl}
              onClick={() =>
                checkCredits.mutate({
                  githubUrl: repoUrl,
                  githubToken: githubToken || undefined,
                })
              }
            >
              {checkCredits.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Credits"
              )}
            </Button>
          ) : hasEnoughCredits ? (
            <Button
              type="submit"
              disabled={createProject.isPending}
              className="w-full h-9 text-xs"
            >
              {createProject.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  <span>Creating...</span>
                  <span className="text-xs">
                    this may take a while for large repos
                  </span>
                </>
              ) : (
                `Create Project`
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              className="w-full h-9 text-xs"
              onClick={() => (window.location.href = "/billing")}
            >
              Buy Credits
            </Button>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
            <Info className="h-3 w-3 shrink-0" />
            <p>Each file in the repo costs 1 credit to index.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;
