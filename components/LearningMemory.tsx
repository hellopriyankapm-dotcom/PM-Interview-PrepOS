import { Activity, ChevronDown, Layers, Target } from "lucide-react";
import { ROUND_LABEL, ROUND_ORDER } from "@/lib/round-types";
import type { ConceptState, RoundType, ScaffoldingMode } from "@/lib/types";

const STAGES: ScaffoldingMode[] = [
  "teach",
  "guided_practice",
  "light_feedback",
  "interview_mode",
  "maintenance"
];

const STAGE_LABEL: Record<ScaffoldingMode, string> = {
  teach: "Coach",
  guided_practice: "Guided",
  light_feedback: "Light",
  interview_mode: "Interview",
  maintenance: "Mastered"
};

const READY_STAGES = new Set<ScaffoldingMode>(["interview_mode", "maintenance"]);

type ReadinessSummary = {
  score: number;
  threshold: number;
  masteredCount: number;
  totalConcepts: number;
  label: string;
};

type Props = {
  concepts: ConceptState[];
  readiness: ReadinessSummary;
};

export function LearningMemory({ concepts, readiness }: Props) {
  const buckets = countByStage(concepts);
  const groups = groupByRound(concepts);

  return (
    <section className="panel section learning-memory">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">Learning memory</span>
          <h2>Concept mastery</h2>
        </div>
        <span className="mode-chip">
          {readiness.masteredCount}/{readiness.totalConcepts} interview-ready
        </span>
      </div>

      <MasterySummary readiness={readiness} buckets={buckets} total={concepts.length} />

      <details className="learning-section">
        <summary>
          <span className="learning-section-summary">
            <Layers size={14} /> By round type
            <span className="learning-section-meta">
              {ROUND_ORDER.filter((rt) => (groups.get(rt)?.length ?? 0) > 0).length} groups
            </span>
          </span>
          <ChevronDown size={16} className="learning-section-chevron" />
        </summary>
        <div className="round-grid">
          {ROUND_ORDER.map((roundType) => {
            const roundConcepts = groups.get(roundType) ?? [];
            if (roundConcepts.length === 0) return null;
            const ready = roundConcepts.filter((c) => READY_STAGES.has(c.state)).length;
            return (
              <div className="round-row" key={roundType}>
                <span className="round-row-label">{ROUND_LABEL[roundType]}</span>
                <div className="round-row-cells">
                  {roundConcepts.map((concept) => (
                    <span
                      key={concept.conceptId}
                      className="round-cell"
                      data-stage={concept.state}
                      title={`${concept.label} · ${STAGE_LABEL[concept.state]}`}
                    />
                  ))}
                </div>
                <span className="round-row-count mono">
                  {ready}/{roundConcepts.length}
                </span>
              </div>
            );
          })}
        </div>
      </details>

      <details className="learning-section">
        <summary>
          <span className="learning-section-summary">
            <Activity size={14} /> Per-concept progression
            <span className="learning-section-meta">{concepts.length} concepts</span>
          </span>
          <ChevronDown size={16} className="learning-section-chevron" />
        </summary>
        <div className="concept-grid">
          {concepts.map((concept) => (
            <ConceptCard concept={concept} key={concept.conceptId} />
          ))}
        </div>
      </details>
    </section>
  );
}

function MasterySummary({
  readiness,
  buckets,
  total
}: {
  readiness: ReadinessSummary;
  buckets: Record<ScaffoldingMode, number>;
  total: number;
}) {
  return (
    <div className="mastery-summary">
      <div className="mastery-headline">
        <div className="mastery-score">
          <span className="mastery-score-value mono">
            {readiness.score ? readiness.score.toFixed(1) : "—"}
          </span>
          <span className="mastery-score-unit mono">/5</span>
        </div>
        <div className="mastery-headline-text">
          <strong>{readiness.label}</strong>
          <p>
            <Target size={13} /> Target bar {readiness.threshold.toFixed(1)}/5 ·{" "}
            {readiness.masteredCount} of {total} concepts interview-ready
          </p>
        </div>
      </div>

      <div className="mastery-bar" role="img" aria-label="Concept distribution across mastery stages">
        {STAGES.map((stage) => {
          const count = buckets[stage];
          if (count === 0) {
            return <span key={stage} className="mastery-bar-empty" data-stage={stage} aria-hidden="true" />;
          }
          return (
            <span
              key={stage}
              className="mastery-bar-segment"
              data-stage={stage}
              style={{ flex: count }}
              aria-label={`${count} at ${STAGE_LABEL[stage]}`}
            >
              <span className="mastery-bar-count mono">{count}</span>
            </span>
          );
        })}
      </div>

      <div className="mastery-bar-legend">
        {STAGES.map((stage) => (
          <span className="mastery-bar-legend-item" key={stage}>
            <i data-stage={stage} aria-hidden="true" />
            <span>{STAGE_LABEL[stage]}</span>
            <strong className="mono">{buckets[stage]}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

function ConceptCard({ concept }: { concept: ConceptState }) {
  const stageIndex = STAGES.indexOf(concept.state);
  return (
    <div className="concept-card" data-stage={concept.state}>
      <div className="concept-card-head">
        <strong>{concept.label}</strong>
        <span className="concept-roundtype">{ROUND_LABEL[concept.roundType]}</span>
      </div>

      <div
        className="concept-stage-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={STAGES.length - 1}
        aria-valuenow={stageIndex}
        aria-label={`Currently at ${STAGE_LABEL[concept.state]}`}
      >
        {STAGES.map((stage, index) => {
          const className = [
            "concept-stage-dot",
            index <= stageIndex ? "filled" : "",
            index === stageIndex ? "current" : ""
          ]
            .filter(Boolean)
            .join(" ");
          return <span key={stage} className={className} data-stage={stage} title={STAGE_LABEL[stage]} />;
        })}
      </div>

      <div className="concept-stage-current">
        <span className="concept-stage-current-label">Now at</span>
        <strong>{STAGE_LABEL[concept.state]}</strong>
        <span className="concept-stage-current-step mono">
          {stageIndex + 1}/{STAGES.length}
        </span>
      </div>

      {concept.recentScores.length >= 2 ? (
        <ConceptSparkline values={concept.recentScores} />
      ) : null}

      <div className="concept-card-meta">
        <span className="tag">conf · {concept.confidence}</span>
        <span className="tag warn">support · {concept.explanationDepth}</span>
      </div>
    </div>
  );
}

function ConceptSparkline({ values }: { values: number[] }) {
  const width = 88;
  const height = 22;
  const max = 5;
  if (values.length < 2) return null;
  const stepX = width / (values.length - 1);
  const points = values
    .map((value, index) => `${(index * stepX).toFixed(1)},${(height - (value / max) * height).toFixed(1)}`)
    .join(" ");
  const last = values[values.length - 1];
  const lastX = (values.length - 1) * stepX;
  const lastY = height - (last / max) * height;
  return (
    <svg
      className="concept-sparkline"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Recent scores trend, latest ${last.toFixed(1)} of 5`}
    >
      <polyline points={points} fill="none" />
      <circle cx={lastX} cy={lastY} r="2.4" />
    </svg>
  );
}

function countByStage(concepts: ConceptState[]): Record<ScaffoldingMode, number> {
  const result: Record<ScaffoldingMode, number> = {
    teach: 0,
    guided_practice: 0,
    light_feedback: 0,
    interview_mode: 0,
    maintenance: 0
  };
  for (const concept of concepts) result[concept.state] += 1;
  return result;
}

function groupByRound(concepts: ConceptState[]): Map<RoundType, ConceptState[]> {
  const map = new Map<RoundType, ConceptState[]>();
  for (const concept of concepts) {
    const list = map.get(concept.roundType) ?? [];
    list.push(concept);
    map.set(concept.roundType, list);
  }
  return map;
}
