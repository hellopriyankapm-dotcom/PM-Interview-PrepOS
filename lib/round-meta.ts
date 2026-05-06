import type { RoundType } from "@/lib/types";

export type RoundMeta = {
  name: string;
  shortLabel: string;
  tagline: string;
  whatItTests: string[];
  signalsInterviewersLookFor: string[];
  commonMistakes: string[];
};

export const roundMeta: Record<RoundType, RoundMeta> = {
  product_sense: {
    name: "Product sense",
    shortLabel: "Product sense",
    tagline: "Show you can pick the right user, the right pain, and the right wedge — fast.",
    whatItTests: [
      "User segmentation: who you'd build for first and why",
      "Pain-point prioritisation: which job-to-be-done is hottest",
      "Success metrics: how you'd know it worked"
    ],
    signalsInterviewersLookFor: [
      "Concrete user picture, not generic personas",
      "A defended trade-off — what you'd intentionally not do",
      "Honest uncertainty about your riskiest assumption"
    ],
    commonMistakes: [
      "Listing every feature instead of picking a wedge",
      "Skipping the user and jumping straight to solutions",
      "Vague metrics like 'engagement' without specifying inputs vs outputs"
    ]
  },
  execution: {
    name: "Execution",
    shortLabel: "Execution",
    tagline: "Translate the goal into a metric tree and a defensible launch plan.",
    whatItTests: [
      "North-star metric definition and decomposition",
      "Input vs output metrics — which lever you'd pull",
      "Counter-metrics that protect users and trust"
    ],
    signalsInterviewersLookFor: [
      "A clean metric tree, not a single vanity number",
      "Trade-off awareness — what could regress",
      "Data-informed decisions, not data-driven theatre"
    ],
    commonMistakes: [
      "Picking a north-star metric that's easy to game",
      "Forgetting counter-metrics entirely",
      "Treating retention and activation as interchangeable"
    ]
  },
  ai_product_judgment: {
    name: "AI product judgment",
    shortLabel: "AI judgment",
    tagline: "Show you can evaluate, ship, and govern an LLM-backed feature without breaking trust.",
    whatItTests: [
      "AI eval design — golden sets, regression checks, online metrics",
      "Hallucination mitigation and confidence calibration",
      "Cost-and-latency trade-offs at production scale",
      "Human fallback design when the model fails"
    ],
    signalsInterviewersLookFor: [
      "Concrete eval methodology, not vibes",
      "Awareness of failure modes (hallucination, prompt injection, data leakage)",
      "A real plan for cost: tokens, caching, model tiering"
    ],
    commonMistakes: [
      "Treating an LLM as a black-box solution",
      "Skipping the eval question entirely",
      "Ignoring cost trade-offs until production"
    ]
  },
  behavioral: {
    name: "Behavioral",
    shortLabel: "Behavioral",
    tagline: "Tell true stories with structure, conflict, and measurable impact.",
    whatItTests: [
      "STAR / SCAR story structure",
      "Conflict-handling under stakeholder pressure",
      "Measurable, business-meaningful impact"
    ],
    signalsInterviewersLookFor: [
      "Specific situation, not a general pattern",
      "Your personal action, not the team's",
      "A number — revenue, latency, retention, hours saved"
    ],
    commonMistakes: [
      "Drifting into 'we' instead of 'I'",
      "Skipping the conflict — interviews want the hard part",
      "Vague impact like 'shipped successfully' with no metric"
    ]
  },
  strategy: {
    name: "Strategy",
    shortLabel: "Strategy",
    tagline: "Defend a multi-quarter call with market timing and a durable advantage.",
    whatItTests: [
      "Market timing — why now, why this segment",
      "Durable advantage — what makes the moat hold",
      "Org-level trade-offs and second-order effects"
    ],
    signalsInterviewersLookFor: [
      "A defendable point of view, not 'it depends'",
      "Awareness of who you're competing against",
      "Honest discussion of what could break the bet"
    ],
    commonMistakes: [
      "Hedging every claim — 'depends on the data'",
      "Confusing tactics (a feature) with strategy (a position)",
      "Ignoring the competitive response to your move"
    ]
  },
  technical_collaboration: {
    name: "Technical collaboration",
    shortLabel: "Technical",
    tagline: "Make engineering trade-offs without pretending to be an engineer.",
    whatItTests: [
      "API contract design and integration concerns",
      "Reliability vs feature velocity trade-offs",
      "Engineering alignment — picking the right level of detail"
    ],
    signalsInterviewersLookFor: [
      "You can read a system diagram and ask the right questions",
      "You know when to push back on tech debt vs ship",
      "You explain trade-offs in eng-friendly language"
    ],
    commonMistakes: [
      "Pretending to be the architect",
      "Punting on every reliability question",
      "Not knowing the difference between a 4xx and 5xx"
    ]
  }
};
