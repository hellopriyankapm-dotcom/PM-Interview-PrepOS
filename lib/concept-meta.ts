// Per-concept SEO copy. Each entry adds a one-line definition and a
// "why it matters" snippet so each /concepts/<slug> page has unique
// indexable content beyond what's already in concepts.json.

export type ConceptMeta = {
  definition: string;
  whyItMatters: string;
};

export const conceptMeta: Record<string, ConceptMeta> = {
  "product_sense.user_segmentation": {
    definition:
      "User segmentation is the practice of splitting your potential users into distinct groups by need, context, or behaviour, then choosing one to build for first.",
    whyItMatters:
      "Interviewers test segmentation because PMs who can't pick a wedge end up shipping for everyone — which means shipping for no one. A defendable wedge is the highest-leverage decision in a product-sense round."
  },
  "product_sense.pain_point_prioritization": {
    definition:
      "Pain-point prioritisation is the discipline of ranking user problems by frequency, severity, and your unfair right to solve them.",
    whyItMatters:
      "Strong PMs do not optimise for the most-mentioned pain — they optimise for the highest-leverage one. Interviewers want to see a ranked, defendable shortlist, not a brainstorm."
  },
  "product_sense.success_metrics": {
    definition:
      "Success metrics are the specific quantitative signals that prove your product is working for the user you chose.",
    whyItMatters:
      "Generic 'engagement' answers fail. Strong success metrics name the user behaviour, the time horizon, and the trade-off — and they tie back to the wedge you picked earlier in the round."
  },
  "execution.north_star_metrics": {
    definition:
      "A north-star metric is the single number that captures sustained, paid-for value delivered to the user.",
    whyItMatters:
      "A bad north-star metric is gameable, lagging, or confused with revenue. Interviewers test whether you can define one that is leading, defensible, and aligned with long-term retention."
  },
  "execution.input_output_metrics": {
    definition:
      "Input metrics are the levers you can push directly. Output metrics are the lagging signals those levers move. A metric tree connects them.",
    whyItMatters:
      "Senior PMs decompose goals into a tree: north-star → outputs → inputs → experiments. Interviewers want to see the tree, not a single number."
  },
  "execution.counter_metrics": {
    definition:
      "Counter-metrics are the guardrails — what you check to ensure your launch isn't winning the headline number while breaking trust, latency, or cost.",
    whyItMatters:
      "Senior interviewers are explicitly listening for counter-metrics. Without them, your launch plan reads as naïve."
  },
  "ai_product_judgment.eval_design": {
    definition:
      "AI eval design is the methodology for measuring whether an LLM-backed feature is working — golden sets, regression checks, online proxy metrics, and human review.",
    whyItMatters:
      "Eval design separates AI PMs from PMs who 'use AI'. Interviewers test whether you can describe a real evaluation pipeline, not just say 'we'd benchmark it'."
  },
  "ai_product_judgment.hallucination_mitigation": {
    definition:
      "Hallucination mitigation is the set of techniques (retrieval grounding, structured outputs, confidence thresholds, citation requirements) that reduce the rate at which an LLM invents incorrect information.",
    whyItMatters:
      "Trust is the moat for AI features. Interviewers test whether you understand that hallucination is a product problem, not just a model problem."
  },
  "ai_product_judgment.human_fallback_design": {
    definition:
      "Human-fallback design is the explicit handoff when the model is uncertain — escalation to a human agent, a confidence-gated safe response, or a 'we don't know' state.",
    whyItMatters:
      "Strong AI PMs always have a fallback path. Interviewers reject candidates who treat the LLM as the only system in the loop."
  },
  "ai_product_judgment.cost_latency_tradeoffs": {
    definition:
      "Cost-and-latency trade-offs are the choices between model size, prompt length, caching, fine-tuning, and routing that determine the per-request cost and response time of an AI feature.",
    whyItMatters:
      "AI features that work in the prototype break in production when the math meets real traffic. Interviewers test whether you've thought about token cost, p95 latency, and tier routing."
  },
  "behavioral.star_arc_structure": {
    definition:
      "STAR (Situation, Task, Action, Result) and SCAR (Situation, Conflict, Action, Resolution) are story scaffolds that keep behavioral answers tight, specific, and outcome-anchored.",
    whyItMatters:
      "Without structure, behavioral answers ramble. With it, you free up the interviewer's attention for the parts that matter — your judgment and your impact."
  },
  "behavioral.conflict_handling": {
    definition:
      "Conflict-handling is how you describe a real disagreement with stakeholders — not the absence of conflict, and not a story where you 'won'.",
    whyItMatters:
      "Interviewers explicitly want the hard part. A behavioral story with no real conflict reads as either fake or low-stakes."
  },
  "behavioral.measurable_impact": {
    definition:
      "Measurable impact is the quantifiable outcome you tie to your action — revenue, retention, latency, hours saved, customers unblocked.",
    whyItMatters:
      "Without a number, the interviewer cannot calibrate the scope of your work. Specific impact (even if approximate) is what differentiates a Senior story from a PM story."
  },
  "strategy.market_timing": {
    definition:
      "Market timing is the argument for why this product, this segment, this moment — what enabling change (technology, regulation, behaviour, cost curve) opens the window now.",
    whyItMatters:
      "Strategy without timing is a wishlist. Interviewers test whether you can name the specific shift that makes your bet rational."
  },
  "strategy.durable_advantage": {
    definition:
      "Durable advantage is the moat — the structural reason competitors will struggle to copy you a year after you launch.",
    whyItMatters:
      "Without a moat, the strategy is just a feature plan. Interviewers test whether you can name a defendable advantage (network, data, integration, brand, switching cost)."
  },
  "technical_collaboration.api_contracts": {
    definition:
      "An API contract is the explicit agreement between two systems on what data flows, what errors mean, and what's stable vs experimental.",
    whyItMatters:
      "PM-T candidates must read and critique a contract without pretending to write it. Interviewers test whether you can spot the missing error case or the breaking change."
  },
  "technical_collaboration.reliability_tradeoffs": {
    definition:
      "Reliability trade-offs are the explicit calls between feature velocity, error budgets, and the cost of uptime — including when to slow shipping to clear tech debt.",
    whyItMatters:
      "Strong PM-Ts know when to push back on a launch. Weak ones treat reliability as engineering's problem alone."
  },
  "technical_collaboration.engineering_alignment": {
    definition:
      "Engineering alignment is communicating product decisions in language engineers can act on — explicit success criteria, scope boundaries, and the parts you're leaving open.",
    whyItMatters:
      "PMs who can't align with engineering ship slowly and lose trust. Interviewers test whether you can write a brief an engineer would commit to."
  }
};
