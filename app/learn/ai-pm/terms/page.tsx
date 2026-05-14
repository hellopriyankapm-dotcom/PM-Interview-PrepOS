import type { Metadata } from "next";
import { ContentShell } from "@/components/ContentShell";
import { TermsDeck } from "@/components/learn/TermsDeck";
import { SITE_URL, absoluteUrl } from "@/lib/seo";
import termsRaw from "@/content/learn/ai-pm-terms.json";
import type { Term } from "@/lib/learn/types";

const terms = termsRaw as Term[];

export const metadata: Metadata = {
  title: "AI PM Terminologies — Free Flashcards | PrepOS",
  description:
    "Free flashcard deck for AI PM interview prep: RAG, hallucination, eval design, latency, prompt injection, and more — with PM-angle definitions and concrete examples.",
  alternates: { canonical: "/learn/ai-pm/terms" },
  openGraph: {
    title: "AI PM Terminologies — Free Flashcards | PrepOS",
    description:
      "Free flashcards for AI PM interview prep. Concise definitions plus the PM angle and a real-world example for every term.",
    url: absoluteUrl("/learn/ai-pm/terms")
  }
};

export default function AiPmTermsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: "AI PM Terminologies — Flashcards",
    description:
      "Free flashcard deck of AI Product Management terms with PM-angle definitions and examples.",
    learningResourceType: "Flashcards",
    educationalLevel: "Professional",
    about: "AI Product Management interview prep",
    url: absoluteUrl("/learn/ai-pm/terms"),
    isPartOf: { "@type": "WebSite", name: "PrepOS", url: SITE_URL },
    inLanguage: "en"
  };

  return (
    <ContentShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Learn AI PM" },
        { label: "Terminologies" }
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="content-head">
        <span className="eyebrow">Free · AI PM flashcards</span>
        <h1>AI PM Terminologies</h1>
        <p className="content-lede">
          {terms.length} cards. Tap any card to flip and see the definition, the PM angle, and a
          real-world example.
        </p>
      </header>

      <section className="content-body">
        <TermsDeck />
      </section>
    </ContentShell>
  );
}
