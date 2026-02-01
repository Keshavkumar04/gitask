import { Octokit } from "octokit";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { aisummariseCommit } from "./gemini";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

// 1. Helper to extract Owner and Repo from a GitHub URL
// Example: "https://github.com/facebook/react" -> { owner: "facebook", repo: "react" }
const getRepoInfo = (githubUrl: string) => {
  const parts = githubUrl.split("/");
  const owner = parts[parts.length - 2];
  const repo = parts[parts.length - 1];

  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }
  return { owner, repo };
};

export const getCommitHashes = async (
  githubUrl: string,
): Promise<Response[]> => {
  const { owner, repo } = getRepoInfo(githubUrl);

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];

  return sortedCommits.slice(0, 5).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message ?? "",
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit?.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? "",
  }));
};

export const pollCommits = async (projectId: string) => {
  // 1. Fetch the Project URL from prisma
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);

  // 2. Fetch the latest commits from GitHub API
  const commitHashes = await getCommitHashes(githubUrl);

  // 3. Filter out commits we have already saved in our prisma
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );

  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((commit) => {
      return summarizeCommit(githubUrl, commit.commitHash);
    }),
  );

  const summaries = summaryResponses.map((response) => {
    if (response.status === "fulfilled") {
      return response.value as string;
    }
    return "";
  });

  const commits = await prisma.commit.createMany({
    data: summaries.map((summary, index) => {
      console.log(`processing commits ${index}`);
      return {
        projectId: projectId,
        commitHash: unprocessedCommits[index]!.commitHash,
        commitMessage: unprocessedCommits[index]!.commitMessage,
        commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
        commitDate: unprocessedCommits[index]!.commitDate,
        summary: summary,
      };
    }),
  });

  // 4. (Optional) Save the new commits to your prisma here
  // return await prisma.commit.createMany({ data: unprocessedCommits.map(...) })

  return commits;
};

// before saving the commits we need to sumarize them
const summarizeCommit = async (githubUrl: string, commitHash: string) => {
  // get the diff and then pass the diff to the ai
  // https://github.com/facebook/react/commit/<commitHash>.dff
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: `application/vnd.github.v3.diff`,
    },
  });
  return (await aisummariseCommit(data)) || "";
};

const fetchProjectGithubUrl = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      githubUrl: true,
    },
  });

  if (!project?.githubUrl) {
    throw new Error("Project has no github url");
  }

  return { project, githubUrl: project.githubUrl };
};

const filterUnprocessedCommits = async (
  projectId: string,
  commitHashes: Response[],
) => {
  // Get all stored commits for this project
  const storedCommits = await prisma.commit.findMany({
    where: { projectId },
  });

  // Create a Set for O(1) lookups
  const storedHashes = new Set(storedCommits.map((c) => c.commitHash));

  // Return only the commits that DO NOT exist in our prisma
  return commitHashes.filter((commit) => !storedHashes.has(commit.commitHash));
};
