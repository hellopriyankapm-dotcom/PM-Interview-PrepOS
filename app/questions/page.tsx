import type { Metadata } from "next";
import Link from "next/link";
import questionsRaw from "@/content/questions/questions.json";
import { ContentShell } from "@/components/ContentShell";
import { ROUND_LABEL, ROUND_ORDER } from "@/lib/round-types";
import type { RoundType } from "@/lib/types";
import { slugifyRoundType } from "@/lib/seo";

type Question = {
  id: string;
  title: string;
  prompt: string;
  roundType: RoundType;
  difficulty: number;
  targetLevels: string[];
};

const questions = questionsRaw as Question[];

export const metadata: Metadata = {
  title: "All PM Interview Questions — 250 Reviewed Prompts",
  description: `Browse all ${questions.length} reviewed PM interview questions in PrepOS. Sorted by round type — product sense, execution, AI product judgment, behavioral, strategy, technical collaboration. Free to practice.`,
  alternates: { canonical: "/questions" }
};

export default function QuestionsIndexPage() {
  const byRound = new Map<RoundType, Question[]>();
  for (const q of questions) {
    const list = byRound.get(q.roundType) ?? [];
    list.push(q);
    byRound.set(q.roundType, list);
  }

  return (
    <ContentShell crumbs={[{ label: "Home", href: "/" }, { label: "All questions" }]}>
      <header className="content-head">
        <span className="eyebrow">PM interview question bank</span>
        <h1>All PM interview questions ({questions.length} reviewed prompts)</h1>
        <p>
          Every prompt below is a real PM interview practice question with a named reviewer. Click into any
          question for the prompt, the concepts it tests, and a one-tap link into the adaptive practice
          simulator.
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
              <ul className="question-list">
                {list.map((q) => (
                  <li key={q.id}>
                    <Link href={`/questions/${q.id}`}>{q.title}</Link>
                    <span className="question-meta">
                      Difficulty {q.difficulty} · {q.targetLevels.join(", ")}
                    </span>
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
