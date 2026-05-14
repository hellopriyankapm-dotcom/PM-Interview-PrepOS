"use client";

import { Flashcard } from "@/components/Flashcard";
import { DeckShell } from "@/components/learn/DeckShell";
import termsRaw from "@/content/learn/ai-pm-terms.json";
import type { Term } from "@/lib/learn/types";

const terms = termsRaw as Term[];

export function TermsDeck() {
  return (
    <DeckShell
      deckId="ai-pm-terms"
      totalCards={terms.length}
      proPackSource="prepos-learn-aipm-terms"
      proPackHook={`Pro Pack unlocks the full AI PM terminology deck — plus the AI Coach for framework + example + trap hints on every question, and the AI PM question bank.`}
    >
      {(index) => {
        const card = terms[index];
        if (!card) return null;
        return (
          <Flashcard
            key={card.id}
            front={
              <div className="flashcard-content flashcard-content-front flashcard-content-front-term">
                <span className="flashcard-eyebrow">Term</span>
                <h2 className="flashcard-term">{card.term}</h2>
                <p className="flashcard-hint">Tap to reveal definition</p>
              </div>
            }
            back={
              <div className="flashcard-content flashcard-content-back">
                <span className="flashcard-eyebrow">Definition</span>
                <p className="flashcard-definition">{card.definition}</p>
                <div className="flashcard-section">
                  <strong>PM angle</strong>
                  <p>{card.pm_angle}</p>
                </div>
                <div className="flashcard-section">
                  <strong>Example</strong>
                  <p>{card.example}</p>
                </div>
                {card.related.length > 0 ? (
                  <div className="flashcard-related">
                    <span className="flashcard-eyebrow-small">Related</span>
                    <div className="flashcard-chips">
                      {card.related.map((r) => (
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
      }}
    </DeckShell>
  );
}
