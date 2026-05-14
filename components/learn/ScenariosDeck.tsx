"use client";

import { useEffect, useState } from "react";
import { Flashcard } from "@/components/Flashcard";
import { DeckShell } from "@/components/learn/DeckShell";
import scenariosRaw from "@/content/learn/ai-pm-scenarios.json";
import type { Scenario } from "@/lib/learn/types";

const scenarios = scenariosRaw as Scenario[];

export function ScenariosDeck() {
  return (
    <DeckShell
      deckId="ai-pm-scenarios"
      totalCards={scenarios.length}
      proPackSource="prepos-learn-aipm-scenarios"
      proPackHook="Pro Pack unlocks the full AI PM scenario deck — plus the AI Coach, the AI PM question bank, and the expert-answer library."
    >
      {(index) => {
        const scenario = scenarios[index];
        if (!scenario) return null;
        return <ScenarioCard key={scenario.id} scenario={scenario} />;
      }}
    </DeckShell>
  );
}

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setPicked(null);
    setFlipped(false);
  }, [scenario.id]);

  function handlePick(key: string) {
    setPicked(key);
    setFlipped(true);
  }

  const bestChoice = scenario.choices.find((c) => c.key === scenario.best);

  return (
    <Flashcard
      flipped={flipped}
      onFlip={setFlipped}
      front={
        <div className="flashcard-content flashcard-content-front">
          <span className="flashcard-eyebrow">Scenario</span>
          <p className="flashcard-setup">{scenario.setup}</p>
          <div className="flashcard-choices">
            {scenario.choices.map((c) => (
              <button
                key={c.key}
                type="button"
                className="flashcard-choice"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePick(c.key);
                }}
                aria-label={`Pick option ${c.key}`}
              >
                <span className="flashcard-choice-key">{c.key}</span>
                <span className="flashcard-choice-label">{c.label}</span>
              </button>
            ))}
          </div>
          <p className="flashcard-hint">Pick an option to reveal the answer</p>
        </div>
      }
      back={
        <div className="flashcard-content flashcard-content-back">
          <span className="flashcard-eyebrow">Best answer</span>
          <p className="flashcard-best">
            <strong>{scenario.best}</strong> — {bestChoice?.label}
          </p>
          {picked && picked !== scenario.best ? (
            <p className="flashcard-your-pick">
              You picked: <strong>{picked}</strong>
            </p>
          ) : null}
          <div className="flashcard-section">
            <strong>Why</strong>
            <p>{scenario.reasoning}</p>
          </div>
          {scenario.rubric_signals.length > 0 ? (
            <div className="flashcard-related">
              <span className="flashcard-eyebrow-small">Rubric signals</span>
              <div className="flashcard-chips">
                {scenario.rubric_signals.map((r) => (
                  <span key={r} className="flashcard-chip">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      }
    />
  );
}
