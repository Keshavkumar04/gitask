"use client";

import { useProject } from "@/hooks/use-project";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { askQuestion } from "@/app/(protected)/dashboard/actions";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "./CodeReferences";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRefetch } from "@/hooks/use-refetch";
import { Loader2, Save } from "lucide-react";

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filesReferences, setFilesReferences] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = useState("");
  const trpc = useTRPC();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!project?.id) return;
    setLoading(true);
    setAnswer("");
    setOpen(true);

    try {
      const { answer, filesReferences } = await askQuestion(
        question,
        project.id,
      );
      setFilesReferences(filesReferences);
      setAnswer(answer);
    } catch (error) {
      toast.error("Failed to get answer");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const refetch = useRefetch();

  const saveAnswer = useMutation({
    ...trpc.project.saveAnswer.mutationOptions(),
    onSuccess: () => {
      toast.success("Answer saved!");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to save answer: " + error.message);
    },
  });

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <DialogTitle>
                  {/* <Image src="/logo.png" alt="GitAsk" width={32} height={32} /> */}
                  <img src="/logo.png" alt="logo" className="w-8 h-8" />
                </DialogTitle>
              </div>
              <Button
                disabled={saveAnswer.isPending || loading}
                variant="default"
                size="sm"
                className="mr-4"
                onClick={() => {
                  saveAnswer.mutate({
                    projectId: project!.id,
                    question,
                    answer,
                    filesReferences,
                  });
                }}
              >
                {saveAnswer.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </DialogHeader>

          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <span>Analyzing your codebase...</span>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                <MDEditor.Markdown
                  source={answer}
                  className="bg-transparent! text-black! text-sm!"
                />
                <div className="border-t pt-4">
                  <CodeReferences filesReferences={filesReferences} />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3 shadow-sm border-gray-200">
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Example: Which file handles the user authentication?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="h-4"></div>
            <Button
              type="submit"
              size="sm"
              disabled={loading || question.trim().length === 0}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Asking...
                </>
              ) : (
                "Ask Question"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
