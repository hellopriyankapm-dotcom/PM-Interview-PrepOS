import type { RoundType } from "@/lib/types";

export const ROUND_ORDER: RoundType[] = [
  "product_sense",
  "execution",
  "ai_product_judgment",
  "behavioral",
  "strategy",
  "technical_collaboration"
];

export const ROUND_LABEL: Record<RoundType, string> = {
  product_sense: "Product sense",
  execution: "Execution",
  ai_product_judgment: "AI judgment",
  behavioral: "Behavioral",
  strategy: "Strategy",
  technical_collaboration: "Technical"
};
