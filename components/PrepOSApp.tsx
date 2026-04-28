"use client";

import {
  Activity,
  Brain,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  Send,
  SlidersHorizontal,
  Target,
  TimerReset
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Dashboard, type RepHistoryEntry } from "@/components/Dashboard";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { buildPracticeQueue, readiness } from "@/lib/adaptive/engine";
import { createInitialConceptStates, levelProfiles, targetLevelOptions } from "@/lib/content";
import { coachCopy } from "@/lib/scaffolding/scaffolding";
import { evaluateAnswer } from "@/lib/scoring/rubrics";
import type { Calibration, ConceptState, Evaluation, PracticePlanItem } from "@/lib/types";

const initialCalibration: Calibration = {
  targetLevel: "apm",
  practiceCategory: "all",
  companyStyle: "General PM loop",
  interviewDate: "",
  weeklyHours: 8,
  experience: "PM with 3-5 years of product experience",
  selfReportedWeakness: "metrics"
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
  const queue = useMemo(
    () => buildPracticeQueue(calibration, concepts, completedQuestionIds),
    [calibration, concepts, completedQuestionIds]
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeItem = queue.find((item) => item.question.id === selectedId) ?? queue[0];
  const [answer, setAnswer] = useState("");
  const [lastEvaluation, setLastEvaluation] = useState<Evaluation | null>(null);
  const ready = readiness(concepts, calibration);

  function updateCalibration<K extends keyof Calibration>(key: K, value: Calibration[K]) {
    setCalibration((current) => ({ ...current, [key]: value }));
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

  function resetSprint() {
    setConcepts(createInitialConceptStates());
    setCompletedQuestionIds([]);
    setLastEvaluation(null);
    setAnswer("");
    setSelectedId(null);
    setRepHistory([]);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="PrepOS home">
          <Logo size={32} />
          <div>
            <h1>PrepOS</h1>
            <p>Adaptive PM interview prep</p>
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

          <div className="field">
            <label htmlFor="target-level">Target level</label>
            <select
              id="target-level"
              value={calibration.targetLevel}
              onChange={(event) => updateCalibration("targetLevel", event.target.value as Calibration["targetLevel"])}
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
            <label htmlFor="weakness">Current weakest area</label>
            <input
              id="weakness"
              value={calibration.selfReportedWeakness}
              onChange={(event) => updateCalibration("selfReportedWeakness", event.target.value)}
            />
          </div>

          <div className="action-row">
            <button className="btn" type="button" onClick={resetSprint}>
              <TimerReset size={16} /> Reset sprint
            </button>
          </div>
        </aside>

        <section className="workspace">
          <section className="workspace-head">
            <div>
              <span className="eyebrow">Today&apos;s focus</span>
              <h2>{activeItem ? activeItem.question.title : "Calibrate your prep plan"}</h2>
              <p>
                {practiceCategories.find((category) => category.value === calibration.practiceCategory)?.label}:{" "}
                {levelProfiles[calibration.targetLevel].bar}
              </p>
            </div>
            <div className="focus-card">
              <span>Current mode</span>
              <strong>{activeItem ? prettyMode(activeItem.mode) : "Calibration"}</strong>
              <p>{activeItem ? `${activeItem.explanationDepth} support level` : "Set your target to start."}</p>
            </div>
          </section>

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

          <Dashboard calibration={calibration} history={repHistory} />

          {activeItem ? (
            <section className="panel section drill">
              <div className="section-title-row">
                <div>
                  <span className="eyebrow">Practice now</span>
                  <h2>Drill room</h2>
                </div>
                <span className="mode-chip">{prettyMode(activeItem.mode)}</span>
              </div>

              <div className="coach-note">
                <strong>Coach behavior</strong>
                {coachCopy(
                  activeItem.mode,
                  concepts.filter((concept) => activeItem.question.concepts.includes(concept.conceptId)).map((concept) => concept.label)
                )}
              </div>

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
                  <Send size={16} /> Score answer
                </button>
              </div>

              {lastEvaluation ? <Scorecard evaluation={lastEvaluation} /> : null}
            </section>
          ) : null}

          {!activeItem ? (
            <section className="panel section empty-state">
              <span className="eyebrow">No drills found</span>
              <h2>Try another practice category</h2>
              <p>
                This MVP seed bank is still small. Choose All categories or add more reviewed questions to this category.
              </p>
            </section>
          ) : null}

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
          </section>

          <section className="panel section">
            <div className="section-title-row">
              <div>
                <span className="eyebrow">Learning memory</span>
                <h2>Concept mastery</h2>
              </div>
              <span className="mode-chip">{ready.masteredCount}/{ready.totalConcepts} mastered</span>
            </div>
            <div className="concepts">
              {concepts.slice(0, 8).map((concept) => (
                <div className="concept" key={concept.conceptId}>
                  <strong>{concept.label}</strong>
                  <span className={concept.state === "teach" ? "tag risk" : "tag"}>{prettyMode(concept.state)}</span>
                  <div className="tag-row">
                    <span className="tag warn">support: {concept.explanationDepth}</span>
                    <span className="tag">confidence: {concept.confidence}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>

      <p className="footer-note">
        MVP1 runs locally with trusted seed content. The weekly update workflow validates source metadata before adding
        questions to the bank.
      </p>
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
