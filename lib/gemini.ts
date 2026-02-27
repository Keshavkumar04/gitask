// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { Document } from "@langchain/core/documents";

// const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// const model = genAi.getGenerativeModel({
//   model: "gemini-2.5-flash-lite",
// });

// export const aisummariseCommit = async (diff: string) => {
//   // https://github.com/facebook/react/commit/<commitHash>.dff
//   // it will give us what changed in the new commit
//   const response = await model.generateContent([
//     `You are an expert programmer, and you are trying to summarize a git diff.

// Reminders about the git diff format:
// For every file, there are a few metadata lines, like (for example):

// diff --git a/lib/index.js b/lib/index.js
// index aadf691..bfef603 100644
// --- a/lib/index.js
// +++ b/lib/index.js

// This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
// Then there is a specifier of the lines that were modified.
// A line starting with \`+\` means it was added.
// A line that starting with \`-\` means that line was deleted.
// A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
// It is not part of the diff.

// EXAMPLE SUMMARY COMMENTS:

// - Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
// - Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
// - Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
// - Added an OpenAI API for completions [packages/utils/apis/openai.ts]
// - Lowered numeric tolerance for test files

// Most commits will have less comments than this examples list.
// The last comment does not include the file names,
// because there were more than two relevant files in the hypothetical commit.
// Do not include parts of the example in your summary.
// It is given only as an example of appropriate comments.

// Please summarise the following diff file:

// ${diff}`,
//   ]);

//   return response.response.text();
// };

// export const summariseCode = async (doc: Document) => {
//   console.log("getting summary for", doc.metadata.source);
//   try {
//     const code = doc.pageContent.slice(0, 10000);
//     const response = await model.generateContent([
//       `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects`,
//       `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file
// Here is the code:
// ---
// ${code}
// ---

// Give a summary no more than 100 words of the code above`,
//     ]);

//     return response.response.text();
//   } catch (error) {
//     // in case the array time out we will return an emmpty string
//     console.warn(`Summary failed for ${doc.metadata.source}, using filename.`);
//     return `File path: ${doc.metadata.source}`;
//   }
// };

// export const generateEmbedding = async (summary: string) => {
//   const model = genAi.getGenerativeModel({
//     model: "text-embedding-004",
//   });
//   const result = await model.embedContent(summary);
//   const embedding = result.embedding;
//   return embedding.values;
// };

import { Ollama } from "ollama";
import { Document } from "@langchain/core/documents";

const ollama = new Ollama({
  host: process.env.OLLAMA_BASE_URL || "http://149.36.1.94:11434",
});

const stripThinking = (text: string): string => {
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
};

export const aisummariseCommit = async (diff: string) => {
  const truncatedDiff = diff.slice(0, 5000);
  const response = await ollama.chat({
    model: "qwen3:8b",
    messages: [
      {
        role: "system",
        content: `You are an expert programmer, and you are trying to summarize a git diff.

Reminders about the git diff format:
For every file, there are a few metadata lines, like (for example):

diff --git a/lib/index.js b/lib/index.js
index aadf691..bfef603 100644
--- a/lib/index.js
+++ b/lib/index.js

This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
Then there is a specifier of the lines that were modified.
A line starting with \`+\` means it was added.
A line that starting with \`-\` means that line was deleted.
A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
It is not part of the diff.

STRICT OUTPUT RULES:
1. You MUST output ONLY a list of bullet points starting with "- ".
2. Do NOT use bold text, italics, headers, or markdown sections (like **bold** or ## Header).
3. Do NOT use paragraphs or introductory sentences.
4. Keep each bullet point concise (maximum 20 words).
5. Append the file name in brackets at the end of the summary if relevant, e.g. [src/index.ts].

EXAMPLE OF ACCEPTABLE OUTPUT:
- Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts]
- Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
- Moved the \`octokit\` initialization to a separate file [src/octokit.ts]
- Added an OpenAI API for completions [packages/utils/apis/openai.ts]
- Lowered numeric tolerance for test files

Do not include parts of the example in your summary.`,
      },
      {
        role: "user",
        content: `Please summarise the following diff file: \n\n${truncatedDiff}`,
      },
    ],
  });

  return stripThinking(response.message.content);
};

export const summariseCode = async (doc: Document) => {
  try {
    const code = doc.pageContent.slice(0, 10000);

    const response = await ollama.chat({
      model: "qwen3:8b",
      messages: [
        {
          role: "system",
          content: `You are a code indexer for a vector search database. Your summary will be embedded and matched against user questions like "what libraries does this project use?", "which AI model is used?", "where are API calls made?", "how does authentication work?".

STRICT OUTPUT FORMAT — use this exact structure:
ROLE: [one-line description, e.g. "API route handler for webhooks"]
LIBRARIES: [every imported library/package, e.g. "express, openai, drizzle-orm, zod"]
EXTERNAL SERVICES: [any APIs, AI models, databases, SDKs called, e.g. "OpenAI GPT-4, Stripe API, PostgreSQL, Stream.io"]
EXPORTS: [exported functions/variables/types, e.g. "POST handler, GET handler"]
KEY DETAILS: [2-3 sentences on what the code does, mentioning function names, endpoints, data flow]

RULES:
1. List EVERY import/require — do not skip any library.
2. If the file calls an AI model (OpenAI, Gemini, Anthropic, Ollama, etc.), name the EXACT model string (e.g. "gpt-4o", "gemini-2.5-flash").
3. If the file is package.json, list ALL dependencies and devDependencies by name.
4. If the file makes HTTP/fetch/API calls, state the URL or service.
5. Keep total output under 150 words. No filler, no markdown formatting.`,
        },
        {
          role: "user",
          content: `Index this file for vector search.
File: ${doc.metadata.source}

Code:
---
${code}
---`,
        },
      ],
    });

    return stripThinking(response.message.content);
  } catch (error) {
    console.warn(
      `Summary failed for ${doc.metadata.source}, using filename. Error:`,
      error,
    );
    return `File path: ${doc.metadata.source}`;
  }
};

export const generateProjectSummary = async (
  fileSummaries: { fileName: string; summary: string }[],
) => {
  const summaryList = fileSummaries
    .map((f) => `${f.fileName}: ${f.summary.slice(0, 200)}`)
    .join("\n")
    .slice(0, 12000);

  const response = await ollama.chat({
    model: "qwen3:8b",
    messages: [
      {
        role: "system",
        content: `You generate a comprehensive project overview from individual file summaries. This will be stored in a vector database and matched against broad questions like "what does this project do?", "what tech stack is used?", "what is this app about?".

OUTPUT FORMAT:
PROJECT OVERVIEW: [2-3 sentences describing what the app/project does]
TECH STACK: [list ALL frameworks, languages, libraries found across files]
AI/ML: [any AI models, ML libraries, or LLM integrations found — list model names]
EXTERNAL SERVICES: [all third-party APIs, databases, cloud services]
KEY FEATURES: [main features/modules of the application]
ARCHITECTURE: [e.g. "Next.js frontend + tRPC API + PostgreSQL", mention any patterns]

RULES:
1. Aggregate info from ALL file summaries — do not focus on just a few files.
2. Be specific — name exact libraries, not "various libraries".
3. Keep under 200 words. No filler.`,
      },
      {
        role: "user",
        content: `Generate a project overview from these file summaries:\n\n${summaryList}`,
      },
    ],
  });

  return stripThinking(response.message.content);
};

export const generateEmbedding = async (summary: string) => {
  const response = await ollama.embeddings({
    model: "nomic-embed-text",
    prompt: summary,
  });

  return response.embedding;
};
