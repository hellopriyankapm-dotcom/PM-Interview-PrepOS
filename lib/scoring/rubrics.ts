import { levelProfiles } from "@/lib/content";
import { updateConceptState } from "@/lib/scaffolding/scaffolding";
import type { Calibration, ConceptState, Evaluation, Question, ScoreBreakdown } from "@/lib/types";

const keywordGroups = {
  structure: ["goal", "first", "second", "third", "because", "recommend", "trade-off", "scope"],
  userInsight: ["user", "customer", "segment", "persona", "need", "pain", "journey"],
  metrics: ["metric", "north star", "activation", "retention", "conversion", "revenue", "quality", "latency"],
  tradeoffs: ["trade-off", "risk", "constraint", "cost", "privacy", "fallback", "guardrail"],
  communication: ["recommend", "therefore", "decision", "priority", "launch", "learn"],
  ai: ["eval", "hallucination", "model", "human", "safety", "abuse", "bias", "privacy"]
};

function keywordScore(answer: string, keywords: string[]) {
  const normalized = answer.toLowerCase();
  const hits = keywords.filter((keyword) => normalized.includes(keyword)).length;
  return Math.min(5, Math.max(1, 1 + hits));
}

function lengthAdjustment(answer: string) {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  if (words >= 120 && words <= 380) return 0.4;
  if (words >= 70) return 0.1;
  if (words < 35) return -0.8;
  return 0;
}

function clampScore(score: number) {
  return Math.min(5, Math.max(1, Number(score.toFixed(1))));
}

export function evaluateAnswer(
  answer: string,
  question: Question,
  calibration: Calibration,
  concepts: ConceptState[]
): Evaluation {
  const adjustment = lengthAdjustment(answer);
  const aiBoost = question.roundType === "ai_product_judgment" ? keywordScore(answer, keywordGroups.ai) * 0.2 : 0;

  const breakdown: ScoreBreakdown = {
    structure: clampScore(keywordScore(answer, keywordGroups.structure) + adjustment),
    userInsight: clampScore(keywordScore(answer, keywordGroups.userInsight) + adjustment),
    metrics: clampScore(keywordScore(answer, keywordGroups.metrics) + adjustment),
    tradeoffs: clampScore(keywordScore(answer, keywordGroups.tradeoffs) + adjustment + aiBoost),
    communication: clampScore(keywordScore(answer, keywordGroups.communication) + adjustment),
    targetLevelDepth: clampScore(
      keywordScore(answer, [...keywordGroups.tradeoffs, ...keywordGroups.metrics]) +
        adjustment -
        (levelProfiles[calibration.targetLevel].threshold - 3.4)
    )
  };

  const scores = Object.values(breakdown);
  const total = clampScore(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  const targetThreshold = levelProfiles[calibration.targetLevel].threshold;
  const activeConceptIds = new Set(question.concepts);
  const updatedConcepts = concepts.map((concept) =>
    activeConceptIds.has(concept.conceptId) ? updateConceptState(concept, total) : concept
  );

  const strengths = [
    breakdown.structure >= 3.5 ? "Your answer has enough structure to follow." : "",
    breakdown.metrics >= 3.5 ? "You included measurable success signals." : "",
    breakdown.tradeoffs >= 3.5 ? "You named real trade-offs instead of only listing ideas." : ""
  ].filter(Boolean);

  const improvements = [
    breakdown.userInsight < targetThreshold ? "Anchor the answer in a sharper user segment and pain point." : "",
    breakdown.metrics < targetThreshold ? "Add one primary metric, two input metrics, and one guardrail." : "",
    breakdown.tradeoffs < targetThreshold ? "Make the decision harder by naming the risk, cost, or stakeholder who may disagree." : "",
    breakdown.targetLevelDepth < targetThreshold ? `Raise the depth for ${levelProfiles[calibration.targetLevel].label}: show scope, constraints, and decision quality.` : ""
  ].filter(Boolean);

  return {
    total,
    breakdown,
    strengths: strengths.length ? strengths : ["You made a start; the next rep should focus on clearer structure."],
    improvements: improvements.length ? improvements : ["You are at or near the target bar. Move into a harder timed follow-up."],
    nextAction:
      total >= targetThreshold
        ? "Try a harder follow-up in interview mode."
        : "Retry with the recommended structure and explicitly state your metric and trade-off.",
    updatedConcepts
  };
}
