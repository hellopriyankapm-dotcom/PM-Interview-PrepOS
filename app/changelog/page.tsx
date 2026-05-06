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
    date: "2026-05-06",
    title: "Legitimacy + mobile pass",
    bullets: [
      "Privacy, Terms, About, and Changelog pages live (you're on it).",
      "Footer links to legal + about + changelog from every page.",
      "Mobile pass on /app — calibration sidebar, workspace, drill, and queue all reflow cleanly at narrow viewports."
    ]
  },
  {
    date: "2026-05-06",
    title: "AI PM Pro Pack gate",
    bullets: [
      "Picking AI PM in the Target level dropdown now surfaces a focused Pro Pack pitch instead of an unrelated drill.",
      "Inline email capture on the AI PM gate (source: prepos-ai-pm-gate so signups distinguish in Formspree).",
      "Switched away from a workspace-head split layout that left a void above the pitch."
    ]
  },
  {
    date: "2026-05-06",
    title: "Calibration polish",
    bullets: [
      "Experience snapshot now updates automatically when you change Target level.",
      "Custom text you typed survives a level switch — only the known defaults get replaced.",
      "Dark-mode answer textarea and form fields now lift visibly above the panel surface (no more black-on-black)."
    ]
  },
  {
    date: "2026-05-06",
    title: "Simulator: two-step setup + ChatGPT support",
    bullets: [
      "New options screen on Run voice mock — pick Anthropic Claude or OpenAI ChatGPT, toggle lifelike voice, toggle real-video.",
      "Keys screen now only shows the API key fields you actually need.",
      "Pro Pack early-access card with inline email capture (source: prepos-simulator).",
      "Dropped per-interview dollar amounts; added explicit BYO-keys disclaimer.",
      "Removed the optional Custom portrait URL field — the bundled Sarah is now the only portrait."
    ]
  },
  {
    date: "2026-05-06",
    title: "SEO Phase 1 + 2 — 286 indexable pages",
    bullets: [
      "Sitemap, robots.txt with explicit GPTBot/ClaudeBot/PerplexityBot allow rules, llms.txt manifest.",
      "JSON-LD schemas: Organization, WebSite + SearchAction, SoftwareApplication, FAQPage, plus per-page Question / DefinedTerm / Article on the new content routes.",
      "/questions, /concepts, /rounds, /levels — index + detail pages auto-generated from the data (250 + 18 + 6 + 6 = 280 long-tail pages).",
      "Real 1200×630 OG image generated at build time via next/og.",
      "Per-page metadata for /app."
    ]
  },
  {
    date: "2026-05-06",
    title: "Privacy-friendly aggregate analytics",
    bullets: [
      "GoatCounter wired in (cookie-free, no PII, GDPR-clean).",
      "Tracked events: Pro Pack Click, Promo Submit Success / Error, Promo Dismiss, Open App.",
      "Provider-agnostic — Plausible and Umami also supported via env vars."
    ]
  },
  {
    date: "2026-05-06",
    title: "Custom domain pmprepos.com",
    bullets: [
      "Apex DNS at Porkbun (4 A + 4 AAAA records to GitHub Pages).",
      "Site moved off /PM-Interview-PrepOS subpath; canonical is now https://pmprepos.com.",
      "TLS via Let's Encrypt, HTTPS enforced."
    ]
  },
  {
    date: "2026-05-06",
    title: "Pro Pack early-access flow",
    bullets: [
      "PromoSlot card on landing + in-app sidebar with email capture (Formspree).",
      "Header gradient pill replaces 'Open app / Start practicing' as the primary header CTA.",
      "Smooth-scroll + auto-focus from the header pill into the promo slot."
    ]
  },
  {
    date: "2026-05-06",
    title: "Hero polish",
    bullets: [
      "'next' and 'answer' words get an animated gradient underline that draws in on first paint.",
      "Subtle continuous shimmer through the gradient (gated by prefers-reduced-motion).",
      "Closing CTA renamed to 'Start practicing' — consistent with the hero CTA."
    ]
  },
  {
    date: "2026-05-06",
    title: "Calibration: multi-select concept chips for weakest areas",
    bullets: [
      "Free-text 'Current weakest area' input replaced with a multi-select chip group of all 18 concepts grouped by round.",
      "Adaptive engine bumps queue priority by +4 for each chip that overlaps with a question's concept tags.",
      "Founder story rewritten in first person — 'aspiring PM, still in active loops.'"
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
          <h2>Want to follow the work?</h2>
          <p>
            All commits are public on{" "}
            <a href="https://github.com/hellopriyankapm-dotcom/PM-Interview-PrepOS/commits/main" target="_blank" rel="noreferrer">
              GitHub
            </a>
            . Pull requests, issues, and feature requests are welcome.
          </p>
        </div>
      </section>
    </ContentShell>
  );
}
