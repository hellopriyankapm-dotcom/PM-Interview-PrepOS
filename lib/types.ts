export type TargetLevel = "apm" | "pm" | "senior" | "staff" | "ai-pm" | "pm-t";

export type RoundType =
  | "product_sense"
  | "execution"
  | "strategy"
  | "behavioral"
  | "ai_product_judgment"
  | "technical_collaboration";

export type ScaffoldingMode =
  | "teach"
  | "guided_practice"
  | "light_feedback"
  | "interview_mode"
  | "maintenance";

export type ExplanationDepth = "high" | "medium" | "low" | "none";

export type ConceptState = {
  conceptId: string;
  label: string;
  roundType: RoundType;
  state: ScaffoldingMode;
  recentScores: number[];
  confidence: "low" | "medium" | "high";
  explanationDepth: ExplanationDepth;
};

export type Question = {
  id: string;
  title: string;
  prompt: string;
  roundType: RoundType;
  targetLevels: TargetLevel[];
  concepts: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  sourceType: "original" | "synthetic" | "official" | "public" | "public_video" | "community";
  sourceUrl: string | null;
  companyClaim: string | null;
  reviewer: string;
};

export type Calibration = {
  targetLevel: TargetLevel;
  companyStyle: string;
  interviewDate: string;
  weeklyHours: number;
  experience: string;
  selfReportedWeakness: string;
};

export type ScoreBreakdown = {
  structure: number;
  userInsight: number;
  metrics: number;
  tradeoffs: number;
  communication: number;
  targetLevelDepth: number;
};

export type Evaluation = {
  total: number;
  breakdown: ScoreBreakdown;
  strengths: string[];
  improvements: string[];
  nextAction: string;
  updatedConcepts: ConceptState[];
};

export type PracticePlanItem = {
  question: Question;
  mode: ScaffoldingMode;
  explanationDepth: ExplanationDepth;
  reason: string;
  priority: number;
};
