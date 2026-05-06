import type { TargetLevel } from "@/lib/types";

export type LevelMeta = {
  shortName: string;
  fullName: string;
  tagline: string;
  whatChanges: string[];
  practiceFocus: string[];
};

export const levelMeta: Record<TargetLevel, LevelMeta> = {
  apm: {
    shortName: "APM",
    fullName: "Associate / entry-level Product Manager",
    tagline: "Earn your seat. Show structure, curiosity, and coachability under time pressure.",
    whatChanges: [
      "Bar is structure + clarity, not depth of judgment yet",
      "Interviewers expect you to ask good clarifying questions",
      "Behavioral stories carry more weight relative to scope"
    ],
    practiceFocus: [
      "Product-sense framing — pick a user, pick a pain, pick a metric",
      "Clean trade-off articulation — what you'd not do",
      "STAR-structured behavioral stories from school, internships, or first job"
    ]
  },
  pm: {
    shortName: "PM",
    fullName: "Product Manager (IC4)",
    tagline: "Show independent judgment and clean trade-offs you can defend.",
    whatChanges: [
      "Bar is independent decisions, not just a structured framework",
      "Metrics depth matters: input/output, leading/lagging, counter-metrics",
      "Conflict stories should show stakeholder navigation"
    ],
    practiceFocus: [
      "Defending a trade-off without hedging",
      "Building a metric tree from a fuzzy goal",
      "Behavioral stories with measurable, owned impact"
    ]
  },
  senior: {
    shortName: "Senior PM",
    fullName: "Senior Product Manager (IC5)",
    tagline: "Handle ambiguity. Influence stakeholders. Move metrics that matter.",
    whatChanges: [
      "Ambiguous prompts with no clear right answer",
      "Cross-functional influence (legal, design, eng leadership)",
      "Strategy questions creep into product-sense rounds"
    ],
    practiceFocus: [
      "Ambiguity tolerance — explicitly stating assumptions",
      "Pre-empting stakeholder objections",
      "Multi-quarter prioritisation, not single-feature roadmaps"
    ]
  },
  staff: {
    shortName: "Staff PM",
    fullName: "Staff or Group Product Manager",
    tagline: "Make org-level trade-offs and communicate them at the executive level.",
    whatChanges: [
      "Decisions span multiple PMs and multi-quarter horizons",
      "Strategy weight increases — durable advantage, market timing",
      "Behavioral round becomes about leadership, not personal execution"
    ],
    practiceFocus: [
      "Org-level trade-offs — staffing, scope, sequencing",
      "Strategy with a defendable point of view",
      "Coaching-and-leading behavioral stories"
    ]
  },
  "ai-pm": {
    shortName: "AI PM",
    fullName: "AI Product Manager",
    tagline: "PM fundamentals plus evals, model limits, trust, privacy, cost, and fallback design.",
    whatChanges: [
      "Adds the AI product judgment round on top of PM fundamentals",
      "Eval design replaces vague AI hand-waving",
      "Cost and latency trade-offs become first-class concerns"
    ],
    practiceFocus: [
      "Designing eval sets and regression checks for LLM features",
      "Hallucination mitigation and human-fallback paths",
      "Token-cost / latency / quality trade-off articulation"
    ]
  },
  "pm-t": {
    shortName: "PM-T",
    fullName: "Technical Product Manager (PM-T)",
    tagline: "Product judgment plus APIs, data flow, reliability, and engineering trade-offs.",
    whatChanges: [
      "Technical-collaboration round carries more weight",
      "Reliability vs feature-velocity trade-offs are tested directly",
      "API contract design and data-flow questions appear"
    ],
    practiceFocus: [
      "Reading and critiquing API contracts",
      "Reliability budgets and incident-response thinking",
      "Communicating trade-offs in engineer-friendly language"
    ]
  }
};
