export const SITE_URL = "https://pmprepos.com";
export const SITE_NAME = "PrepOS";

export function slugifyConceptId(id: string): string {
  return id.replace(/\./g, "-").replace(/_/g, "-");
}

export function unslugifyConceptId(slug: string): string {
  // Reverse mapping: build a lookup from real concept IDs.
  // Used by [slug] pages to find the concept.
  return slug;
}

export function slugifyRoundType(roundType: string): string {
  return roundType.replace(/_/g, "-");
}

export function unslugifyRoundType(slug: string): string {
  return slug.replace(/-/g, "_");
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
