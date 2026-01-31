"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();

  function onSubmit(data: FormInput) {
    console.log(data);
    return true;
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

          <Button type="submit">Create Project</Button>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;
