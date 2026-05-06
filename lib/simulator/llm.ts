// Provider-agnostic LLM facade for the voice-mock simulator.
// Dispatches to either the Anthropic or OpenAI implementation
// based on the user's selection in the options screen.

import {
  callClaudeChat,
  callClaudeJson,
  forgetKey as forgetAnthropicKey,
  hasKey as hasAnthropicKey,
  loadKey as loadAnthropicKey,
  saveKey as saveAnthropicKey,
  type ChatMessage
} from "@/lib/simulator/anthropic";
import {
  callOpenAiChat,
  callOpenAiJson,
  forgetOpenAiKey,
  hasOpenAiKey,
  loadOpenAiKey,
  saveOpenAiKey
} from "@/lib/simulator/openai";

export type LlmProvider = "anthropic" | "openai";

export const LLM_PROVIDER_LABELS: Record<LlmProvider, string> = {
  anthropic: "Anthropic Claude",
  openai: "OpenAI ChatGPT"
};

export const LLM_KEY_PLACEHOLDER: Record<LlmProvider, string> = {
  anthropic: "sk-ant-…",
  openai: "sk-…"
};

export const LLM_KEY_HELP: Record<LlmProvider, string> = {
  anthropic: "Get one at console.anthropic.com → API keys",
  openai: "Get one at platform.openai.com → API keys"
};

export function loadKeyFor(provider: LlmProvider): string | null {
  return provider === "anthropic" ? loadAnthropicKey() : loadOpenAiKey();
}

export function saveKeyFor(provider: LlmProvider, key: string): void {
  if (provider === "anthropic") saveAnthropicKey(key);
  else saveOpenAiKey(key);
}

export function forgetKeyFor(provider: LlmProvider): void {
  if (provider === "anthropic") forgetAnthropicKey();
  else forgetOpenAiKey();
}

export function hasKeyFor(provider: LlmProvider): boolean {
  return provider === "anthropic" ? hasAnthropicKey() : hasOpenAiKey();
}

export async function callLlmJson<T>(args: {
  provider: LlmProvider;
  apiKey: string;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<T> {
  if (args.provider === "anthropic") {
    return callClaudeJson<T>({
      apiKey: args.apiKey,
      system: args.system,
      user: args.user,
      maxTokens: args.maxTokens
    });
  }
  return callOpenAiJson<T>({
    apiKey: args.apiKey,
    system: args.system,
    user: args.user,
    maxTokens: args.maxTokens
  });
}

export async function callLlmChat<T>(args: {
  provider: LlmProvider;
  apiKey: string;
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
}): Promise<T> {
  if (args.provider === "anthropic") {
    return callClaudeChat<T>({
      apiKey: args.apiKey,
      system: args.system,
      messages: args.messages,
      maxTokens: args.maxTokens
    });
  }
  return callOpenAiChat<T>({
    apiKey: args.apiKey,
    system: args.system,
    messages: args.messages,
    maxTokens: args.maxTokens
  });
}

export type { ChatMessage };
