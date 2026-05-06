import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/ContentShell";
import { roundMeta } from "@/lib/round-meta";
import { ROUND_LABEL, ROUND_ORDER } from "@/lib/round-types";
import { slugifyRoundType } from "@/lib/seo";

export const metadata: Metadata = {
  title: "PM Interview Round Types — All 6 Explained",
  description:
    "Every PM interview maps to one of six round types: product sense, execution, AI product judgment, behavioral, strategy, and technical collaboration. Each round explained, with the concepts and questions that drill it.",
  alternates: { canonical: "/rounds" }
};

export default function RoundsIndexPage() {
  return (
    <ContentShell crumbs={[{ label: "Home", href: "/" }, { label: "Round types" }]}>
      <header className="content-head">
        <span className="eyebrow">PM interview rounds</span>
        <h1>The 6 PM interview round types, explained</h1>
        <p>
          Every PM interview practice question in PrepOS is tagged with one of these round types. Each
          round tests a different bundle of concepts — the page for each round shows what interviewers
          are looking for, the common mistakes, and the questions that drill it.
        </p>
      </header>

      <section className="content-body">
        {ROUND_ORDER.map((round) => (
          <div className="content-section" key={round}>
            <h2>
              <Link href={`/rounds/${slugifyRoundType(round)}`}>{ROUND_LABEL[round]}</Link>
            </h2>
            <p>{roundMeta[round].tagline}</p>
          </div>
        ))}
      </section>
    </ContentShell>
  );
}
