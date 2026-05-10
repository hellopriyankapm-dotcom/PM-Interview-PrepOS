// Shared calibration defaults extracted from PrepOSApp so the new
// CalibrationWizard can reuse them without circular imports.

import type { Calibration, TargetLevel } from "@/lib/types";

export const LEVEL_EXPERIENCE_DEFAULTS: Record<TargetLevel, string> = {
  apm: "Recent grad or first PM role. 0–1 years of product experience.",
  pm: "PM with 3–5 years of product experience.",
  senior: "Senior PM with 5–8 years owning a feature area end-to-end.",
  staff: "Staff or Group PM with 8+ years leading multiple PMs.",
  "ai-pm": "AI PM with 3–5 years of PM experience and hands-on LLM work.",
  "pm-t": "Technical PM with 3–5 years, fluent with APIs and engineering trade-offs."
};

// Old hand-typed defaults from earlier versions — treat these as still the
// default so switching levels swaps them in for the level-appropriate one.
export const LEGACY_DEFAULT_EXPERIENCES = ["PM with 3-5 years of product experience"];

export const KNOWN_DEFAULT_EXPERIENCES = new Set<string>([
  ...Object.values(LEVEL_EXPERIENCE_DEFAULTS),
  ...LEGACY_DEFAULT_EXPERIENCES
]);

export const INITIAL_CALIBRATION: Calibration = {
  targetLevel: "apm",
  practiceCategory: "all",
  companyStyle: "General PM loop",
  interviewDate: "",
  weeklyHours: 8,
  experience: LEVEL_EXPERIENCE_DEFAULTS.apm,
  weakConcepts: []
};

// Single source of truth for the Company style dropdown — used by both
// the wizard and the calibration sidebar in PrepOSApp.
export const COMPANY_STYLE_OPTIONS = [
  "General PM loop",
  "AI lab style",
  "Large tech style",
  "Infra / API-first",
  "Consumer / marketplace",
  "Enterprise SaaS",
  "Startup style"
] as const;

export type QuickStartPreset = {
  label: string;
  hint: string;
  calibration: Pick<Calibration, "targetLevel" | "practiceCategory" | "companyStyle" | "experience">;
};

export const QUICK_START_PRESETS: QuickStartPreset[] = [
  {
    label: "New grad APM",
    hint: "First PM role / 0–1 yrs",
    calibration: {
      targetLevel: "apm",
      practiceCategory: "all",
      companyStyle: "General PM loop",
      experience: LEVEL_EXPERIENCE_DEFAULTS.apm
    }
  },
  {
    label: "Senior PM at FAANG",
    hint: "5–8 yrs · large tech",
    calibration: {
      targetLevel: "senior",
      practiceCategory: "all",
      companyStyle: "Large tech style",
      experience: LEVEL_EXPERIENCE_DEFAULTS.senior
    }
  },
  {
    label: "AI PM at Anthropic",
    hint: "AI lab",
    calibration: {
      targetLevel: "ai-pm",
      practiceCategory: "all",
      companyStyle: "AI lab style",
      experience: LEVEL_EXPERIENCE_DEFAULTS["ai-pm"]
    }
  },
  {
    label: "PM-T at Stripe",
    hint: "Infra / API-first",
    calibration: {
      targetLevel: "pm-t",
      practiceCategory: "all",
      companyStyle: "Infra / API-first",
      experience: LEVEL_EXPERIENCE_DEFAULTS["pm-t"]
    }
  }
];
