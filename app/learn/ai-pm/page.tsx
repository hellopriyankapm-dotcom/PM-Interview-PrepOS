import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Target } from "lucide-react";
import { ContentShell } from "@/components/ContentShell";
import { LearnProPackSection } from "@/components/learn/LearnProPackSection";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Learn AI PM — Free Flashcards | PrepOS",
  description:
    "Free AI PM interview prep flashcards. Pick a deck of terminologies (LLM, RAG, eval, hallucination) or judgment scenarios (latency, safety, model swaps).",
  alternates: { canonical: "/learn/ai-pm" },
  openGraph: {
    title: "Learn AI PM — Free Flashcards | PrepOS",
    description:
      "Two free decks: AI PM terminologies + AI PM judgment scenarios. From PrepOS.",
    url: absoluteUrl("/learn/ai-pm")
  }
};

export default function LearnAiPmHub() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Learn AI PM — Flashcards",
    description:
      "Free flashcard decks for AI Product Management interview prep: terminologies and judgment scenarios.",
    url: absoluteUrl("/learn/ai-pm"),
    isPartOf: { "@type": "WebSite", name: "PrepOS", url: SITE_URL },
    hasPart: [
      {
        "@type": "LearningResource",
        name: "AI PM Terminologies",
        url: absoluteUrl("/learn/ai-pm/terms"),
        learningResourceType: "Flashcards"
      },
      {
        "@type": "LearningResource",
        name: "AI PM Scenarios",
        url: absoluteUrl("/learn/ai-pm/scenarios"),
        learningResourceType: "Flashcards"
      }
    ]
  };

  return (
    <ContentShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Learn AI PM" }
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="content-head">
        <span className="eyebrow">Free · AI PM flashcards</span>
        <h1>Learn AI PM, Easily</h1>
        <p className="content-lede">
          Two free decks. Tap any card to flip; arrow keys to navigate; progress saves locally.
        </p>
      </header>

      <section className="content-body">
        <div className="learn-tile-grid">
          <Link href="/learn/ai-pm/terms" className="learn-tile">
            <BookOpen size={28} aria-hidden="true" />
            <h2>AI PM Terminologies</h2>
            <p>
              LLM, RAG, hallucination, evals, prompt injection, and more — with the PM angle on
              each.
            </p>
            <span className="learn-tile-cta">Start learning →</span>
          </Link>
          <Link href="/learn/ai-pm/scenarios" className="learn-tile">
            <Target size={28} aria-hidden="true" />
            <h2>AI PM Scenarios</h2>
            <p>
              Hallucination triage, latency optimisation, model swap calls, safety incident
              response — and more.
            </p>
            <span className="learn-tile-cta">Start learning →</span>
          </Link>
        </div>

        <LearnProPackSection source="prepos-learn-aipm-hub" />
      </section>
    </ContentShell>
  );
}
