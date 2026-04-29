import { SARAH_PORTRAIT_PUBLIC_URL } from "@/lib/simulator/assets";
import { loadElevenKey, SARAH_VOICE_ID } from "@/lib/simulator/elevenlabs";

const KEY_STORAGE = "prepos-did-key";
const PORTRAIT_STORAGE = "prepos-did-portrait";
const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 60000;

export const DEFAULT_SARAH_PORTRAIT = SARAH_PORTRAIT_PUBLIC_URL;

export function loadDidKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY_STORAGE);
  } catch {
    return null;
  }
}

export function saveDidKey(key: string) {
  try {
    window.localStorage.setItem(KEY_STORAGE, key);
  } catch {
    // ignore
  }
}

export function forgetDidKey() {
  try {
    window.localStorage.removeItem(KEY_STORAGE);
  } catch {
    // ignore
  }
}

/**
 * Returns the portrait URL D-ID should animate. Falls back to the
 * hard-coded Sarah portrait baked into the repo so candidates can use the
 * real-video mode with just a D-ID API key — no portrait URL hunt required.
 */
export function loadDidPortrait(): string | null {
  if (typeof window === "undefined") return DEFAULT_SARAH_PORTRAIT;
  try {
    return window.localStorage.getItem(PORTRAIT_STORAGE) || DEFAULT_SARAH_PORTRAIT;
  } catch {
    return DEFAULT_SARAH_PORTRAIT;
  }
}

export function loadDidPortraitOverride(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(PORTRAIT_STORAGE);
  } catch {
    return null;
  }
}

export function saveDidPortrait(url: string) {
  try {
    window.localStorage.setItem(PORTRAIT_STORAGE, url);
  } catch {
    // ignore
  }
}

export function forgetDidPortrait() {
  try {
    window.localStorage.removeItem(PORTRAIT_STORAGE);
  } catch {
    // ignore
  }
}

/**
 * Real-video mode is on whenever the candidate has a D-ID API key. The
 * portrait defaults to the bundled Sarah image, so a portrait override is
 * optional.
 */
export function hasDid(): boolean {
  const key = loadDidKey();
  const portrait = loadDidPortrait();
  return !!key && key.length > 10 && !!portrait && portrait.startsWith("https://");
}

function authHeader(apiKey: string) {
  // D-ID's API key format embeds the username:password separator directly:
  // newer keys look like "<base64email>:<secret>". Older or test keys may
  // be a single secret without ":", in which case we append it so the
  // resulting Basic auth header is valid (username = key, empty password).
  const value = apiKey.includes(":") ? apiKey : `${apiKey}:`;
  const encoded =
    typeof window === "undefined" ? Buffer.from(value).toString("base64") : btoa(value);
  return `Basic ${encoded}`;
}

type CreateTalkResponse = { id: string; status: string };
type TalkStatus = {
  id: string;
  status: "created" | "started" | "done" | "error" | "rejected";
  result_url?: string;
  error?: { description?: string; message?: string };
};

/**
 * Create a D-ID Talk. Returns the talk id.
 *
 * Provider selection:
 *   - If an ElevenLabs key is stored locally we ask D-ID to call ElevenLabs
 *     for TTS using the candidate's own quota (passed via x-api-key-external).
 *   - Otherwise we use D-ID's built-in Microsoft voice.
 *
 * We keep the request body minimal — D-ID rejects unknown / extra fields
 * with a 400 ValidationError on script.provider.
 */
async function createTalk(args: { apiKey: string; portraitUrl: string; text: string }): Promise<string> {
  const elevenKey = loadElevenKey();
  const provider = elevenKey
    ? { type: "elevenlabs", voice_id: SARAH_VOICE_ID }
    : { type: "microsoft", voice_id: "en-US-JennyNeural" };

  const body = {
    source_url: args.portraitUrl,
    script: {
      type: "text",
      input: args.text,
      provider
    }
  };

  const headers: Record<string, string> = {
    Authorization: authHeader(args.apiKey),
    "Content-Type": "application/json"
  };
  if (elevenKey) {
    headers["x-api-key-external"] = JSON.stringify({ elevenlabs: elevenKey });
  }

  const response = await fetch("https://api.d-id.com/talks", {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`D-ID create ${response.status}: ${detail.slice(0, 240)}`);
  }
  const data = (await response.json()) as CreateTalkResponse;
  return data.id;
}

async function getTalk(args: { apiKey: string; talkId: string }): Promise<TalkStatus> {
  const response = await fetch(`https://api.d-id.com/talks/${encodeURIComponent(args.talkId)}`, {
    headers: { Authorization: authHeader(args.apiKey) }
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`D-ID get ${response.status}: ${detail.slice(0, 200)}`);
  }
  return (await response.json()) as TalkStatus;
}

/**
 * Generate a Talk video for the given text. Resolves with the result mp4 URL.
 * Polls every 1.5s up to 60s. Throws on error/rejected/timeout.
 */
export async function generateTalkVideo(args: {
  apiKey: string;
  portraitUrl: string;
  text: string;
}): Promise<string> {
  const talkId = await createTalk(args);
  const startedAt = Date.now();
  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    const status = await getTalk({ apiKey: args.apiKey, talkId });
    if (status.status === "done" && status.result_url) {
      return status.result_url;
    }
    if (status.status === "error" || status.status === "rejected") {
      throw new Error(
        `D-ID generation ${status.status}: ${status.error?.description ?? status.error?.message ?? "unknown"}`
      );
    }
  }
  throw new Error("D-ID generation timed out");
}
