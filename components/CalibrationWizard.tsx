"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { PromoEmailForm } from "@/components/PromoEmailForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  INITIAL_CALIBRATION,
  KNOWN_DEFAULT_EXPERIENCES,
  LEVEL_EXPERIENCE_DEFAULTS,
  QUICK_START_PRESETS,
  type QuickStartPreset
} from "@/lib/calibration-defaults";
import { conceptsByRound, levelProfiles, targetLevelOptions } from "@/lib/content";
import { ROUND_LABEL, ROUND_ORDER } from "@/lib/round-types";
import type { Calibration, RoundType } from "@/lib/types";

type Props = {
  initial?: Calibration;
  onComplete: (calibration: Calibration) => void;
};

export function CalibrationWizard({ initial, onComplete }: Props) {
  const [draft, setDraft] = useState<Calibration>(initial ?? INITIAL_CALIBRATION);

  function setLevel(next: Calibration["targetLevel"]) {
    setDraft((current) => {
      const isStillDefault = KNOWN_DEFAULT_EXPERIENCES.has(current.experience.trim());
      return {
        ...current,
        targetLevel: next,
        experience: isStillDefault ? LEVEL_EXPERIENCE_DEFAULTS[next] : current.experience
      };
    });
  }

  function applyPreset(preset: QuickStartPreset) {
    setDraft((current) => ({
      ...current,
      ...preset.calibration
    }));
  }

  function toggleWeakConcept(conceptId: string) {
    setDraft((current) => {
      const next = current.weakConcepts.includes(conceptId)
        ? current.weakConcepts.filter((id) => id !== conceptId)
        : [...current.weakConcepts, conceptId];
      return { ...current, weakConcepts: next };
    });
  }

  // AI PM short-circuit — Pro Pack pitch instead of fields they can't use
  if (draft.targetLevel === "ai-pm") {
    return (
      <div className="cal-wizard-shell">
        <header className="cal-wizard-topbar">
          <Logo size={28} withWordmark />
          <ThemeToggle />
        </header>
        <main className="cal-wizard-main">
          <section className="panel section ai-pm-panel" aria-label="AI PM Pro Pack">
            <span className="eyebrow">AI PM track · Pro Pack only</span>
            <h1>AI PM interview questions are coming in Pro Pack</h1>
            <p>
              AI PM interviews test a different bundle: eval design, hallucination mitigation,
              cost / latency trade-offs, and human-fallback design. PrepOS is curating a dedicated
              AI PM question bank with reviewer notes and expert answers — included in Pro Pack.
            </p>
            <PromoEmailForm
              source="prepos-ai-pm-gate"
              ctaLabel="Notify me about AI PM Pro Pack"
            />
            <div className="cal-wizard-actions">
              <button
                type="button"
                className="link-btn"
                onClick={() => setLevel("apm")}
              >
                ← Pick a different level instead
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="cal-wizard-shell">
      <header className="cal-wizard-topbar">
        <Logo size={28} withWordmark />
        <ThemeToggle />
      </header>
      <main className="cal-wizard-main">
        <section className="panel section cal-wizard">
          <span className="eyebrow">Calibrate · 30 seconds</span>
          <h1>Set up your PM interview prep</h1>
          <p className="cal-wizard-lede">
            This stays on your device — PrepOS never sees it. You can change anything later from
            the calibration sidebar.
          </p>

          <div className="cal-wizard-presets" role="group" aria-label="Quick start presets">
            <span className="cal-wizard-presets-label">
              <Sparkles size={14} aria-hidden="true" /> Quick start
            </span>
            {QUICK_START_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="cal-wizard-preset"
                onClick={() => applyPreset(preset)}
              >
                <strong>{preset.label}</strong>
                <span>{preset.hint}</span>
              </button>
            ))}
          </div>

          <fieldset className="cal-wizard-section">
            <legend>Which level are you interviewing for?</legend>
            <div className="cal-wizard-target-grid">
              {targetLevelOptions.map((opt) => {
                const selected = draft.targetLevel === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`cal-wizard-level-card ${selected ? "active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="cal-level"
                      value={opt.value}
                      checked={selected}
                      onChange={() => setLevel(opt.value)}
                    />
                    <span className="cal-wizard-level-card-body">
                      <strong>{opt.label}</strong>
                      <span className="cal-wizard-level-card-bar">
                        {levelProfiles[opt.value].bar}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="cal-wizard-section">
            <legend>When and where do you need help?</legend>

            <div className="field">
              <label htmlFor="cal-wizard-date">Interview date (optional)</label>
              <input
                id="cal-wizard-date"
                type="date"
                value={draft.interviewDate}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, interviewDate: event.target.value }))
                }
              />
              <p className="field-hint">
                Within 10 days, PrepOS shifts toward harder timed interview-mode reps.
              </p>
            </div>

            <div className="field">
              <div className="field-head">
                <label>Weakest areas (optional)</label>
                {draft.weakConcepts.length > 0 ? (
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() =>
                      setDraft((current) => ({ ...current, weakConcepts: [] }))
                    }
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <p className="field-hint">
                Tap any number — PrepOS will prioritise drills that hit these.
              </p>
              <div className="weakness-chips">
                {ROUND_ORDER.map((roundType: RoundType) => {
                  const group = conceptsByRound.get(roundType) ?? [];
                  if (group.length === 0) return null;
                  return (
                    <div className="weakness-group" key={roundType}>
                      <span className="weakness-group-label">{ROUND_LABEL[roundType]}</span>
                      <div className="weakness-group-chips">
                        {group.map((concept) => {
                          const selected = draft.weakConcepts.includes(concept.id);
                          return (
                            <button
                              key={concept.id}
                              type="button"
                              className={`mode-pill ${selected ? "active" : ""}`}
                              onClick={() => toggleWeakConcept(concept.id)}
                              aria-pressed={selected}
                            >
                              {concept.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </fieldset>

          <details className="cal-wizard-section cal-wizard-advanced">
            <summary>Advanced — company style, weekly hours, experience</summary>

            <div className="field">
              <label htmlFor="cal-wizard-company">Company style</label>
              <input
                id="cal-wizard-company"
                type="text"
                value={draft.companyStyle}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, companyStyle: event.target.value }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="cal-wizard-hours">
                Weekly practice time: {draft.weeklyHours} hrs
              </label>
              <input
                id="cal-wizard-hours"
                type="range"
                min={2}
                max={20}
                value={draft.weeklyHours}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    weeklyHours: Number(event.target.value)
                  }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="cal-wizard-experience">Experience snapshot</label>
              <textarea
                id="cal-wizard-experience"
                rows={3}
                value={draft.experience}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, experience: event.target.value }))
                }
              />
            </div>
          </details>

          <div className="cal-wizard-actions">
            <button
              type="button"
              className="btn-primary lg"
              onClick={() => onComplete(draft)}
            >
              Start practicing →
            </button>
            <button
              type="button"
              className="cal-wizard-skip"
              onClick={() => onComplete(INITIAL_CALIBRATION)}
            >
              Skip and use defaults
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
