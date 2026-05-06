import questions from "@/content/questions/questions.json";

export type Faq = { q: string; a: string };

const QUESTION_COUNT = (questions as unknown[]).length;

export const faqs: Faq[] = [
  {
    q: "Is PrepOS free?",
    a: "Yes. PrepOS is free to use and runs in your browser. No account required."
  },
  {
    q: "What is a PM interview simulator?",
    a: "A PM interview simulator is a tool that gives you realistic product manager interview prompts on demand and helps you practice with feedback. PrepOS goes a step further: it picks the highest-impact next rep based on your target level, weakest concepts, and how close your interview is."
  },
  {
    q: "Which PM interview rounds does PrepOS cover?",
    a: "Six round types: product sense, execution, AI product judgment, behavioral, strategy, and technical collaboration. Each round is mapped to specific concepts so you can train weakest areas instead of grinding generic question banks."
  },
  {
    q: "How is PrepOS different from generic PM interview practice tools?",
    a: "Most tools are flat question dumps. PrepOS is adaptive — it tells you which rep moves your readiness next, calibrated to APM, PM, Senior, Staff, AI PM, or PM-T target levels. The rubric is open and visible, not a black-box score."
  },
  {
    q: "Does it score answers with AI?",
    a: "MVP1 uses a transparent keyword-and-structure rubric. LLM-based scoring is on the roadmap and will be opt-in."
  },
  {
    q: "How fresh is the question bank?",
    a: `The bank ships with ${QUESTION_COUNT} reviewed PM interview prompts and is updated weekly. Every prompt has a reviewer name, source type, and (if applicable) citation.`
  },
  {
    q: "Who is PrepOS for?",
    a: "Candidates targeting APM, PM, Senior, Staff, AI PM, or PM-T loops at product-led companies."
  },
  {
    q: "Does my data leave the browser?",
    a: "No. Your answers, scores, and progress live in your browser. PrepOS does not collect or transmit your answers — only aggregate page-view analytics."
  }
];
