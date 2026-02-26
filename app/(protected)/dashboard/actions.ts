"use server";

import { generateEmbedding } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { Ollama } from "ollama";

// Setup Ollama client (pointing to your VM)
const ollama = new Ollama({
  host: process.env.OLLAMA_BASE_URL || "http://149.36.1.94:11434",
});

export async function askQuestion(question: string, projectId: string) {
  const queryVector = await generateEmbedding(question);
  const vectorQuery = `[${queryVector.join(",")}]`;

  const result = (await prisma.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > .6
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 5
  `) as { fileName: string; sourceCode: string; summary: string }[];

  // console.log(
  //   "Vector search results:",
  //   result.map((r) => ({ file: r.fileName, similarity: (r as any).similarity })),
  // );

  if (result.length === 0) {
    return {
      answer:
        "I could not find any relevant files in this project for your question. Try rephrasing or asking about specific files/features.",
      filesReferences: [],
    };
  }

  let context = "";
  for (const doc of result) {
    const truncatedCode = doc.sourceCode.slice(0, 3000);
    context += `--- FILE: ${doc.fileName} ---\nSUMMARY: ${doc.summary}\nCODE:\n${truncatedCode}\n\n`;
  }

  const response = await ollama.chat({
    model: "qwen3:8b",
    options: {
      temperature: 0.3,
    },
    messages: [
      {
        role: "system",
        content: `You are a precise code assistant. Answer ONLY using the provided code context. Do NOT use outside knowledge. If the answer is not in the context, say "I cannot find the relevant code in this project." Be concise, technical, and reference specific file names.`,
      },
      {
        role: "user",
        content: `Here is the relevant source code from this project:\n\n${context}\n\n---\nQUESTION: ${question}`,
      },
    ],
  });

  const answer = response.message.content
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .trim();

  return {
    answer,
    filesReferences: result,
  };
}
