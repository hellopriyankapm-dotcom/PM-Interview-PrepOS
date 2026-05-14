import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContentShell } from "@/components/ContentShell";
import { LearnProPackSection } from "@/components/learn/LearnProPackSection";
import { ScenariosDeck } from "@/components/learn/ScenariosDeck";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI PM Scenarios — Free Flashcards | PrepOS",
  description:
    "Free flashcard deck of AI PM judgment scenarios: hallucination triage, latency vs cost, model swap calls, safety incident response. Pick an option, reveal the senior-PM answer.",
  alternates: { canonical: "/learn/ai-pm/scenarios" },
  openGraph: {
    title: "AI PM Scenarios — Free Flashcards | PrepOS",
    description:
      "Practice AI PM judgment in 60 seconds per card: setup, four choices, best answer with reasoning.",
    url: absoluteUrl("/learn/ai-pm/scenarios")
  }
};

export default function AiPmScenariosPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: "AI PM Scenarios — Flashcards",
    description:
      "Free flashcard deck of AI Product Management judgment scenarios with best-answer reasoning.",
    learningResourceType: "Flashcards",
    educationalLevel: "Professional",
    about: "AI Product Management interview prep",
    url: absoluteUrl("/learn/ai-pm/scenarios"),
    isPartOf: { "@type": "WebSite", name: "PrepOS", url: SITE_URL },
    inLanguage: "en"
  };

  return (
    <ContentShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Learn AI PM", href: "/learn/ai-pm" },
        { label: "Scenarios" }
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/learn/ai-pm" className="learn-back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Learn AI PM
      </Link>

      <header className="content-head">
        <span className="eyebrow">Free · AI PM flashcards</span>
        <h1>AI PM Scenarios</h1>
        <p className="content-lede">
          Read the setup, pick what you&apos;d ship, then reveal the senior-PM answer with
          reasoning.
        </p>
      </header>

      <section className="content-body">
        <ScenariosDeck />
        <LearnProPackSection source="prepos-learn-aipm-scenarios-bottom" />
      </section>
    </ContentShell>
  );
}
