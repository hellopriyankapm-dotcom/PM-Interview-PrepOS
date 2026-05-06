import type { MetadataRoute } from "next";
import conceptsRaw from "@/content/concepts/concepts.json";
import questionsRaw from "@/content/questions/questions.json";
import levelsRaw from "@/content/levels/levels.json";
import { ROUND_ORDER } from "@/lib/round-types";
import { SITE_URL, slugifyConceptId, slugifyRoundType } from "@/lib/seo";

export const dynamic = "force-static";

type Question = { id: string };
type Concept = { id: string };

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/app`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/questions`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/concepts`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/rounds`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/levels`, lastModified: now, changeFrequency: "monthly", priority: 0.8 }
  ];

  const questionEntries: MetadataRoute.Sitemap = (questionsRaw as Question[]).map((q) => ({
    url: `${SITE_URL}/questions/${q.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6
  }));

  const conceptEntries: MetadataRoute.Sitemap = (conceptsRaw as Concept[]).map((c) => ({
    url: `${SITE_URL}/concepts/${slugifyConceptId(c.id)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7
  }));

  const roundEntries: MetadataRoute.Sitemap = ROUND_ORDER.map((round) => ({
    url: `${SITE_URL}/rounds/${slugifyRoundType(round)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7
  }));

  const levelEntries: MetadataRoute.Sitemap = Object.keys(levelsRaw).map((levelKey) => ({
    url: `${SITE_URL}/levels/${levelKey}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7
  }));

  return [
    ...staticEntries,
    ...questionEntries,
    ...conceptEntries,
    ...roundEntries,
    ...levelEntries
  ];
}
