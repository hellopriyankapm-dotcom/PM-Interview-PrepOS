import resourcesRaw from "@/content/resources/resources.json";
import type { Question, Resource } from "@/lib/types";

export const resources = resourcesRaw as Resource[];

export type ResourceMatch = {
  resource: Resource;
  specificity: 1 | 2 | 3;
};

export function findResourcesForQuestion(question: Question, limit = 3): ResourceMatch[] {
  const tier3: ResourceMatch[] = [];
  const tier2: ResourceMatch[] = [];
  const tier1: ResourceMatch[] = [];

  for (const resource of resources) {
    if (resource.appliesTo.questionIds?.includes(question.id)) {
      tier3.push({ resource, specificity: 3 });
    } else if (resource.appliesTo.concepts?.some((id) => question.concepts.includes(id))) {
      tier2.push({ resource, specificity: 2 });
    } else if (resource.appliesTo.categories?.some((cat) => question.categories.includes(cat))) {
      tier1.push({ resource, specificity: 1 });
    }
  }

  return [...tier3, ...tier2, ...tier1].slice(0, limit);
}
