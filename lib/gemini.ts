import { GoogleGenerativeAI } from "@google/generative-ai";

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAi.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const aisummariseCommit = async (diff: string) => {
  // https://github.com/facebook/react/commit/<commitHash>.dff
  // it will give us what changed in the new commit
  const response = await model.generateContent([`promit`]);

  return response.response.text();
};
