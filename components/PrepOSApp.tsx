"use client";

import {
  Activity,
  ArrowDown,
  Brain,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Lightbulb,
  Maximize2,
  Mic,
  Minimize2,
  RefreshCw,
  Send,
  Sparkles,
  SlidersHorizontal,
  Target,
  Timer,
  TimerReset
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dashboard, type RepHistoryEntry } from "@/components/Dashboard";
import { LearningMemory } from "@/components/LearningMemory";
import { Logo } from "@/components/Logo";
import { PromoEmailForm } from "@/components/PromoEmailForm";
import { PromoSlot } from "@/components/PromoSlot";
import { Simulator } from "@/components/simulator/Simulator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { buildPracticeQueue, readiness } from "@/lib/adaptive/engine";
import { conceptsByRound, createInitialConceptStates, levelProfiles, targetLevelOptions } from "@/lib/content";
import { ROUND_LABEL, ROUND_ORDER } from "@/lib/round-types";
import { findResourcesForQuestion, type ResourceMatch } from "@/lib/resources";
import { coachCopy, explanationDepthForMode, updateConceptState } from "@/lib/scaffolding/scaffolding";
import { evaluateAnswer } from "@/lib/scoring/rubrics";
import type {
  Calibration,
  ConceptState,
  Evaluation,
  PracticePlanItem,
  ScaffoldingMode,
  TargetLevel
} from "@/lib/types";

const LEVEL_EXPERIENCE_DEFAULTS: Record<TargetLevel, string> = {
  apm: "Recent grad or first PM role. 0–1 years of product experience.",
  pm: "PM with 3–5 years of product experience.",
  senior: "Senior PM with 5–8 years owning a feature area end-to-end.",
  staff: "Staff or Group PM with 8+ years leading multiple PMs.",
  "ai-pm": "AI PM with 3–5 years of PM experience and hands-on LLM work.",
  "pm-t": "Technical PM with 3–5 years, fluent with APIs and engineering trade-offs."
};

// Old hand-typed defaults from earlier versions — treat these as still the
// default so switching levels swaps them in for the level-appropriate one.
const LEGACY_DEFAULT_EXPERIENCES = ["PM with 3-5 years of product experience"];

const KNOWN_DEFAULT_EXPERIENCES = new Set<string>([
  ...Object.values(LEVEL_EXPERIENCE_DEFAULTS),
  ...LEGACY_DEFAULT_EXPERIENCES
]);

const initialCalibration: Calibration = {
  targetLevel: "apm",
  practiceCategory: "all",
  companyStyle: "General PM loop",
  interviewDate: "",
  weeklyHours: 8,
  experience: LEVEL_EXPERIENCE_DEFAULTS.apm,
  weakConcepts: []
};

const practiceCategories: Array<{ value: Calibration["practiceCategory"]; label: string; detail: string }> = [
  { value: "all", label: "All categories", detail: "Let PrepOS choose the best next rep." },
  { value: "product_sense", label: "Product sense", detail: "Design or improve products around users." },
  { value: "execution_metrics", label: "Execution and metrics", detail: "Define success, diagnose funnels, choose trade-offs." },
  { value: "analytics_experimentation", label: "Analytics and experimentation", detail: "Reason with data, experiments, and guardrails." },
  { value: "strategy", label: "Strategy", detail: "Market, competition, sequencing, and durable advantage." },
  { value: "behavioral_leadership", label: "Behavioral and leadership", detail: "Stories, influence, conflict, and measurable impact." },
  { value: "ai_product_judgment", label: "AI product judgment", detail: "Evals, safety, trust, quality, cost, and fallback paths." },
  { value: "technical_collaboration", label: "Technical collaboration", detail: "APIs, architecture, reliability, and engineering alignment." },
  { value: "estimation_prioritization", label: "Estimation and prioritization", detail: "Sizing, constraints, prioritization, and launch sequencing." }
];

function prettyMode(mode: string) {
  if (mode === "teach") return "Coach";
  if (mode === "interview_mode") return "Interview practice";
  return mode
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default function PrepOSApp() {
  const [calibration, setCalibration] = useState<Calibration>(initialCalibration);
  const [concepts, setConcepts] = useState<ConceptState[]>(() => createInitialConceptStates());
  const [completedQuestionIds, setCompletedQuestionIds] = useState<string[]>([]);
  const [repHistory, setRepHistory] = useState<RepHistoryEntry[]>([]);
  const [queueExpanded, setQueueExpanded] = useState(false);
  const [modeOverride, setModeOverride] = useState<ScaffoldingMode | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [helpPanel, setHelpPanel] = useState<"none" | "resources" | "coach">("none");
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const queue = useMemo(
    () => buildPracticeQueue(calibration, concepts, completedQuestionIds, queueExpanded ? 24 : 4),
    [calibration, concepts, completedQuestionIds, queueExpanded]
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeItem = queue.find((item) => item.question.id === selectedId) ?? queue[0];
  const effectiveMode: ScaffoldingMode | null = activeItem ? (modeOverride ?? activeItem.mode) : null;
  const effectiveDepth = effectiveMode ? explanationDepthForMode(effectiveMode) : "high";
  const helpAvailable = effectiveMode !== null && effectiveMode !== "interview_mode";
  const matchedResources = useMemo<ResourceMatch[]>(
    () => (activeItem ? findResourcesForQuestion(activeItem.question) : []),
    [activeItem]
  );
  const [answer, setAnswer] = useState("");
  const [lastEvaluation, setLastEvaluation] = useState<Evaluation | null>(null);
  const ready = readiness(concepts, calibration);

  function updateCalibration<K extends keyof Calibration>(key: K, value: Calibration[K]) {
    setCalibration((current) => ({ ...current, [key]: value }));
  }

  function handleTargetLevelChange(next: Calibration["targetLevel"]) {
    setCalibration((current) => {
      const isStillDefault = KNOWN_DEFAULT_EXPERIENCES.has(current.experience.trim());
      return {
        ...current,
        targetLevel: next,
        experience: isStillDefault ? LEVEL_EXPERIENCE_DEFAULTS[next] : current.experience
      };
    });
  }

  function toggleWeakConcept(conceptId: string) {
    setCalibration((current) => {
      const next = current.weakConcepts.includes(conceptId)
        ? current.weakConcepts.filter((id) => id !== conceptId)
        : [...current.weakConcepts, conceptId];
      return { ...current, weakConcepts: next };
    });
  }

  function submitAnswer() {
    if (!activeItem || answer.trim().length < 12) return;
    const evaluation = evaluateAnswer(answer, activeItem.question, calibration, concepts);
    setConcepts(evaluation.updatedConcepts);
    setCompletedQuestionIds((current) => Array.from(new Set([...current, activeItem.question.id])));
    setLastEvaluation(evaluation);
    setRepHistory((current) => [
      ...current,
      {
        questionId: activeItem.question.id,
        title: activeItem.question.title,
        score: evaluation.total,
        at: Date.now()
      }
    ]);
  }

  function applySimulatorEvaluation(evaluation: Evaluation) {
    if (!activeItem) return;
    const activeConceptIds = new Set(activeItem.question.concepts);
    const nextConcepts = concepts.map((concept) =>
      activeConceptIds.has(concept.conceptId) ? updateConceptState(concept, evaluation.total) : concept
    );
    setConcepts(nextConcepts);
    setCompletedQuestionIds((current) => Array.from(new Set([...current, activeItem.question.id])));
    setLastEvaluation({ ...evaluation, updatedConcepts: nextConcepts });
    setRepHistory((current) => [
      ...current,
      {
        questionId: activeItem.question.id,
        title: `🎤 ${activeItem.question.title}`,
        score: evaluation.total,
        at: Date.now()
      }
    ]);
  }

  function enterFocus() {
    setFocusMode(true);
    setTimerStart(Date.now());
  }

  function exitFocus() {
    setFocusMode(false);
    setTimerStart(null);
  }

  const submitRef = useRef(submitAnswer);
  useEffect(() => {
    submitRef.current = submitAnswer;
  });

  const drillRef = useRef<HTMLElement | null>(null);
  function scrollToDrill() {
    drillRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    if (focusMode && !activeItem) exitFocus();
  }, [focusMode, activeItem]);

  useEffect(() => {
    if (!helpAvailable) setHelpPanel("none");
  }, [helpAvailable]);

  useEffect(() => {
    setHelpPanel("none");
  }, [activeItem?.question.id]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isEditable =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (event.key === "Escape" && focusMode) {
        event.preventDefault();
        exitFocus();
        return;
      }
      if ((event.key === "f" || event.key === "F") && !focusMode && !isEditable) {
        event.preventDefault();
        enterFocus();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        submitRef.current();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode]);

  function resetSprint() {
    setConcepts(createInitialConceptStates());
    setCompletedQuestionIds([]);
    setLastEvaluation(null);
    setAnswer("");
    setSelectedId(null);
    setRepHistory([]);
    setModeOverride(null);
    setQueueExpanded(false);
    setFocusMode(false);
    setTimerStart(null);
    setHelpPanel("none");
  }

  return (
    <main className="shell" data-focus={focusMode ? "true" : "false"}>
      {focusMode && timerStart ? (
        <div className="focus-bar" role="region" aria-label="Focus mode toolbar">
          <span className="focus-bar-timer">
            <Timer size={15} /> <Stopwatch startedAt={timerStart} />
          </span>
          <span className="focus-bar-context">
            {activeItem
              ? `${prettyMode(effectiveMode ?? activeItem.mode)} · ${activeItem.question.roundType.replaceAll("_", " ")}`
              : ""}
          </span>
          <button type="button" className="btn focus-bar-exit" onClick={exitFocus}>
            <Minimize2 size={15} /> Exit focus <kbd>Esc</kbd>
          </button>
        </div>
      ) : null}
      <header className="topbar">
        <Link href="/" className="brand" aria-label="PrepOS home">
          <Logo size={32} />
          <div>
            <h1>PrepOS</h1>
            <p>Adaptive PM interview simulator</p>
          </div>
        </Link>
        <div className="status-strip" aria-label="PrepOS status">
          <span className="pill">
            <RefreshCw size={15} /> weekly question updates
          </span>
          <span className="pill">
            <Brain size={15} /> adaptive learning
          </span>
          <span className="pill">
            <Target size={15} /> {levelProfiles[calibration.targetLevel].label}
          </span>
          <ThemeToggle />
        </div>
      </header>

      <div className="main">
        <aside className="panel calibration">
          <div className="panel-header">
            <h2>Calibration</h2>
            <p>PrepOS uses this to choose the fastest next rep and decide how much support to provide.</p>
          </div>

          <PromoSlot variant="sidebar" />

          <div className="field">
            <label htmlFor="target-level">Target level</label>
            <select
              id="target-level"
              value={calibration.targetLevel}
              onChange={(event) => handleTargetLevelChange(event.target.value as Calibration["targetLevel"])}
            >
              {targetLevelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="practice-category">Practice category</label>
            <select
              id="practice-category"
              value={calibration.practiceCategory}
              onChange={(event) =>
                updateCalibration("practiceCategory", event.target.value as Calibration["practiceCategory"])
              }
            >
              {practiceCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <p className="field-hint">
              {practiceCategories.find((category) => category.value === calibration.practiceCategory)?.detail}
            </p>
          </div>

          <div className="field">
            <label htmlFor="company-style">Company style</label>
            <select
              id="company-style"
              value={calibration.companyStyle}
              onChange={(event) => updateCalibration("companyStyle", event.target.value)}
            >
              <option>General PM loop</option>
              <option>AI lab style</option>
              <option>Large tech style</option>
              <option>Startup style</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="interview-date">Interview date</label>
            <input
              id="interview-date"
              type="date"
              value={calibration.interviewDate}
              onChange={(event) => updateCalibration("interviewDate", event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="weekly-hours">Weekly practice time</label>
            <div className="range-row">
              <input
                id="weekly-hours"
                type="range"
                min="2"
                max="20"
                value={calibration.weeklyHours}
                onChange={(event) => updateCalibration("weeklyHours", Number(event.target.value))}
              />
              <span>{calibration.weeklyHours} hrs</span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="experience">Experience snapshot</label>
            <textarea
              id="experience"
              value={calibration.experience}
              onChange={(event) => updateCalibration("experience", event.target.value)}
            />
          </div>

          <div className="field">
            <div className="field-head">
              <label>Current weakest areas</label>
              {calibration.weakConcepts.length > 0 ? (
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => updateCalibration("weakConcepts", [])}
                >
                  Clear
                </button>
              ) : null}
            </div>
            <p className="field-hint">
              Tap any number — PrepOS will prioritise drills that hit these.
            </p>
            <div className="weakness-chips">
              {ROUND_ORDER.map((roundType) => {
                const group = conceptsByRound.get(roundType) ?? [];
                if (group.length === 0) return null;
                return (
                  <div className="weakness-group" key={roundType}>
                    <span className="weakness-group-label">{ROUND_LABEL[roundType]}</span>
                    <div className="weakness-group-chips">
                      {group.map((concept) => {
                        const selected = calibration.weakConcepts.includes(concept.id);
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

          <div className="action-row">
            <button className="btn" type="button" onClick={resetSprint}>
              <TimerReset size={16} /> Reset sprint
            </button>
          </div>
        </aside>

        <section className="workspace">
          {calibration.targetLevel === "ai-pm" ? (
            <section className="workspace-head workspace-head--ai-pm">
              <div>
                <span className="eyebrow">AI PM track · Pro Pack only</span>
                <h2>AI PM interview questions are coming in Pro Pack</h2>
                <p>
                  AI PM interviews test a different bundle: eval design, hallucination mitigation,
                  cost / latency trade-offs, and human-fallback design. PrepOS is curating a dedicated
                  AI PM question bank with reviewer notes and expert answers — included in Pro Pack.
                </p>
                <div className="workspace-head-actions ai-pm-head-actions">
                  <PromoEmailForm
                    source="prepos-ai-pm-gate"
                    ctaLabel="Notify me about AI PM Pro Pack"
                  />
                </div>
                <p className="workspace-head-hint workspace-head-hint--block">
                  Want to keep practising? Switch Target level to PM, Senior, Staff, or PM-T.
                </p>
              </div>
              <div className="focus-card">
                <span>Current mode</span>
                <strong>Pro Pack only</strong>
                <p>AI PM bank ships with Pro Pack — drop your email to be notified.</p>
              </div>
            </section>
          ) : (
          <section className="workspace-head">
            <div>
              <span className="eyebrow">Today&apos;s focus</span>
              <h2>{activeItem ? activeItem.question.title : "Calibrate your prep plan"}</h2>
              <p>
                {practiceCategories.find((category) => category.value === calibration.practiceCategory)?.label}:{" "}
                {levelProfiles[calibration.targetLevel].bar}
              </p>
              {activeItem ? (
                <div className="workspace-head-actions">
                  <button type="button" className="btn primary" onClick={scrollToDrill}>
                    Start drill <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setSimulatorOpen(true)}
                  >
                    <Mic size={16} /> Run voice mock
                  </button>
                  <span className="workspace-head-hint">
                    Press <kbd>F</kbd> for focus mode
                  </span>
                </div>
              ) : null}
            </div>
            <div className="focus-card">
              <span>Current mode</span>
              <strong>{effectiveMode ? prettyMode(effectiveMode) : "Calibration"}</strong>
              <p>
                {effectiveMode
                  ? `${effectiveDepth} support level${modeOverride ? " · manual" : ""}`
                  : "Set your target to start."}
              </p>
            </div>
          </section>
          )}

          <div className="grid">
            <MetricCard
              icon={<Activity size={18} />}
              label="Readiness"
              value={ready.score ? `${ready.score}/5` : "New"}
              detail={`${ready.label}; target bar ${ready.threshold}/5`}
            />
            <MetricCard
              icon={<CheckCircle2 size={18} />}
              label="Concept mastery"
              value={`${ready.masteredCount}/${ready.totalConcepts}`}
              detail="PrepOS gives more support where concepts are still developing."
            />
            <MetricCard
              icon={<SlidersHorizontal size={18} />}
              label="Question type"
              value={practiceCategories.find((category) => category.value === calibration.practiceCategory)?.label ?? "All categories"}
              detail="Candidates can choose the kind of question they want to practice."
            />
          </div>

          {calibration.targetLevel !== "ai-pm" ? (
            <Dashboard calibration={calibration} history={repHistory} />
          ) : null}

          {calibration.targetLevel !== "ai-pm" && activeItem ? (
            <section className="panel section drill" ref={drillRef}>
              <div className="section-title-row">
                <div>
                  <span className="eyebrow">Practice now</span>
                  <h2>Drill room</h2>
                </div>
                <div className="drill-actions">
                  <span className="mode-chip">
                    {prettyMode(effectiveMode ?? activeItem.mode)}
                    {modeOverride ? " · manual" : ""}
                  </span>
                  {focusMode ? (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={exitFocus}
                      aria-label="Exit focus mode"
                      title="Exit focus mode (Esc)"
                    >
                      <Minimize2 size={15} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={enterFocus}
                      aria-label="Enter focus mode"
                      title="Enter focus mode (F)"
                    >
                      <Maximize2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mode-selector" role="radiogroup" aria-label="Coaching mode">
                <span className="mode-selector-label">Mode</span>
                <button
                  type="button"
                  role="radio"
                  aria-checked={modeOverride === null}
                  className={`mode-pill ${modeOverride === null ? "active" : ""}`}
                  onClick={() => setModeOverride(null)}
                >
                  Auto
                </button>
                {(
                  ["teach", "guided_practice", "light_feedback", "interview_mode", "maintenance"] as const
                ).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    role="radio"
                    aria-checked={modeOverride === mode}
                    className={`mode-pill ${modeOverride === mode ? "active" : ""}`}
                    onClick={() => setModeOverride(mode)}
                  >
                    {prettyMode(mode)}
                  </button>
                ))}
              </div>

              <div className="coach-note">
                <strong>Coach behavior</strong>
                {coachCopy(
                  effectiveMode ?? activeItem.mode,
                  concepts.filter((concept) => activeItem.question.concepts.includes(concept.conceptId)).map((concept) => concept.label)
                )}
              </div>

              {helpAvailable ? (
                <div className="help-bar">
                  <button
                    type="button"
                    className={`help-toggle ${helpPanel === "resources" ? "active" : ""}`}
                    onClick={() => setHelpPanel(helpPanel === "resources" ? "none" : "resources")}
                    aria-expanded={helpPanel === "resources"}
                  >
                    <Lightbulb size={15} /> Show resources
                    {matchedResources.length > 0 ? (
                      <span className="help-count">{matchedResources.length}</span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    className={`help-toggle ${helpPanel === "coach" ? "active" : ""}`}
                    onClick={() => setHelpPanel(helpPanel === "coach" ? "none" : "coach")}
                    aria-expanded={helpPanel === "coach"}
                  >
                    <Sparkles size={15} /> AI coach
                    <span className="help-count soon">soon</span>
                  </button>
                </div>
              ) : null}

              {helpAvailable && helpPanel === "resources" ? (
                <ResourcePanel matches={matchedResources} />
              ) : null}

              {helpAvailable && helpPanel === "coach" ? <ComingSoonCoachPanel /> : null}

              <div className="prompt-box">
                <h3>{activeItem.question.title}</h3>
                <p>{activeItem.question.prompt}</p>
                <div className="tag-row">
                  <span className="tag">{activeItem.question.roundType.replaceAll("_", " ")}</span>
                  <span className="tag warn">difficulty {activeItem.question.difficulty}/5</span>
                  {activeItem.question.companyClaim ? <span className="tag">{activeItem.question.sourceType}</span> : null}
                </div>
                {activeItem.question.companyClaim ? <QuestionSource question={activeItem.question} /> : null}
              </div>

              <div className="field answer-field">
                <label htmlFor="answer">Candidate answer</label>
                <textarea
                  id="answer"
                  className="answer"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Answer like you are in the interview. Include your goal, user/customer, trade-off, metric, and final recommendation."
                />
              </div>

              <div className="action-row flush">
                <button className="btn primary" type="button" onClick={submitAnswer} disabled={answer.trim().length < 12}>
                  <Send size={16} /> Score answer <kbd className="btn-kbd">⌘ Enter</kbd>
                </button>
              </div>

              {lastEvaluation ? <Scorecard evaluation={lastEvaluation} /> : null}
            </section>
          ) : null}

          {calibration.targetLevel !== "ai-pm" && !activeItem ? (
            <section className="panel section empty-state">
              <span className="eyebrow">No drills found</span>
              <h2>Try another practice category</h2>
              <p>
                This MVP seed bank is still small. Choose All categories or add more reviewed questions to this category.
              </p>
            </section>
          ) : null}

          {calibration.targetLevel !== "ai-pm" ? (
          <section className="panel section">
            <div className="section-title-row">
              <div>
                <span className="eyebrow">Adaptive queue</span>
                <h2>Next best drills</h2>
              </div>
              <span className="mode-chip">{queue.length} ready</span>
            </div>
            <div className="queue">
              {queue.map((item) => (
                <QueueItem
                  item={item}
                  key={item.question.id}
                  active={activeItem?.question.id === item.question.id}
                  onSelect={() => {
                    setSelectedId(item.question.id);
                    setAnswer("");
                    setLastEvaluation(null);
                  }}
                />
              ))}
            </div>
            {queue.length >= 4 ? (
              <button
                type="button"
                className="queue-expand"
                onClick={() => setQueueExpanded((current) => !current)}
              >
                {queueExpanded ? "Show fewer" : "Show more"}
              </button>
            ) : null}
          </section>
          ) : null}

          {calibration.targetLevel !== "ai-pm" ? (
            <LearningMemory concepts={concepts} readiness={ready} />
          ) : null}
        </section>
      </div>

      <p className="footer-note">
        MVP1 runs locally with trusted seed content. The weekly update workflow validates source metadata before adding
        questions to the bank.
      </p>

      {simulatorOpen && activeItem && effectiveMode ? (
        <Simulator
          question={activeItem.question}
          calibration={calibration}
          mode={effectiveMode}
          onClose={() => setSimulatorOpen(false)}
          onComplete={applySimulatorEvaluation}
        />
      ) : null}
    </main>
  );
}

function QuestionSource({ question }: { question: PracticePlanItem["question"] }) {
  if (!question.companyClaim) return null;

  const sourceLabel =
    question.sourceType === "original"
      ? "PrepOS original seed prompt"
      : question.sourceType === "synthetic"
        ? "AI-assisted prompt, human reviewed"
        : question.sourceType === "public_video"
          ? "Public video source"
          : question.sourceType === "community"
            ? "Community submission with consent"
            : "Public source";

  return (
    <div className="source-box">
      <strong>Question source</strong>
      <p>
        {sourceLabel}. Reviewer: {question.reviewer}. Company claim: {question.companyClaim}.
      </p>
      {question.sourceUrl ? (
        <a href={question.sourceUrl} target="_blank" rel="noreferrer">
          View source
        </a>
      ) : (
        <span>No external citation; authored for PrepOS practice.</span>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="panel metric">
      <span>
        {icon} {label}
      </span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  );
}

function QueueItem({
  item,
  active,
  onSelect
}: {
  item: PracticePlanItem;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button className={`queue-item ${active ? "active" : ""}`} type="button" onClick={onSelect}>
      <div>
        <h3>{item.question.title}</h3>
        <p>{item.reason}</p>
        <div className="tag-row">
          <span className="tag">{prettyMode(item.mode)}</span>
          <span className="tag warn">support: {item.explanationDepth}</span>
        </div>
      </div>
      <ClipboardList size={20} />
    </button>
  );
}

function Scorecard({ evaluation }: { evaluation: Evaluation }) {
  const rows = [
    ["Structure", evaluation.breakdown.structure],
    ["User insight", evaluation.breakdown.userInsight],
    ["Metrics", evaluation.breakdown.metrics],
    ["Trade-offs", evaluation.breakdown.tradeoffs],
    ["Communication", evaluation.breakdown.communication],
    ["Level depth", evaluation.breakdown.targetLevelDepth]
  ] as const;

  return (
    <div className="prompt-box scorecard">
      <h3>Scorecard: {evaluation.total}/5</h3>
      {rows.map(([label, score]) => (
        <div className="score-row" key={label}>
          <span>{label}</span>
          <div className="bar" aria-hidden="true">
            <span style={{ width: `${score * 20}%` }} />
          </div>
          <strong>{score}</strong>
        </div>
      ))}
      <div>
        <h3>What worked</h3>
        <ul>
          {evaluation.strengths.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Fastest next improvement</h3>
        <ul>
          {evaluation.improvements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>{evaluation.nextAction}</p>
      </div>
    </div>
  );
}

function ResourcePanel({ matches }: { matches: ResourceMatch[] }) {
  if (matches.length === 0) {
    return (
      <div className="help-panel">
        <p className="help-empty">
          No curated resources matched this prompt yet. Try the AI coach (coming soon) or browse the
          PrepOS reading list on GitHub.
        </p>
      </div>
    );
  }
  return (
    <div className="help-panel">
      <span className="help-panel-eyebrow">Top {matches.length} curated · ranked by relevance</span>
      <ul className="help-resource-list">
        {matches.map(({ resource, specificity }) => (
          <li key={resource.id}>
            <a className="help-resource" href={resource.url} target="_blank" rel="noreferrer">
              <span className="help-resource-type">{resource.type}</span>
              <span className="help-resource-body">
                <strong>{resource.title}</strong>
                {resource.description ? <span>{resource.description}</span> : null}
                <em>
                  {resource.source}
                  {resource.duration ? ` · ${resource.duration}` : ""}
                  {" · "}
                  <span className={`help-match help-match-${specificity}`}>
                    {specificity === 3
                      ? "this question"
                      : specificity === 2
                        ? "concept match"
                        : "category match"}
                  </span>
                </em>
              </span>
              <ExternalLink size={15} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ComingSoonCoachPanel() {
  return (
    <div className="help-panel coach">
      <span className="help-panel-eyebrow">AI coach · coming soon</span>
      <p>
        Senior-PM-coach assistance is on the roadmap. It will run with your own Anthropic API key
        (stored locally in your browser, never sent to PrepOS) and return a concise framework, two
        analogous examples, and one trap to avoid for the active question.
      </p>
      <p className="help-panel-note">No account, no PrepOS infra, no tracking — same local-first promise.</p>
    </div>
  );
}

function Stopwatch({ startedAt }: { startedAt: number }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const seconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return <span className="mono">{display}</span>;
}
