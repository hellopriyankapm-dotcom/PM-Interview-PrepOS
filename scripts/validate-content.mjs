import { readFile } from "node:fs/promises";

const requiredQuestionFields = [
  "id",
  "title",
  "prompt",
  "roundType",
  "categories",
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

const MIN_PROMPT_CHARS = 60;
const MAX_PROMPT_CHARS = 800;
const MIN_QUESTIONS_PER_CONCEPT = 3;

const questions = JSON.parse(
  await readFile(new URL("../content/questions/questions.json", import.meta.url), "utf8")
);
const concepts = JSON.parse(
  await readFile(new URL("../content/concepts/concepts.json", import.meta.url), "utf8")
);

const conceptIds = new Set(concepts.map((concept) => concept.id));
const conceptHits = Object.fromEntries(concepts.map((concept) => [concept.id, 0]));
const seenIds = new Set();

const failures = [];
const warnings = [];

for (const question of questions) {
  for (const field of requiredQuestionFields) {
    if (!(field in question)) failures.push(`${question.id ?? "unknown"} is missing ${field}`);
  }

  if (!allowedSources.has(question.sourceType)) {
    failures.push(`${question.id} has unsupported sourceType ${question.sourceType}`);
  }

  if (!Array.isArray(question.categories) || question.categories.length === 0) {
    failures.push(`${question.id} needs at least one practice category`);
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

  if (seenIds.has(question.id)) {
    failures.push(`${question.id} is a duplicate id`);
  }
  seenIds.add(question.id);

  if (typeof question.prompt === "string") {
    const length = question.prompt.length;
    if (length < MIN_PROMPT_CHARS) {
      failures.push(`${question.id} prompt is too short (${length} chars, min ${MIN_PROMPT_CHARS})`);
    }
    if (length > MAX_PROMPT_CHARS) {
      failures.push(`${question.id} prompt is too long (${length} chars, max ${MAX_PROMPT_CHARS})`);
    }
  }

  if (Array.isArray(question.concepts)) {
    if (question.concepts.length === 0) {
      failures.push(`${question.id} has zero concepts`);
    }
    for (const conceptId of question.concepts) {
      if (!conceptIds.has(conceptId)) {
        failures.push(`${question.id} references unknown concept ${conceptId}`);
      } else {
        conceptHits[conceptId] += 1;
      }
    }
  }
}

for (const [conceptId, count] of Object.entries(conceptHits)) {
  if (count < MIN_QUESTIONS_PER_CONCEPT) {
    warnings.push(
      `Concept ${conceptId} has only ${count} question(s); aim for at least ${MIN_QUESTIONS_PER_CONCEPT}.`
    );
  }
}

if (failures.length) {
  console.error("Content validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (warnings.length) {
  console.warn("Content validation warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

console.log(`Validated ${questions.length} questions with trusted source metadata.`);
