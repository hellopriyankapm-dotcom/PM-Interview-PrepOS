import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/ContentShell";

export const metadata: Metadata = {
  title: "About — PrepOS",
  description:
    "PrepOS started as one aspiring PM's personal interview lab — built across multiple PM loops, used before every onsite, open-sourced so the next PM doesn't start from zero.",
  alternates: { canonical: "/about" }
};

export default function AboutPage() {
  return (
    <ContentShell crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}>
      <header className="content-head">
        <span className="eyebrow">About</span>
        <h1>Built by an aspiring PM. Used by one too.</h1>
        <p className="content-lede">
          The honest version of why PrepOS exists, what it is, and what it isn&apos;t.
        </p>
      </header>

      <section className="content-body">
        <div className="content-section">
          <h2>The story</h2>
          <p>
            PrepOS started as my own interview lab — built across multiple PM loops when generic prep
            guides and free question dumps stopped earning their keep. I needed a tool that picked the
            highest-impact next rep instead of dumping a flat 200-question list and asking me to
            self-prioritise. Nothing on the market did that, so I built it.
          </p>
          <p>
            I still run the same question bank, the same rubric, and the same adaptive queue before
            every onsite. The Story principle on the landing page isn&apos;t marketing copy — it&apos;s
            literally what I do at 9 PM the night before a loop.
          </p>
        </div>

        <div className="content-section">
          <h2>What PrepOS is</h2>
          <ul className="bullet-list">
            <li>
              An adaptive PM interview prep tool calibrated for APM, PM, Senior, Staff, AI PM, and
              PM-T loops.
            </li>
            <li>250 reviewed PM interview questions across 6 round types.</li>
            <li>18 tracked PM concepts mapped to the rounds that test them.</li>
            <li>Open rubrics — keyword + structure scoring you can read and improve.</li>
            <li>
              A real voice-mock simulator with BYO API keys for Anthropic Claude or OpenAI ChatGPT,
              optional ElevenLabs lifelike voice, and optional D-ID real-video mode.
            </li>
            <li>Local-first. Your answers and progress live in your browser.</li>
            <li>Free to use.</li>
          </ul>
        </div>

        <div className="content-section">
          <h2>What PrepOS isn&apos;t</h2>
          <ul className="bullet-list">
            <li>A guarantee of an offer. Practice helps, structure helps, real reps help — but no tool can give you signal you didn&apos;t earn.</li>
            <li>A coaching marketplace. There&apos;s no human PM coach behind the scenes. Just a calibrated rubric and a real conversation with an LLM persona.</li>
            <li>A blackbox. The rubric is in the open, the question bank is in the open, the source is on GitHub.</li>
            <li>A data harvester. We measure aggregate visits to understand demand, never per-user behaviour. See <Link href="/privacy">privacy policy</Link>.</li>
          </ul>
        </div>

        <div className="content-section">
          <h2>What&apos;s coming in Pro Pack</h2>
          <p>
            Pro Pack is the paid tier — currently in early-access signup. The pitch:
          </p>
          <ul className="bullet-list">
            <li>AI PM interview question bank (a different round bundle: eval design, hallucination mitigation, cost / latency trade-offs, human-fallback design).</li>
            <li>Extra question banks beyond the 250 that ship in the free tier.</li>
            <li>Expert-answer library — full worked solutions to the highest-frequency questions, with rubric annotations.</li>
            <li>Premium interviewer personas for the voice mock.</li>
            <li>Optionally: managed API keys (we run the LLM / voice / video so you don&apos;t need to BYO).</li>
          </ul>
          <p>
            <Link href="/#early-access">Drop your email</Link> on the landing page or anywhere you see a
            Pro Pack card to be notified when it launches.
          </p>
        </div>

        <div className="content-section">
          <h2>Get in touch</h2>
          <p>
            Privacy questions, partnership ideas, found a bug, want to recommend a question for the
            bank, or just want to say hi — open an issue on{" "}
            <a href="https://github.com/hellopriyankapm-dotcom/PM-Interview-PrepOS/issues" target="_blank" rel="noreferrer">
              GitHub
            </a>
            , or reply to any PrepOS email.
          </p>
        </div>

        <div className="content-section">
          <h2>Trust signals</h2>
          <ul className="bullet-list">
            <li>Source code: <a href="https://github.com/hellopriyankapm-dotcom/PM-Interview-PrepOS" target="_blank" rel="noreferrer">GitHub</a> · MIT-licensed</li>
            <li><Link href="/privacy">Privacy policy</Link> · <Link href="/terms">Terms of use</Link></li>
            <li><Link href="/changelog">Changelog</Link> · weekly shipping cadence</li>
            <li><Link href="/questions">All 250 questions</Link> · <Link href="/concepts">All 18 concepts</Link> · <Link href="/rounds">All 6 rounds</Link> · <Link href="/levels">All 6 target levels</Link></li>
          </ul>
        </div>
      </section>
    </ContentShell>
  );
}
