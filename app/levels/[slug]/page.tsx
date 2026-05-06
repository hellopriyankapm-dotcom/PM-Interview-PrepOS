import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import levelsRaw from "@/content/levels/levels.json";
import questionsRaw from "@/content/questions/questions.json";
import { ContentShell } from "@/components/ContentShell";
import { levelMeta } from "@/lib/level-meta";
import { absoluteUrl } from "@/lib/seo";
import type { TargetLevel } from "@/lib/types";

type LevelEntry = { label: string; bar: string; threshold: number };
type Question = { id: string; title: string; targetLevels: string[] };

const levels = levelsRaw as Record<TargetLevel, LevelEntry>;
const questions = questionsRaw as Question[];

export function generateStaticParams() {
  return Object.keys(levels).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const level = levels[slug as TargetLevel];
  if (!level) return {};
  const meta = levelMeta[slug as TargetLevel];
  return {
    title: `${level.label} Interview — Bar, Practice Focus, and Sample Questions`,
    description: meta?.tagline ?? `${level.label} PM interview prep with calibrated practice in PrepOS.`,
    alternates: { canonical: `/levels/${slug}` },
    openGraph: {
      title: `${level.label} PM Interview`,
      description: meta?.tagline ?? "",
      url: absoluteUrl(`/levels/${slug}`)
    }
  };
}

export default async function LevelDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const key = slug as TargetLevel;
  const level = levels[key];
  const meta = levelMeta[key];
  if (!level || !meta) notFound();

  const matchingQuestions = questions.filter((q) => q.targetLevels.includes(slug));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${level.label} PM Interview Prep`,
    description: meta.tagline,
    url: absoluteUrl(`/levels/${slug}`),
    author: { "@type": "Organization", name: "PrepOS" },
    publisher: { "@type": "Organization", name: "PrepOS" }
  };

  return (
    <ContentShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Levels", href: "/levels" },
        { label: level.label }
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="content-head">
        <span className="eyebrow">PM interview level</span>
        <h1>{meta.fullName} interview</h1>
        <p className="content-lede">{meta.tagline}</p>
      </header>

      <section className="content-body">
        <div className="content-section">
          <h2>The bar at this level</h2>
          <p>{level.bar}</p>
          <p className="muted">
            PrepOS readiness threshold: <strong>{level.threshold}</strong> (on the 5-point open
            rubric).
          </p>
        </div>

        <div className="content-section">
          <h2>What changes vs the level below</h2>
          <ul className="bullet-list">
            {meta.whatChanges.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="content-section">
          <h2>Where to focus practice</h2>
          <ul className="bullet-list">
            {meta.practiceFocus.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        {matchingQuestions.length > 0 ? (
          <div className="content-section">
            <h2>Questions calibrated for {meta.shortName}</h2>
            <ul className="question-list">
              {matchingQuestions.slice(0, 25).map((q) => (
                <li key={q.id}>
                  <Link href={`/questions/${q.id}`}>{q.title}</Link>
                </li>
              ))}
            </ul>
            {matchingQuestions.length > 25 ? (
              <p className="muted">+ {matchingQuestions.length - 25} more in the full bank.</p>
            ) : null}
          </div>
        ) : null}

        <div className="content-section">
          <h2>Practice for {meta.shortName} in PrepOS</h2>
          <p>
            Open the practice simulator, set Target level to {meta.shortName}, and the adaptive queue
            will weight reps for this calibration.
          </p>
          <Link className="btn-primary" href="/app">
            Practice for {meta.shortName} →
          </Link>
        </div>
      </section>
    </ContentShell>
  );
}
