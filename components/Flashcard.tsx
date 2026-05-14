"use client";

import { useState, type KeyboardEvent } from "react";

type Props = {
  front: React.ReactNode;
  back: React.ReactNode;
  flipped?: boolean;
  onFlip?: (flipped: boolean) => void;
};

export function Flashcard({ front, back, flipped, onFlip }: Props) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isControlled = flipped !== undefined;
  const isFlipped = isControlled ? (flipped as boolean) : internalFlipped;

  function toggle() {
    const next = !isFlipped;
    if (onFlip) onFlip(next);
    if (!isControlled) setInternalFlipped(next);
  }

  function handleKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  }

  return (
    <div
      className="flashcard"
      data-flipped={isFlipped}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={isFlipped ? "Show front of card" : "Show back of card"}
      onClick={toggle}
      onKeyDown={handleKey}
    >
      <div className="flashcard-inner">
        <div className="flashcard-face flashcard-face-front" aria-hidden={isFlipped}>
          {front}
        </div>
        <div className="flashcard-face flashcard-face-back" aria-hidden={!isFlipped}>
          {back}
        </div>
      </div>
    </div>
  );
}
