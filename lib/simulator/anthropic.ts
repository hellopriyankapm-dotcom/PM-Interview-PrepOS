import Anthropic from "@anthropic-ai/sdk";

const STORAGE_KEY = "prepos-anthropic-key";

export function loadKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveKey(key: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // ignore
  }
}

export function forgetKey() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasKey(): boolean {
  const key = loadKey();
  return !!key && key.startsWith("sk-ant-") && key.length > 20;
}

function client(key: string) {
  return new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

function parseJson<T>(raw: string): T {
  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
  // Tolerant: grab the first {...} block if Claude wrapped it in prose
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned) as T;
}

export async function callClaudeJson<T>(args: {
  apiKey: string;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<T> {
  const response = await client(args.apiKey).messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: args.maxTokens ?? 800,
    system: args.system,
    messages: [{ role: "user", content: args.user }]
  });

  const block = response.content.find((entry) => entry.type === "text");
  const raw = block && block.type === "text" ? block.text : "";
  return parseJson<T>(raw);
}

export async function callClaudeChat<T>(args: {
  apiKey: string;
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
}): Promise<T> {
  const response = await client(args.apiKey).messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: args.maxTokens ?? 400,
    system: args.system,
    messages: args.messages.map((m) => ({ role: m.role, content: m.content }))
  });
  const block = response.content.find((entry) => entry.type === "text");
  const raw = block && block.type === "text" ? block.text : "";
  return parseJson<T>(raw);
}
