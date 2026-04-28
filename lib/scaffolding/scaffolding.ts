import type { ConceptState, ExplanationDepth, ScaffoldingMode } from "@/lib/types";

export function modeFromConcepts(concepts: ConceptState[]): ScaffoldingMode {
  const order: ScaffoldingMode[] = [
    "teach",
    "guided_practice",
    "light_feedback",
    "interview_mode",
    "maintenance"
  ];

  return concepts.reduce<ScaffoldingMode>((current, concept) => {
    return order.indexOf(concept.state) < order.indexOf(current) ? concept.state : current;
  }, "maintenance");
}

export function explanationDepthForMode(mode: ScaffoldingMode): ExplanationDepth {
  if (mode === "teach") return "high";
  if (mode === "guided_practice") return "medium";
  if (mode === "light_feedback") return "low";
  return "none";
}

export function coachCopy(mode: ScaffoldingMode, labels: string[]): string {
  const conceptList = labels.slice(0, 3).join(", ");

  if (mode === "teach") {
    return `Coach mode: start with ${conceptList}. Define the goal, pick a user or stakeholder, state the trade-off, and name the metric you would use.`;
  }

  if (mode === "guided_practice") {
    return `Try it with light scaffolding. Use ${conceptList}, then make one clear recommendation and explain the risk you would watch.`;
  }

  if (mode === "light_feedback") {
    return "You are close. Skip the lesson, answer crisply, and make the trade-off explicit.";
  }

  if (mode === "interview_mode") {
    return "Interview practice: answer independently, then use the feedback to refine your next rep.";
  }

  return "Maintenance rep: keep it concise and prove the concept still holds under time pressure.";
}

export function updateConceptState(concept: ConceptState, score: number): ConceptState {
  const recentScores = [...concept.recentScores, score].slice(-3);
  const average = recentScores.reduce((sum, item) => sum + item, 0) / recentScores.length;

  let state: ScaffoldingMode = concept.state;

  if (average >= 4.2 && recentScores.length >= 3) {
    state = "interview_mode";
  } else if (average >= 3.7 && recentScores.length >= 2) {
    state = "light_feedback";
  } else if (average >= 3) {
    state = "guided_practice";
  } else {
    state = "teach";
  }

  if (recentScores.length === 3 && recentScores.filter((item) => item < 3).length >= 2) {
    state = "teach";
  }

  return {
    ...concept,
    state,
    recentScores,
    confidence: average >= 4 ? "high" : average >= 3 ? "medium" : "low",
    explanationDepth: explanationDepthForMode(state)
  };
}
