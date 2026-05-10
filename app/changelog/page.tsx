import type { Metadata } from "next";
import { ContentShell } from "@/components/ContentShell";

export const metadata: Metadata = {
  title: "Changelog — PrepOS",
  description:
    "What shipped on PrepOS recently. Weekly cadence, public log, no marketing fluff.",
  alternates: { canonical: "/changelog" }
};

type Release = {
  date: string;
  title: string;
  bullets: string[];
};

const releases: Release[] = [
  {
    date: "2026-05",
    title: "First-time setup wizard",
    bullets: [
      "Click Start practicing on a fresh browser and you're now greeted by a 30-second setup wizard instead of a complex sidebar.",
      "Quick-start presets — New grad APM, Senior PM at FAANG, AI PM at Anthropic, PM-T at Stripe — pre-fill your level, company style, and experience in one tap.",
      "Pick your weakest concepts as chips so the practice queue surfaces those reps first.",
      "Your settings save on this device. Next visit lands you straight in practice with everything restored.",
      "A Recalibrate link in the practice sidebar lets you re-open the wizard anytime."
    ]
  },
  {
    date: "2026-05",
    title: "AI PM track is Pro Pack early-access",
    bullets: [
      "Pick AI PM as your target level and you'll see a focused pitch for the upcoming AI PM question bank — eval design, hallucination mitigation, cost / latency trade-offs, human-fallback design.",
      "Drop your email to be first in line when the AI PM bundle ships."
    ]
  },
  {
    date: "2026-05",
    title: "Voice mock simulator: pick Claude or ChatGPT",
    bullets: [
      "The voice mock now supports both Anthropic Claude and OpenAI ChatGPT — pick whichever you have a key for.",
      "Cleaner two-step setup: choose the model + optional add-ons (lifelike voice via ElevenLabs, or real-video Teams-style simulation), then enter just the keys you need.",
      "Pro Pack option in the simulator lets you sign up for managed keys so you can skip the BYO step entirely when it ships."
    ]
  },
  {
    date: "2026-05",
    title: "Pro Pack early-access",
    bullets: [
      "Pro Pack — coming soon: AI PM interview questions, extra question banks, an expert-answer library, and premium interviewer personas.",
      "Sign up via the email cards on the landing page, in the practice sidebar, or inside the voice-mock simulator."
    ]
  },
  {
    date: "2026-05",
    title: "Calibration polish",
    bullets: [
      "Experience snapshot now updates automatically when you change your target level — no more 'PM with 3-5 years' showing up for an APM candidate.",
      "Custom text you've typed in any field survives level switches.",
      "The Drill Room answer field is now clearly visible in dark mode (used to be black-on-black)."
    ]
  },
  {
    date: "2026-05",
    title: "Mobile-friendly practice surface",
    bullets: [
      "/app reflows cleanly on phones — calibration sidebar, drill room, and adaptive queue all work without horizontal scrolling.",
      "No more iOS auto-zoom when you tap a text input."
    ]
  },
  {
    date: "2026-05",
    title: "Privacy / Terms / About / Changelog pages",
    bullets: [
      "Plain-English Privacy and Terms pages document exactly what PrepOS sees and what it doesn't (almost everything stays in your browser).",
      "About page tells the founder story honestly.",
      "Changelog (this page) shows what's shipped recently."
    ]
  },
  {
    date: "2026-05",
    title: "Hero polish + landing redesign",
    bullets: [
      "Animated underline on the words 'next' and 'answer' in the headline.",
      "Single primary call-to-action — Start practicing — instead of competing buttons.",
      "Cleaner social-share preview when you paste pmprepos.com into LinkedIn / Slack / X."
    ]
  },
  {
    date: "2026-05",
    title: "Multi-select 'weakest areas' chips",
    bullets: [
      "The 'Current weakest area' free-text field is now a multi-select of all 18 PM interview concepts, grouped by round (product sense, execution, AI judgment, behavioral, strategy, technical).",
      "The adaptive queue gives drills that test your chosen concepts a higher priority."
    ]
  }
];

export default function ChangelogPage() {
  return (
    <ContentShell crumbs={[{ label: "Home", href: "/" }, { label: "Changelog" }]}>
      <header className="content-head">
        <span className="eyebrow">Changelog</span>
        <h1>What shipped recently</h1>
        <p className="content-lede">
          Public log of what&apos;s changed on PrepOS. Weekly cadence, no marketing fluff. Newest at
          the top.
        </p>
      </header>

      <section className="content-body">
        {releases.map((release, idx) => (
          <article className="content-section" key={idx}>
            <h2>
              {release.title}{" "}
              <span className="muted">· {release.date}</span>
            </h2>
            <ul className="bullet-list">
              {release.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          </article>
        ))}

        <div className="content-section">
          <h2>Want to suggest what should ship next?</h2>
          <p>
            Email <a href="mailto:contact@pmprepos.com">contact@pmprepos.com</a> with feature
            requests, missing question types, bug reports, or just a hello.
          </p>
        </div>
      </section>
    </ContentShell>
  );
}
