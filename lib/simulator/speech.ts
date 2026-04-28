import { hasElevenKey, speakElevenLabs, stopElevenLabs } from "@/lib/simulator/elevenlabs";

type RecognitionLike = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onspeechstart?: (() => void) | null;
  onspeechend?: (() => void) | null;
};

export function isSpeechSupported() {
  if (typeof window === "undefined") return false;
  const w = window as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
    speechSynthesis?: unknown;
  };
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition) && !!w.speechSynthesis;
}

function speakBrowser(text: string, opts?: { onEnd?: () => void; rate?: number; pitch?: number }) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = opts?.rate ?? 1.0;
  utter.pitch = opts?.pitch ?? 1.05;
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => v.lang === "en-US" && /female|samantha|victoria|aria|jenny/i.test(v.name)) ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null;
  if (preferred) utter.voice = preferred;
  if (opts?.onEnd) utter.onend = opts.onEnd;
  window.speechSynthesis.speak(utter);
}

/**
 * Speak `text` aloud using the best available backend:
 *   1. ElevenLabs (lifelike) when an ElevenLabs key is present
 *   2. Browser SpeechSynthesis (robotic, free) as fallback
 * On ElevenLabs failure, silently falls back to browser TTS.
 */
export async function speak(text: string, opts?: { onEnd?: () => void }) {
  if (typeof window === "undefined") return;
  if (hasElevenKey()) {
    try {
      await speakElevenLabs(text, { onEnd: opts?.onEnd });
      return;
    } catch (error) {
      console.warn("ElevenLabs failed, falling back to browser TTS:", error);
    }
  }
  speakBrowser(text, opts);
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  stopElevenLabs();
}

export function createRecognition(): RecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => RecognitionLike;
    webkitSpeechRecognition?: new () => RecognitionLike;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";
  return recognition;
}

export function isLifelikeVoiceAvailable(): boolean {
  return hasElevenKey();
}
