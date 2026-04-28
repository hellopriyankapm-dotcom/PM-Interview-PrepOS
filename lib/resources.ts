import resourcesRaw from "@/content/resources/resources.json";
import type { Question, Resource } from "@/lib/types";

export const resources = resourcesRaw as Resource[];

export function findResourcesForQuestion(question: Question, limit = 6): Resource[] {
  const matches: Array<{ resource: Resource; specificity: number }> = [];

  for (const resource of resources) {
    let specificity = 0;
    if (resource.appliesTo.questionIds?.includes(question.id)) {
      specificity = 3;
    } else if (resource.appliesTo.concepts?.some((id) => question.concepts.includes(id))) {
      specificity = 2;
    } else if (resource.appliesTo.categories?.some((cat) => question.categories.includes(cat))) {
      specificity = 1;
    }

    if (specificity > 0) matches.push({ resource, specificity });
  }

  matches.sort((a, b) => b.specificity - a.specificity);
  return matches.slice(0, limit).map((entry) => entry.resource);
}
