"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "./ui/tabs";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  filesReferences: { fileName: string; sourceCode: string; summary: string }[];
};

const CodeReferences = ({ filesReferences }: Props) => {
  const [tab, setTab] = useState(filesReferences[0]?.fileName);

  if (filesReferences.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto my-4">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex gap-2 bg-transparent p-1 rounded-md overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {filesReferences.map((file) => (
            <button
              onClick={() => setTab(file.fileName)}
              key={file.fileName}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap border",
                {
                  "bg-primary text-primary-foreground border-primary shadow-sm":
                    tab === file.fileName,

                  "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 hover:text-gray-900":
                    tab !== file.fileName,
                },
              )}
            >
              {file.fileName}
            </button>
          ))}
        </div>

        {filesReferences.map((file) => (
          <TabsContent
            key={file.fileName}
            value={file.fileName}
            className="mt-2"
          >
            <div className="rounded-md overflow-hidden border shadow-sm">
              <SyntaxHighlighter
                language="typescript"
                style={lucario}
                customStyle={{
                  margin: 0,
                  padding: "1.5rem",
                  fontSize: "0.875rem", // text-sm
                  lineHeight: "1.5",
                }}
              >
                {file.sourceCode}
              </SyntaxHighlighter>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CodeReferences;
