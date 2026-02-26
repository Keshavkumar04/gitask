"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useProject } from "@/hooks/use-project";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import MDEditor from "@uiw/react-md-editor";
import Image from "next/image";
import React, { useState } from "react";
import AskQuestionCard from "@/components/AskQuestionCard";
import CodeReferences from "@/components/CodeReferences";

const QAPage = () => {
  const { projectId } = useProject();
  const trpc = useTRPC();
  const [questionIndex, setQuestionIndex] = useState(0);

  const { data: questions, isLoading } = useQuery({
    ...trpc.project.getQuestions.queryOptions({
      projectId: projectId,
    }),
    enabled: !!projectId,
  });

  const question = questions?.[questionIndex];

  return (
    <Sheet>
      <div className="p-4 max-w-6xl mx-auto">
        <div className="mb-4">
          <AskQuestionCard />
        </div>

        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Saved Questions
        </h2>

        <div className="flex flex-col gap-2">
          {questions?.map((question, index) => {
            return (
              <React.Fragment key={question.id}>
                <SheetTrigger onClick={() => setQuestionIndex(index)}>
                  <div className="flex items-center gap-4 bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-all cursor-pointer h-full">
                    <div className="shrink-0">
                      <Image
                        src={question.user.image ?? ""}
                        alt="user"
                        width={30}
                        height={30}
                        className="rounded-full"
                      />
                    </div>

                    <div className="text-left flex flex-col w-full">
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 line-clamp-1 font-medium text-sm lg:text-base">
                          {question.question}
                        </p>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-auto">
                          {question.createdAt.toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-gray-500 line-clamp-1 text-xs mt-0.5">
                        {question.answer}
                      </p>
                    </div>
                  </div>
                </SheetTrigger>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {question && (
        <SheetContent className="sm:max-w-[80vw]">
          <SheetHeader>
            <SheetTitle className="text-base">{question.question}</SheetTitle>
            <div className="overflow-y-auto max-h-[calc(100vh-8rem)] pr-4">
              <MDEditor.Markdown
                source={question.answer}
                className="bg-transparent! text-black! text-base! my-4"
              />
              <CodeReferences
                filesReferences={(question.filesReferences ?? []) as any}
              />
            </div>
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QAPage;
