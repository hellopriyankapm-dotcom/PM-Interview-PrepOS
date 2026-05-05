import conceptsRaw from "@/content/concepts/concepts.json";
import levelsRaw from "@/content/levels/levels.json";
import questionsRaw from "@/content/questions/questions.json";
import type { ConceptState, Question, RoundType, TargetLevel } from "@/lib/types";

type LevelProfile = {
  label: string;
  threshold: number;
  bar: string;
};

export const questions = questionsRaw as Question[];
export const levelProfiles = levelsRaw as Record<TargetLevel, LevelProfile>;

export const targetLevelOptions: Array<{ value: TargetLevel; label: string }> = Object.entries(
  levelProfiles
).map(([value, profile]) => ({
  value: value as TargetLevel,
  label: profile.label
}));

export function createInitialConceptStates(): ConceptState[] {
  return conceptsRaw.map((concept) => ({
    conceptId: concept.id,
    label: concept.label,
    roundType: concept.roundType as RoundType,
    state: "teach",
    recentScores: [],
    confidence: "low",
    explanationDepth: "high"
  }));
}

export type ConceptOption = { id: string; label: string; roundType: RoundType };

export const concepts: ConceptOption[] = conceptsRaw.map((concept) => ({
  id: concept.id,
  label: concept.label,
  roundType: concept.roundType as RoundType
}));

export const conceptsByRound: Map<RoundType, ConceptOption[]> = (() => {
  const map = new Map<RoundType, ConceptOption[]>();
  for (const concept of concepts) {
    const list = map.get(concept.roundType) ?? [];
    list.push(concept);
    map.set(concept.roundType, list);
  }
  return map;
})();
