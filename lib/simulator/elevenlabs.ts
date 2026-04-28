const STORAGE_KEY = "prepos-elevenlabs-key";

// Sarah voice — Rachel (warm, professional female). Public voice ID from
// the ElevenLabs default library; the candidate can override later.
export const SARAH_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export function loadElevenKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveElevenKey(key: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // ignore
  }
}

export function forgetElevenKey() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasElevenKey(): boolean {
  const key = loadElevenKey();
  return !!key && key.length > 20;
}

let activeAudio: HTMLAudioElement | null = null;
let activeUrl: string | null = null;

export function stopElevenLabs() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {
      // ignore
    }
    activeAudio = null;
  }
  if (activeUrl) {
    try {
      URL.revokeObjectURL(activeUrl);
    } catch {
      // ignore
    }
    activeUrl = null;
  }
}

export async function speakElevenLabs(
  text: string,
  opts?: { onEnd?: () => void; voiceId?: string }
): Promise<void> {
  const apiKey = loadElevenKey();
  if (!apiKey) throw new Error("No ElevenLabs key");

  stopElevenLabs();

  const voiceId = opts?.voiceId ?? SARAH_VOICE_ID;
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.78,
          style: 0.35,
          use_speaker_boost: true
        }
      })
    }
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`ElevenLabs ${response.status}: ${detail.slice(0, 160)}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  activeUrl = url;
  const audio = new Audio(url);
  activeAudio = audio;
  audio.onended = () => {
    if (activeUrl === url) {
      URL.revokeObjectURL(url);
      activeUrl = null;
    }
    if (activeAudio === audio) activeAudio = null;
    opts?.onEnd?.();
  };
  audio.onerror = () => {
    if (activeUrl === url) {
      URL.revokeObjectURL(url);
      activeUrl = null;
    }
    if (activeAudio === audio) activeAudio = null;
    opts?.onEnd?.();
  };
  await audio.play();
}
