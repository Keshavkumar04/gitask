import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";

export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    // Fallback to environment variable if explicit token is not passed
    accessToken: githubToken || "",
    branch: "main",
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
      "node_modules",
      "tsconfig.tsbuildinfo",
      ".DS_Store",
      ".git",
      ".github",
    ],
  });

  const docs = await loader.load();
  return docs;
};
