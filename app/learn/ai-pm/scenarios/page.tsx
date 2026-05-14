import type { Metadata } from "next";
import { ContentShell } from "@/components/ContentShell";
import { ScenariosDeck } from "@/components/learn/ScenariosDeck";
import { SITE_URL, absoluteUrl } from "@/lib/seo";
import scenariosRaw from "@/content/learn/ai-pm-scenarios.json";
import type { Scenario } from "@/lib/learn/types";

const scenarios = scenariosRaw as Scenario[];

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
        { label: "Learn AI PM" },
        { label: "Scenarios" }
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="content-head">
        <span className="eyebrow">Free · AI PM flashcards</span>
        <h1>AI PM Scenarios</h1>
        <p className="content-lede">
          {scenarios.length} cards. Read the setup, pick what you&apos;d ship, then reveal the
          senior-PM answer with reasoning.
        </p>
      </header>

      <section className="content-body">
        <ScenariosDeck />
      </section>
    </ContentShell>
  );
}
