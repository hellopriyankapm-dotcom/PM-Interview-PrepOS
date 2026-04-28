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

// ---- Resources validation -------------------------------------------------

const requiredResourceFields = [
  "id",
  "title",
  "url",
  "source",
  "type",
  "appliesTo",
  "reviewer",
  "addedOn"
];
const allowedResourceTypes = new Set(["video", "article", "framework", "course"]);
const allowedCategories = new Set([
  "all",
  "product_sense",
  "execution_metrics",
  "analytics_experimentation",
  "strategy",
  "behavioral_leadership",
  "ai_product_judgment",
  "technical_collaboration",
  "estimation_prioritization"
]);

let resources = [];
try {
  resources = JSON.parse(
    await readFile(new URL("../content/resources/resources.json", import.meta.url), "utf8")
  );
} catch {
  // resources file is optional
}

const seenResourceIds = new Set();
const questionIds = new Set(questions.map((question) => question.id));

for (const resource of resources) {
  for (const field of requiredResourceFields) {
    if (!(field in resource)) failures.push(`resource ${resource.id ?? "unknown"} missing ${field}`);
  }
  if (resource.id && seenResourceIds.has(resource.id)) {
    failures.push(`resource ${resource.id} is a duplicate id`);
  }
  if (resource.id) seenResourceIds.add(resource.id);
  if (typeof resource.url !== "string" || !resource.url.startsWith("https://")) {
    failures.push(`resource ${resource.id} url must start with https://`);
  }
  if (resource.type && !allowedResourceTypes.has(resource.type)) {
    failures.push(`resource ${resource.id} has unsupported type ${resource.type}`);
  }
  if (!resource.reviewer || resource.reviewer === "AI") {
    failures.push(`resource ${resource.id} needs a human reviewer label`);
  }
  if (!resource.source || typeof resource.source !== "string") {
    failures.push(`resource ${resource.id} needs a non-empty source attribution`);
  }
  if (!resource.appliesTo || typeof resource.appliesTo !== "object") {
    failures.push(`resource ${resource.id} needs an appliesTo object`);
    continue;
  }
  const { questionIds: qIds, concepts: cIds, categories: catIds } = resource.appliesTo;
  if (
    (!Array.isArray(qIds) || qIds.length === 0) &&
    (!Array.isArray(cIds) || cIds.length === 0) &&
    (!Array.isArray(catIds) || catIds.length === 0)
  ) {
    failures.push(`resource ${resource.id} needs at least one of appliesTo.questionIds / concepts / categories`);
  }
  for (const qid of qIds ?? []) {
    if (!questionIds.has(qid)) failures.push(`resource ${resource.id} references unknown question ${qid}`);
  }
  for (const cid of cIds ?? []) {
    if (!conceptIds.has(cid)) failures.push(`resource ${resource.id} references unknown concept ${cid}`);
  }
  for (const cat of catIds ?? []) {
    if (!allowedCategories.has(cat)) failures.push(`resource ${resource.id} references unknown category ${cat}`);
  }
}

// ---- Reporting ------------------------------------------------------------

if (failures.length) {
  console.error("Content validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (warnings.length) {
  console.warn("Content validation warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

console.log(
  `Validated ${questions.length} questions and ${resources.length} resources with trusted source metadata.`
);
