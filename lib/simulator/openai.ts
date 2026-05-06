// OpenAI ChatGPT provider for the voice-mock simulator.
// Mirrors the lib/simulator/anthropic.ts interface so the Simulator
// can swap providers without changing call shapes. Uses plain fetch
// so we don't pull in the OpenAI SDK — the public chat-completions
// endpoint is stable and the request shape is a few lines of JSON.

const STORAGE_KEY = "prepos-openai-key";
const DEFAULT_MODEL = "gpt-4o-mini";

export function loadOpenAiKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveOpenAiKey(key: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // ignore
  }
}

export function forgetOpenAiKey() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasOpenAiKey(): boolean {
  const key = loadOpenAiKey();
  return !!key && key.startsWith("sk-") && key.length > 20;
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

function parseJson<T>(raw: string): T {
  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned) as T;
}

async function postChatCompletion(args: {
  apiKey: string;
  system: string;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  maxTokens?: number;
  jsonMode?: boolean;
}): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${args.apiKey}`
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: args.maxTokens ?? 800,
      messages: [
        { role: "system", content: args.system },
        ...args.messages
      ],
      response_format: args.jsonMode ? { type: "json_object" } : undefined
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI ${response.status}: ${text.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}

export async function callOpenAiJson<T>(args: {
  apiKey: string;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<T> {
  const raw = await postChatCompletion({
    apiKey: args.apiKey,
    system: args.system,
    messages: [{ role: "user", content: args.user }],
    maxTokens: args.maxTokens ?? 800,
    jsonMode: true
  });
  return parseJson<T>(raw);
}

export async function callOpenAiChat<T>(args: {
  apiKey: string;
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
}): Promise<T> {
  const raw = await postChatCompletion({
    apiKey: args.apiKey,
    system: args.system,
    messages: args.messages,
    maxTokens: args.maxTokens ?? 400,
    jsonMode: true
  });
  return parseJson<T>(raw);
}
