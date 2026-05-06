// Persisted user choices for the voice-mock simulator's options screen.
// Stored locally so returning users don't have to re-pick every time.

import type { LlmProvider } from "@/lib/simulator/llm";

const PROVIDER_KEY = "prepos-sim-llm-provider";
const WANT_VOICE_KEY = "prepos-sim-want-voice";
const WANT_VIDEO_KEY = "prepos-sim-want-video";
const COMPLETED_KEY = "prepos-sim-options-completed-v1";

export type SimPrefs = {
  provider: LlmProvider;
  wantVoice: boolean;
  wantVideo: boolean;
  optionsCompleted: boolean;
};

export const DEFAULT_PREFS: SimPrefs = {
  provider: "anthropic",
  wantVoice: false,
  wantVideo: false,
  optionsCompleted: false
};

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function loadSimPrefs(): SimPrefs {
  const provider = (read(PROVIDER_KEY) as LlmProvider | null) ?? DEFAULT_PREFS.provider;
  return {
    provider: provider === "openai" || provider === "anthropic" ? provider : DEFAULT_PREFS.provider,
    wantVoice: read(WANT_VOICE_KEY) === "true",
    wantVideo: read(WANT_VIDEO_KEY) === "true",
    optionsCompleted: read(COMPLETED_KEY) === "true"
  };
}

export function saveSimPrefs(prefs: SimPrefs) {
  write(PROVIDER_KEY, prefs.provider);
  write(WANT_VOICE_KEY, prefs.wantVoice ? "true" : "false");
  write(WANT_VIDEO_KEY, prefs.wantVideo ? "true" : "false");
  if (prefs.optionsCompleted) write(COMPLETED_KEY, "true");
}

export function resetSimPrefsCompleted() {
  try {
    window.localStorage.removeItem(COMPLETED_KEY);
  } catch {
    // ignore
  }
}
