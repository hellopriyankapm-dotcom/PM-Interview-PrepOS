import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import conceptsRaw from "@/content/concepts/concepts.json";
import questionsRaw from "@/content/questions/questions.json";
import { ContentShell } from "@/components/ContentShell";
import { roundMeta } from "@/lib/round-meta";
import { ROUND_LABEL, ROUND_ORDER } from "@/lib/round-types";
import type { RoundType } from "@/lib/types";
import { absoluteUrl, slugifyConceptId, slugifyRoundType, unslugifyRoundType } from "@/lib/seo";

type Concept = { id: string; label: string; roundType: RoundType };
type Question = { id: string; title: string; roundType: RoundType };

const concepts = conceptsRaw as Concept[];
const questions = questionsRaw as Question[];

export function generateStaticParams() {
  return ROUND_ORDER.map((round) => ({ slug: slugifyRoundType(round) }));
}

function findRound(slug: string): RoundType | null {
  const candidate = unslugifyRoundType(slug) as RoundType;
  return ROUND_ORDER.includes(candidate) ? candidate : null;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const round = findRound(slug);
  if (!round) return {};
  const meta = roundMeta[round];
  return {
    title: `${ROUND_LABEL[round]} PM Interview Round — What It Tests`,
    description: meta.tagline,
    alternates: { canonical: `/rounds/${slug}` },
    openGraph: {
      title: `${ROUND_LABEL[round]} PM Interview Round`,
      description: meta.tagline,
      url: absoluteUrl(`/rounds/${slug}`)
    }
  };
}

export default async function RoundDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const round = findRound(slug);
  if (!round) notFound();

  const meta = roundMeta[round];
  const roundConcepts = concepts.filter((c) => c.roundType === round);
  const roundQuestions = questions.filter((q) => q.roundType === round);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${ROUND_LABEL[round]} PM Interview Round`,
    description: meta.tagline,
    url: absoluteUrl(`/rounds/${slug}`),
    author: { "@type": "Organization", name: "PrepOS" },
    publisher: { "@type": "Organization", name: "PrepOS" }
  };

  return (
    <ContentShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Rounds", href: "/rounds" },
        { label: ROUND_LABEL[round] }
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="content-head">
        <span className="eyebrow">PM interview round type</span>
        <h1>{ROUND_LABEL[round]} round in a PM interview</h1>
        <p className="content-lede">{meta.tagline}</p>
      </header>

      <section className="content-body">
        <div className="content-section">
          <h2>What this round tests</h2>
          <ul className="bullet-list">
            {meta.whatItTests.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="content-section">
          <h2>What interviewers are listening for</h2>
          <ul className="bullet-list">
            {meta.signalsInterviewersLookFor.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="content-section">
          <h2>Common mistakes</h2>
          <ul className="bullet-list">
            {meta.commonMistakes.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        {roundConcepts.length > 0 ? (
          <div className="content-section">
            <h2>Concepts tested in {meta.shortLabel.toLowerCase()}</h2>
            <ul className="concept-list">
              {roundConcepts.map((c) => (
                <li key={c.id}>
                  <Link href={`/concepts/${slugifyConceptId(c.id)}`}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {roundQuestions.length > 0 ? (
          <div className="content-section">
            <h2>Practice questions ({roundQuestions.length})</h2>
            <ul className="question-list">
              {roundQuestions.slice(0, 25).map((q) => (
                <li key={q.id}>
                  <Link href={`/questions/${q.id}`}>{q.title}</Link>
                </li>
              ))}
            </ul>
            {roundQuestions.length > 25 ? (
              <p className="muted">+ {roundQuestions.length - 25} more in the full bank.</p>
            ) : null}
          </div>
        ) : null}

        <div className="content-section">
          <h2>Practice this round in PrepOS</h2>
          <p>
            Calibrate your target level, set the practice category to {meta.shortLabel.toLowerCase()},
            and the adaptive queue will surface the highest-impact reps first.
          </p>
          <Link className="btn-primary" href="/app">
            Practice {meta.shortLabel.toLowerCase()} →
          </Link>
        </div>
      </section>
    </ContentShell>
  );
}
