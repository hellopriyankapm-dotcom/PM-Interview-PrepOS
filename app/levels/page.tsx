import type { Metadata } from "next";
import Link from "next/link";
import levelsRaw from "@/content/levels/levels.json";
import { ContentShell } from "@/components/ContentShell";
import { levelMeta } from "@/lib/level-meta";
import type { TargetLevel } from "@/lib/types";

const LEVEL_ORDER: TargetLevel[] = ["apm", "pm", "senior", "staff", "ai-pm", "pm-t"];

export const metadata: Metadata = {
  title: "PM Interview Target Levels — APM, PM, Senior, Staff, AI PM, PM-T",
  description:
    "What changes between PM interview levels. From APM to Staff PM, plus AI PM and PM-T tracks. Every page lays out the bar, the practice focus, and what interviewers expect at each level.",
  alternates: { canonical: "/levels" }
};

export default function LevelsIndexPage() {
  const levels = levelsRaw as Record<TargetLevel, { label: string; bar: string }>;
  return (
    <ContentShell crumbs={[{ label: "Home", href: "/" }, { label: "Target levels" }]}>
      <header className="content-head">
        <span className="eyebrow">PM interview levels</span>
        <h1>PM interview levels — what changes from APM to Staff to AI PM</h1>
        <p>
          PrepOS calibrates every practice rep to one of these target levels. Pick the one you&apos;re
          interviewing for to see the bar, the practice focus, and the specific signals interviewers want.
        </p>
      </header>

      <section className="content-body">
        {LEVEL_ORDER.map((key) => (
          <div className="content-section" key={key}>
            <h2>
              <Link href={`/levels/${key}`}>{levels[key].label}</Link>
            </h2>
            <p>{levelMeta[key].tagline}</p>
            <p className="muted">
              <strong>Bar:</strong> {levels[key].bar}
            </p>
          </div>
        ))}
      </section>
    </ContentShell>
  );
}
