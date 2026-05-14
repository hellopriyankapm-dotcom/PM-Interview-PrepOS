"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { PromoEmailForm } from "@/components/PromoEmailForm";
import { loadDeckProgress, saveDeckProgress } from "@/lib/learn/storage";

const FREE_TIER_LIMIT = 20;

type Props = {
  deckId: string;
  totalCards: number;
  proPackSource: string;
  proPackHook: string;
  children: (currentIndex: number) => React.ReactNode;
};

export function DeckShell({ deckId, totalCards, proPackSource, proPackHook, children }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const { lastSeenIndex } = loadDeckProgress(deckId);
    setCurrentIndex(Math.min(Math.max(0, lastSeenIndex), Math.max(0, totalCards - 1)));
    setHydrated(true);
  }, [deckId, totalCards]);

  useEffect(() => {
    if (hydrated) saveDeckProgress(deckId, { lastSeenIndex: currentIndex });
  }, [deckId, currentIndex, hydrated]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isEditable =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (isEditable) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((i) => Math.min(i + 1, totalCards - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((i) => Math.max(i - 1, 0));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [totalCards]);

  const atGate = currentIndex >= FREE_TIER_LIMIT;
  const displayPosition = Math.min(currentIndex + 1, totalCards);
  const progressPercent = Math.min(100, ((currentIndex + 1) / Math.max(totalCards, 1)) * 100);

  return (
    <div className="deck-shell">
      <div className="deck-progress" aria-label={`Card ${displayPosition} of ${totalCards}`}>
        <span className="deck-progress-label">
          Card {displayPosition} of {totalCards}
        </span>
        <div className="deck-progress-bar" role="progressbar" aria-valuenow={displayPosition} aria-valuemin={1} aria-valuemax={totalCards}>
          <div className="deck-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="deck-card-area">
        {atGate ? (
          <div className="deck-gate">
            <div className="deck-gate-head">
              <Sparkles size={16} aria-hidden="true" />
              <strong>Want the full deck?</strong>
            </div>
            <p>{proPackHook}</p>
            <PromoEmailForm source={proPackSource} ctaLabel="Join the Pro Pack waitlist" />
          </div>
        ) : (
          children(currentIndex)
        )}
      </div>

      <div className="deck-nav">
        <button
          type="button"
          className="btn"
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
          aria-label="Previous card"
        >
          <ArrowLeft size={16} /> Prev
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => setCurrentIndex((i) => Math.min(i + 1, totalCards - 1))}
          disabled={currentIndex >= totalCards - 1}
          aria-label="Next card"
        >
          Next <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
