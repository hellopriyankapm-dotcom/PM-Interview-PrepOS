import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const inboxUrl = new URL("../content/source-inbox/submissions.json", import.meta.url);
const questionsUrl = new URL("../content/questions/questions.json", import.meta.url);
const changelogUrl = new URL("../content/questions/CHANGELOG.md", import.meta.url);

async function readJson(url, fallback) {
  if (!existsSync(url)) return fallback;
  return JSON.parse(await readFile(url, "utf8"));
}

const submissions = await readJson(inboxUrl, []);
const questions = await readJson(questionsUrl, []);
const existingIds = new Set(questions.map((question) => question.id));

const approved = submissions.filter((submission) => {
  return submission.reviewStatus === "approved" && submission.consent === true && !existingIds.has(submission.id);
});

if (!approved.length) {
  console.log("No approved submissions ready to publish.");
  process.exit(0);
}

const normalized = approved.map((submission) => ({
  id: submission.id,
  title: submission.title,
  prompt: submission.prompt,
  roundType: submission.roundType,
  targetLevels: submission.targetLevels,
  concepts: submission.concepts,
  difficulty: submission.difficulty,
  sourceType: submission.sourceType,
  sourceUrl: submission.sourceUrl ?? null,
  companyClaim: submission.companyClaim ?? null,
  reviewer: submission.reviewer
}));

await writeFile(questionsUrl, `${JSON.stringify([...questions, ...normalized], null, 2)}\n`);

const today = new Date().toISOString().slice(0, 10);
const changelogEntry = [
  `\n## ${today}`,
  "",
  ...normalized.map((question) => `- Added ${question.id}: ${question.title} (${question.sourceType})`)
].join("\n");

const previousChangelog = existsSync(changelogUrl) ? await readFile(changelogUrl, "utf8") : "# Question Bank Changelog\n";
await writeFile(changelogUrl, `${previousChangelog.trim()}\n${changelogEntry}\n`);

await mkdir(new URL("../content/source-inbox/archive", import.meta.url), { recursive: true });
await writeFile(
  new URL(`../content/source-inbox/archive/published-${today}.json`, import.meta.url),
  `${JSON.stringify(normalized, null, 2)}\n`
);

console.log(`Published ${normalized.length} approved question-bank updates.`);
