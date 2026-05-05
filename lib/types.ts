export type TargetLevel = "apm" | "pm" | "senior" | "staff" | "ai-pm" | "pm-t";

export type RoundType =
  | "product_sense"
  | "execution"
  | "strategy"
  | "behavioral"
  | "ai_product_judgment"
  | "technical_collaboration";

export type PracticeCategory =
  | "all"
  | "product_sense"
  | "execution_metrics"
  | "analytics_experimentation"
  | "strategy"
  | "behavioral_leadership"
  | "ai_product_judgment"
  | "technical_collaboration"
  | "estimation_prioritization";

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
  categories: PracticeCategory[];
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
  practiceCategory: PracticeCategory;
  companyStyle: string;
  interviewDate: string;
  weeklyHours: number;
  experience: string;
  weakConcepts: string[];
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

export type ResourceType = "video" | "article" | "framework" | "course";

export type Resource = {
  id: string;
  title: string;
  url: string;
  source: string;
  type: ResourceType;
  duration?: string;
  description?: string;
  appliesTo: {
    questionIds?: string[];
    concepts?: string[];
    categories?: PracticeCategory[];
  };
  reviewer: string;
  addedOn: string;
};
