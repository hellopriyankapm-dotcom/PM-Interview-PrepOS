import { CalendarDays, History, TrendingUp } from "lucide-react";
import type { Calibration } from "@/lib/types";

export type RepHistoryEntry = {
  questionId: string;
  title: string;
  score: number;
  at: number;
};

type DashboardProps = {
  calibration: Calibration;
  history: RepHistoryEntry[];
};

function daysUntil(date: string) {
  if (!date) return null;
  const then = new Date(`${date}T12:00:00`);
  if (Number.isNaN(then.getTime())) return null;
  const diff = Math.ceil((then.getTime() - Date.now()) / 86400000);
  return diff;
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return <div className="dash-sparkline-empty">Log two reps to see your trend.</div>;
  }
  const width = 220;
  const height = 56;
  const max = 5;
  const stepX = width / (values.length - 1);
  const points = values.map((value, index) => {
    const x = index * stepX;
    const y = height - (value / max) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const polyline = points.join(" ");
  const last = values[values.length - 1];
  const lastX = (values.length - 1) * stepX;
  const lastY = height - (last / max) * height;
  return (
    <svg
      className="dash-sparkline"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Score trend, latest ${last.toFixed(1)} of 5`}
    >
      <polyline points={polyline} fill="none" />
      <circle cx={lastX} cy={lastY} r="3.5" />
    </svg>
  );
}

export function Dashboard({ calibration, history }: DashboardProps) {
  const days = daysUntil(calibration.interviewDate);
  const recent = history.slice(-8);
  const trend = recent.map((entry) => entry.score);
  const avg = trend.length ? trend.reduce((sum, value) => sum + value, 0) / trend.length : 0;

  return (
    <section className="panel section dashboard">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">Session dashboard</span>
          <h2>Where you stand right now</h2>
        </div>
        <span className="mode-chip">{history.length} reps</span>
      </div>

      <div className="dash-grid">
        <article className="dash-tile">
          <span className="dash-tile-icon">
            <CalendarDays size={16} />
          </span>
          <span className="dash-tile-label">Interview countdown</span>
          <strong className="dash-tile-value mono">
            {days === null ? "—" : days <= 0 ? "Today" : `${days}d`}
          </strong>
          <p>
            {days === null
              ? "Set an interview date to enable date-aware urgency."
              : days <= 0
                ? "It's go time — keep it short, structured, and confident."
                : days <= 10
                  ? "Final stretch — prefer interview-mode reps over coaching."
                  : "Build coverage now. Date-aware urgency kicks in inside 10 days."}
          </p>
        </article>

        <article className="dash-tile">
          <span className="dash-tile-icon">
            <TrendingUp size={16} />
          </span>
          <span className="dash-tile-label">Recent score trend</span>
          <strong className="dash-tile-value mono">{trend.length ? avg.toFixed(1) : "—"}</strong>
          <Sparkline values={trend} />
        </article>

        <article className="dash-tile dash-tile-history">
          <span className="dash-tile-icon">
            <History size={16} />
          </span>
          <span className="dash-tile-label">Recent reps</span>
          {history.length === 0 ? (
            <p>No reps logged yet. Submit an answer to see it here.</p>
          ) : (
            <ul className="dash-history">
              {history
                .slice(-5)
                .reverse()
                .map((entry) => (
                  <li key={`${entry.questionId}-${entry.at}`}>
                    <span className="dash-history-title">{entry.title}</span>
                    <span className="dash-history-score mono">{entry.score.toFixed(1)}</span>
                  </li>
                ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
}
