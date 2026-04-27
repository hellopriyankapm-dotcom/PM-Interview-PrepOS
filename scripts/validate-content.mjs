import { readFile } from "node:fs/promises";

const requiredQuestionFields = [
  "id",
  "title",
  "prompt",
  "roundType",
  "targetLevels",
  "concepts",
  "difficulty",
  "sourceType",
  "companyClaim",
  "reviewer"
];

const allowedSources = new Set([
  "original",
  "synthetic",
  "official",
  "public",
  "public_video",
  "community"
]);

const questions = JSON.parse(await readFile(new URL("../content/questions/questions.json", import.meta.url), "utf8"));
const failures = [];

for (const question of questions) {
  for (const field of requiredQuestionFields) {
    if (!(field in question)) failures.push(`${question.id ?? "unknown"} is missing ${field}`);
  }

  if (!allowedSources.has(question.sourceType)) {
    failures.push(`${question.id} has unsupported sourceType ${question.sourceType}`);
  }

  if (question.sourceType !== "original" && question.sourceType !== "synthetic" && !question.sourceUrl) {
    failures.push(`${question.id} needs sourceUrl for non-original source ${question.sourceType}`);
  }

  if (question.companyClaim && !question.sourceUrl) {
    failures.push(`${question.id} has a companyClaim without a sourceUrl`);
  }

  if (!question.reviewer || question.reviewer === "AI") {
    failures.push(`${question.id} needs a human reviewer label`);
  }
}

if (failures.length) {
  console.error("Content validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Validated ${questions.length} questions with trusted source metadata.`);
