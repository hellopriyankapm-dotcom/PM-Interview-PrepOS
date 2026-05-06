import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/ContentShell";

export const metadata: Metadata = {
  title: "Terms — PrepOS",
  description:
    "PrepOS is a free, MIT-licensed PM interview prep tool provided as-is. Use at your own discretion; you're responsible for any third-party API costs you incur.",
  alternates: { canonical: "/terms" }
};

export default function TermsPage() {
  return (
    <ContentShell crumbs={[{ label: "Home", href: "/" }, { label: "Terms" }]}>
      <header className="content-head">
        <span className="eyebrow">Terms of use</span>
        <h1>Plain-English terms</h1>
        <p className="content-lede">
          PrepOS is free, MIT-licensed, and provided as-is. The full version is short — please read it.
        </p>
      </header>

      <section className="content-body">
        <div className="content-section">
          <h2>What you can do</h2>
          <ul className="bullet-list">
            <li>Use PrepOS for your PM interview practice, individually or as a team.</li>
            <li>
              Fork the repository, modify it, host it yourself. The source is{" "}
              <a href="https://github.com/hellopriyankapm-dotcom/PM-Interview-PrepOS" target="_blank" rel="noreferrer">on GitHub</a>{" "}
              under the MIT licence.
            </li>
            <li>Share screenshots, link to it, recommend it to peers.</li>
          </ul>
        </div>

        <div className="content-section">
          <h2>What you&apos;re responsible for</h2>
          <ul className="bullet-list">
            <li>
              <strong>Your API keys and the costs they incur.</strong> If you use the voice-mock
              simulator, you bring your own Anthropic / OpenAI / ElevenLabs / D-ID keys. PrepOS does not
              proxy those calls or bill you — your provider does.
            </li>
            <li>
              <strong>The accuracy of your practice.</strong> The rubric is open and structured but
              imperfect. PrepOS does not guarantee any specific interview outcome.
            </li>
            <li>
              <strong>Your data.</strong> Practice answers and scores live in your browser&apos;s
              localStorage. Clear it intentionally or accidentally — it&apos;s gone.
            </li>
          </ul>
        </div>

        <div className="content-section">
          <h2>What PrepOS doesn&apos;t do</h2>
          <ul className="bullet-list">
            <li>Bill you. (If Pro Pack launches as a paid tier, that&apos;ll be opt-in and clearly priced.)</li>
            <li>Sell or share your data — see the <Link href="/privacy">privacy policy</Link>.</li>
            <li>Promise an SLA, uptime, or response time. The site is statically hosted and free.</li>
            <li>Provide warranties of any kind.</li>
          </ul>
        </div>

        <div className="content-section">
          <h2>Liability</h2>
          <p>
            PrepOS and its maintainers are not liable for any direct, indirect, incidental, or
            consequential damages arising from your use of the tool. To the extent permitted by law,
            our maximum aggregate liability to you is zero — that&apos;s what &quot;free&quot; and
            &quot;as-is&quot; mean.
          </p>
        </div>

        <div className="content-section">
          <h2>Acceptable use</h2>
          <p>
            Don&apos;t scrape the site at abusive rates. Don&apos;t use PrepOS to harass anyone.
            Don&apos;t reupload the question bank to a paid product without attribution — the MIT
            licence covers code; treat the curated content with the courtesy you&apos;d expect for your
            own work.
          </p>
        </div>

        <div className="content-section">
          <h2>Changes</h2>
          <p>
            If these terms change materially, we&apos;ll note it in the changelog. By continuing to use
            PrepOS after a change, you accept the updated terms. Last updated: 2026-05-06.
          </p>
        </div>

        <div className="content-section">
          <h2>Governing law</h2>
          <p>
            These terms are governed by US law. If something doesn&apos;t hold up in your jurisdiction,
            the rest of the terms still apply.
          </p>
        </div>
      </section>
    </ContentShell>
  );
}
