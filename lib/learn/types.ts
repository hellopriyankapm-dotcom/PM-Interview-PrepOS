export type Tier = "free" | "pro";

export type Term = {
  id: string;
  term: string;
  definition: string;
  pm_angle: string;
  example: string;
  related: string[];
  tier: Tier;
};

export type ScenarioChoice = {
  key: string;
  label: string;
};

export type Scenario = {
  id: string;
  setup: string;
  choices: ScenarioChoice[];
  best: string;
  reasoning: string;
  rubric_signals: string[];
  tier: Tier;
};
