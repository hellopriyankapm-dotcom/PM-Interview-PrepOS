const key = (deck: string) => `prepos-learn-${deck}-v1`;

export type DeckProgress = { lastSeenIndex: number };

export function loadDeckProgress(deck: string): DeckProgress {
  if (typeof window === "undefined") return { lastSeenIndex: 0 };
  try {
    const raw = window.localStorage.getItem(key(deck));
    if (!raw) return { lastSeenIndex: 0 };
    const parsed = JSON.parse(raw) as Partial<DeckProgress>;
    return {
      lastSeenIndex:
        typeof parsed.lastSeenIndex === "number" && parsed.lastSeenIndex >= 0
          ? parsed.lastSeenIndex
          : 0
    };
  } catch {
    return { lastSeenIndex: 0 };
  }
}

export function saveDeckProgress(deck: string, progress: DeckProgress) {
  try {
    window.localStorage.setItem(key(deck), JSON.stringify(progress));
  } catch {
    // ignore
  }
}
