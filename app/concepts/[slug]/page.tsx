import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import conceptsRaw from "@/content/concepts/concepts.json";
import questionsRaw from "@/content/questions/questions.json";
import { ContentShell } from "@/components/ContentShell";
import { conceptMeta } from "@/lib/concept-meta";
import { ROUND_LABEL } from "@/lib/round-types";
import type { RoundType } from "@/lib/types";
import { SITE_URL, absoluteUrl, slugifyConceptId, slugifyRoundType } from "@/lib/seo";

type Concept = { id: string; label: string; roundType: RoundType };
type Question = { id: string; title: string; concepts: string[] };

const concepts = conceptsRaw as Concept[];
const questions = questionsRaw as Question[];

export function generateStaticParams() {
  return concepts.map((c) => ({ slug: slugifyConceptId(c.id) }));
}

function findConcept(slug: string) {
  return concepts.find((c) => slugifyConceptId(c.id) === slug);
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const concept = findConcept(slug);
  if (!concept) return {};
  const meta = conceptMeta[concept.id];
  return {
    title: `${concept.label} — PM Interview Concept`,
    description: meta?.definition.slice(0, 280) ?? `${concept.label}: a PM interview concept tested in the ${ROUND_LABEL[concept.roundType]} round.`,
    alternates: { canonical: `/concepts/${slug}` },
    openGraph: {
      title: `${concept.label} — PM Interview Concept`,
      description: meta?.definition.slice(0, 280) ?? "",
      url: absoluteUrl(`/concepts/${slug}`)
    }
  };
}

export default async function ConceptDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const concept = findConcept(slug);
  if (!concept) notFound();

  const meta = conceptMeta[concept.id];
  const relatedQuestions = questions.filter((q) => q.concepts.includes(concept.id));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: concept.label,
    description: meta?.definition,
    url: absoluteUrl(`/concepts/${slug}`),
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "PrepOS PM interview concepts",
      url: `${SITE_URL}/concepts`
    },
    termCode: concept.id
  };

  return (
    <ContentShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Concepts", href: "/concepts" },
        { label: concept.label }
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="content-head">
        <span className="eyebrow">
          PM interview concept ·{" "}
          <Link href={`/rounds/${slugifyRoundType(concept.roundType)}`}>
            {ROUND_LABEL[concept.roundType]}
          </Link>
        </span>
        <h1>{concept.label}</h1>
        {meta?.definition ? <p className="content-lede">{meta.definition}</p> : null}
      </header>

      <section className="content-body">
        {meta?.whyItMatters ? (
          <div className="content-section">
            <h2>Why interviewers test it</h2>
            <p>{meta.whyItMatters}</p>
          </div>
        ) : null}

        {relatedQuestions.length > 0 ? (
          <div className="content-section">
            <h2>Practice questions that drill {concept.label.toLowerCase()}</h2>
            <ul className="question-list">
              {relatedQuestions.slice(0, 25).map((q) => (
                <li key={q.id}>
                  <Link href={`/questions/${q.id}`}>{q.title}</Link>
                </li>
              ))}
            </ul>
            {relatedQuestions.length > 25 ? (
              <p className="muted">+ {relatedQuestions.length - 25} more in the full bank.</p>
            ) : null}
          </div>
        ) : null}

        <div className="content-section">
          <h2>Practice this concept in PrepOS</h2>
          <p>
            Open the practice simulator, select &quot;{concept.label}&quot; under your weakest concepts,
            and the adaptive queue will surface reps that drill it first.
          </p>
          <Link className="btn-primary" href="/app">
            Practice {concept.label.toLowerCase()} →
          </Link>
        </div>
      </section>
    </ContentShell>
  );
}
