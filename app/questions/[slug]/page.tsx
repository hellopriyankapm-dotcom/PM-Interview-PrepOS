import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import questionsRaw from "@/content/questions/questions.json";
import conceptsRaw from "@/content/concepts/concepts.json";
import { ContentShell } from "@/components/ContentShell";
import { ROUND_LABEL } from "@/lib/round-types";
import type { RoundType } from "@/lib/types";
import { SITE_URL, absoluteUrl, slugifyConceptId, slugifyRoundType } from "@/lib/seo";

type Question = {
  id: string;
  title: string;
  prompt: string;
  roundType: RoundType;
  categories: string[];
  targetLevels: string[];
  concepts: string[];
  difficulty: number;
  sourceType: string;
  reviewer: string;
};

type Concept = { id: string; label: string; roundType: RoundType };

const questions = questionsRaw as Question[];
const concepts = conceptsRaw as Concept[];
const conceptById = new Map(concepts.map((c) => [c.id, c]));

export function generateStaticParams() {
  return questions.map((q) => ({ slug: q.id }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const question = questions.find((q) => q.id === slug);
  if (!question) return {};
  const description = `${question.prompt} A ${ROUND_LABEL[question.roundType].toLowerCase()} PM interview practice question for ${question.targetLevels.join(", ").toUpperCase()} candidates. Difficulty ${question.difficulty}/5. Practice it free in PrepOS.`;
  return {
    title: `${question.title} — PM Interview Practice Question`,
    description: description.slice(0, 280),
    alternates: { canonical: `/questions/${question.id}` },
    openGraph: {
      title: question.title,
      description: description.slice(0, 280),
      url: absoluteUrl(`/questions/${question.id}`)
    }
  };
}

export default async function QuestionDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const question = questions.find((q) => q.id === slug);
  if (!question) notFound();

  const linked = question.concepts
    .map((id) => conceptById.get(id))
    .filter((c): c is Concept => Boolean(c));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Question",
    name: question.title,
    text: question.prompt,
    educationalLevel: question.targetLevels.join(", "),
    learningResourceType: "Practice question",
    inLanguage: "en",
    url: absoluteUrl(`/questions/${question.id}`),
    isPartOf: {
      "@type": "WebSite",
      name: "PrepOS",
      url: SITE_URL
    },
    about: linked.map((c) => ({
      "@type": "DefinedTerm",
      name: c.label
    }))
  };

  return (
    <ContentShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Questions", href: "/questions" },
        { label: question.title }
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="content-head">
        <span className="eyebrow">
          <Link href={`/rounds/${slugifyRoundType(question.roundType)}`}>
            {ROUND_LABEL[question.roundType]}
          </Link>{" "}
          · Difficulty {question.difficulty}/5
        </span>
        <h1>{question.title}</h1>
        <p className="content-lede">
          A PM interview practice question for{" "}
          {question.targetLevels.map((l) => l.toUpperCase()).join(", ")} candidates.
        </p>
      </header>

      <section className="content-body">
        <div className="content-section">
          <h2>The prompt</h2>
          <blockquote className="prompt-quote">{question.prompt}</blockquote>
        </div>

        {linked.length > 0 ? (
          <div className="content-section">
            <h2>Concepts this question tests</h2>
            <ul className="concept-list">
              {linked.map((c) => (
                <li key={c.id}>
                  <Link href={`/concepts/${slugifyConceptId(c.id)}`}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="content-section">
          <h2>How to practice it in PrepOS</h2>
          <p>
            PrepOS&apos;s adaptive queue surfaces this question when you calibrate to a matching target
            level and your weakest concepts overlap with what it tests. Open the practice simulator and
            select the round type to start a rep with this prompt.
          </p>
          <Link className="btn-primary" href="/app">
            Practice this rep →
          </Link>
        </div>

        <div className="content-section meta-strip">
          <p>
            <strong>Round:</strong>{" "}
            <Link href={`/rounds/${slugifyRoundType(question.roundType)}`}>
              {ROUND_LABEL[question.roundType]}
            </Link>
            <br />
            <strong>Target levels:</strong>{" "}
            {question.targetLevels.map((l, i) => (
              <span key={l}>
                <Link href={`/levels/${l}`}>{l.toUpperCase()}</Link>
                {i < question.targetLevels.length - 1 ? ", " : ""}
              </span>
            ))}
            <br />
            <strong>Source:</strong> {question.sourceType} · Reviewed by {question.reviewer}
          </p>
        </div>
      </section>
    </ContentShell>
  );
}
