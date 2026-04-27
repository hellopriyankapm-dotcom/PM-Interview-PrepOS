"use client";

import {
  Activity,
  Brain,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  Send,
  Target,
  TimerReset
} from "lucide-react";
import { useMemo, useState } from "react";
import { buildPracticeQueue, readiness } from "@/lib/adaptive/engine";
import { createInitialConceptStates, levelProfiles, targetLevelOptions } from "@/lib/content";
import { coachCopy } from "@/lib/scaffolding/scaffolding";
import { evaluateAnswer } from "@/lib/scoring/rubrics";
import type { Calibration, ConceptState, Evaluation, PracticePlanItem } from "@/lib/types";

const initialCalibration: Calibration = {
  targetLevel: "senior",
  companyStyle: "AI lab style",
  interviewDate: "",
  weeklyHours: 8,
  experience: "PM with 3-5 years of product experience",
  selfReportedWeakness: "metrics"
};

function prettyMode(mode: string) {
  return mode
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default function PrepOSApp() {
  const [calibration, setCalibration] = useState<Calibration>(initialCalibration);
  const [concepts, setConcepts] = useState<ConceptState[]>(() => createInitialConceptStates());
  const [completedQuestionIds, setCompletedQuestionIds] = useState<string[]>([]);
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
  }

  function resetSprint() {
    setConcepts(createInitialConceptStates());
    setCompletedQuestionIds([]);
    setLastEvaluation(null);
    setAnswer("");
    setSelectedId(null);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <img className="brand-mark" src="favicon-48.png" alt="PrepOS logo" width="36" height="36" />
          <div>
            <h1>PrepOS MVP1</h1>
            <p>Adaptive PM interview readiness system</p>
          </div>
        </div>
        <div className="status-strip" aria-label="PrepOS status">
          <span className="pill">
            <RefreshCw size={15} /> weekly question updates
          </span>
          <span className="pill">
            <Brain size={15} /> adaptive explanations
          </span>
          <span className="pill">
            <Target size={15} /> {levelProfiles[calibration.targetLevel].label}
          </span>
        </div>
      </header>

      <div className="main">
        <aside className="panel calibration">
          <div className="panel-header">
            <h2>Calibration</h2>
            <p>PrepOS uses this to choose the fastest next rep and decide how much teaching to show.</p>
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
              detail="Mastered concepts receive less explanation and more pressure."
            />
            <MetricCard
              icon={<CalendarClock size={18} />}
              label="Sprint plan"
              value={`${Math.max(3, calibration.weeklyHours)} reps`}
              detail="Queue recalculates after every scored answer."
            />
          </div>

          <section className="panel section">
            <h2>Next best drills</h2>
            <p>{levelProfiles[calibration.targetLevel].bar}</p>
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

          {activeItem ? (
            <section className="panel section drill">
              <div>
                <h2>Drill room</h2>
                <p>
                  {prettyMode(activeItem.mode)} with {activeItem.explanationDepth} explanation depth.
                </p>
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
                  <span className="tag">{activeItem.question.sourceType}</span>
                </div>
                <QuestionSource question={activeItem.question} />
              </div>

              <div className="field" style={{ padding: 0 }}>
                <label htmlFor="answer">Candidate answer</label>
                <textarea
                  id="answer"
                  className="answer"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Answer like you are in the interview. Include your goal, user/customer, trade-off, metric, and final recommendation."
                />
              </div>

              <div className="action-row" style={{ padding: 0 }}>
                <button className="btn primary" type="button" onClick={submitAnswer} disabled={answer.trim().length < 12}>
                  <Send size={16} /> Score answer
                </button>
              </div>

              {lastEvaluation ? <Scorecard evaluation={lastEvaluation} /> : null}
            </section>
          ) : null}

          <section className="panel section">
            <h2>Concept mastery</h2>
            <p>Concepts move from Teach to Interview Mode as the candidate proves understanding.</p>
            <div className="concepts">
              {concepts.slice(0, 8).map((concept) => (
                <div className="concept" key={concept.conceptId}>
                  <strong>{concept.label}</strong>
                  <span className={concept.state === "teach" ? "tag risk" : "tag"}>{prettyMode(concept.state)}</span>
                  <div className="tag-row">
                    <span className="tag warn">explain: {concept.explanationDepth}</span>
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
        {sourceLabel}. Reviewer: {question.reviewer}. Company claim:{" "}
        {question.companyClaim ? question.companyClaim : "none; this is not presented as a real company question"}.
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
          <span className="tag warn">explain: {item.explanationDepth}</span>
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
