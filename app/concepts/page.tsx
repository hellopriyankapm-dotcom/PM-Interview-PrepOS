import type { Metadata } from "next";
import Link from "next/link";
import conceptsRaw from "@/content/concepts/concepts.json";
import { ContentShell } from "@/components/ContentShell";
import { ROUND_LABEL, ROUND_ORDER } from "@/lib/round-types";
import type { RoundType } from "@/lib/types";
import { slugifyConceptId, slugifyRoundType } from "@/lib/seo";

type Concept = { id: string; label: string; roundType: RoundType };

const concepts = conceptsRaw as Concept[];

export const metadata: Metadata = {
  title: "PM Interview Concepts — All 18 Tracked Skills",
  description:
    "The 18 concepts PrepOS tracks across PM interview rounds. North-star metrics, AI eval design, conflict-handling, durable advantage, API contracts and more — each mapped to a round type.",
  alternates: { canonical: "/concepts" }
};

export default function ConceptsIndexPage() {
  const byRound = new Map<RoundType, Concept[]>();
  for (const c of concepts) {
    const list = byRound.get(c.roundType) ?? [];
    list.push(c);
    byRound.set(c.roundType, list);
  }

  return (
    <ContentShell crumbs={[{ label: "Home", href: "/" }, { label: "Concepts" }]}>
      <header className="content-head">
        <span className="eyebrow">PM interview concepts</span>
        <h1>All 18 PM interview concepts, mapped to round types</h1>
        <p>
          PrepOS tracks every practice rep against one or more of these concepts, then prioritises the
          weakest ones first. Click any concept for its definition, why interviewers test it, and the
          questions that drill it.
        </p>
      </header>

      <section className="content-body">
        {ROUND_ORDER.map((round) => {
          const list = byRound.get(round) ?? [];
          if (list.length === 0) return null;
          return (
            <div className="content-section" key={round}>
              <h2>
                <Link href={`/rounds/${slugifyRoundType(round)}`}>{ROUND_LABEL[round]}</Link>{" "}
                <span className="muted">({list.length})</span>
              </h2>
              <ul className="concept-list">
                {list.map((c) => (
                  <li key={c.id}>
                    <Link href={`/concepts/${slugifyConceptId(c.id)}`}>{c.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </ContentShell>
  );
}
