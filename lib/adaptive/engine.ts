import { levelProfiles, questions } from "@/lib/content";
import { explanationDepthForMode, modeFromConcepts } from "@/lib/scaffolding/scaffolding";
import type { Calibration, ConceptState, PracticePlanItem, Question, TargetLevel } from "@/lib/types";

function daysUntil(date: string) {
  if (!date) return 30;
  const then = new Date(`${date}T12:00:00`);
  if (Number.isNaN(then.getTime())) return 30;
  return Math.max(0, Math.ceil((then.getTime() - Date.now()) / 86400000));
}

function targetMatch(question: Question, targetLevel: TargetLevel) {
  if (question.targetLevels.includes(targetLevel)) return 8;
  if (targetLevel === "ai-pm" && question.roundType === "ai_product_judgment") return 10;
  if (targetLevel === "pm-t" && question.roundType === "technical_collaboration") return 10;
  return 2;
}

export function buildPracticeQueue(
  calibration: Calibration,
  concepts: ConceptState[],
  completedQuestionIds: string[],
  limit = 8
): PracticePlanItem[] {
  const interviewIsSoon = daysUntil(calibration.interviewDate) <= 10;
  const weakness = calibration.selfReportedWeakness.toLowerCase();

  return questions
    .filter((question) => {
      const matchesCategory =
        calibration.practiceCategory === "all" || question.categories.includes(calibration.practiceCategory);
      return !completedQuestionIds.includes(question.id) && matchesCategory;
    })
    .map((question) => {
      const linkedConcepts = concepts.filter((concept) => question.concepts.includes(concept.conceptId));
      const weakestConceptScore =
        linkedConcepts.reduce((sum, concept) => {
          if (concept.state === "teach") return sum + 5;
          if (concept.state === "guided_practice") return sum + 3;
          if (concept.state === "light_feedback") return sum + 1;
          return sum;
        }, 0) || 1;
      const weaknessBoost = weakness && question.title.toLowerCase().includes(weakness) ? 4 : 0;
      const companyClaimBoost = question.companyClaim ? 20 : 0;
      const mode = interviewIsSoon && weakestConceptScore <= 2 ? "interview_mode" : modeFromConcepts(linkedConcepts);
      const priority =
        companyClaimBoost +
        targetMatch(question, calibration.targetLevel) +
        weakestConceptScore +
        weaknessBoost +
        (interviewIsSoon ? question.difficulty : 0);

      return {
        question,
        mode,
        explanationDepth: explanationDepthForMode(mode),
        priority,
        reason: buildReason(mode, calibration, linkedConcepts)
      };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

export function readiness(concepts: ConceptState[], calibration: Calibration) {
  const threshold = levelProfiles[calibration.targetLevel].threshold;
  const scored = concepts.filter((concept) => concept.recentScores.length > 0);
  const mastered = concepts.filter((concept) => ["light_feedback", "interview_mode", "maintenance"].includes(concept.state));
  const average = scored.length
    ? scored.reduce((sum, concept) => {
        const latest = concept.recentScores.at(-1) ?? 1;
        return sum + latest;
      }, 0) / scored.length
    : 0;

  return {
    score: Number(average.toFixed(1)),
    threshold,
    masteredCount: mastered.length,
    totalConcepts: concepts.length,
    label:
      average >= threshold
        ? "Interview ready for the next simulation"
        : scored.length
          ? "Building toward target-level readiness"
          : "Calibration needed"
  };
}

function buildReason(mode: PracticePlanItem["mode"], calibration: Calibration, concepts: ConceptState[]) {
  const concept = concepts.find((item) => item.state === "teach") ?? concepts[0];
  const target = levelProfiles[calibration.targetLevel].label;

  if (mode === "teach") return `Coach ${concept?.label ?? "a core concept"} before building toward ${target}.`;
  if (mode === "guided_practice") return `Guided rep to close a known gap for ${target}.`;
  if (mode === "light_feedback") return `Candidate is close; use short feedback and a harder follow-up.`;
  if (mode === "interview_mode") return `Ready for realistic interview-style practice.`;
  return `Maintenance rep to keep mastery fresh.`;
}
