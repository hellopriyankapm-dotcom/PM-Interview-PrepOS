import type { Metadata } from "next";
import { ContentShell } from "@/components/ContentShell";

export const metadata: Metadata = {
  title: "Privacy — PrepOS",
  description:
    "What PrepOS collects (almost nothing), what it doesn't (your answers, your API keys, anything that identifies you), and the third parties involved.",
  alternates: { canonical: "/privacy" }
};

export default function PrivacyPage() {
  return (
    <ContentShell crumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]}>
      <header className="content-head">
        <span className="eyebrow">Privacy</span>
        <h1>What PrepOS collects, and what it doesn&apos;t</h1>
        <p className="content-lede">
          PrepOS is local-first. Almost everything stays in your browser. Here&apos;s the honest, plain-English version of who sees what.
        </p>
      </header>

      <section className="content-body">
        <div className="content-section">
          <h2>What stays in your browser only</h2>
          <ul className="bullet-list">
            <li>Your practice answers, scores, and rep history (localStorage).</li>
            <li>Your calibration: target level, weakest concepts, interview date, weekly hours, experience snapshot.</li>
            <li>Your simulator API keys (Anthropic, OpenAI, ElevenLabs, D-ID) when you use the voice mock. PrepOS never stores, transmits, or sees these — they&apos;re saved in this device&apos;s localStorage and sent directly to the provider from your browser.</li>
            <li>Your simulator preferences (provider choice, voice/video toggles).</li>
            <li>Whether you&apos;ve dismissed the Pro Pack early-access card.</li>
          </ul>
        </div>

        <div className="content-section">
          <h2>What we do measure (aggregate only)</h2>
          <p>
            PrepOS uses <a href="https://www.goatcounter.com" target="_blank" rel="noreferrer">GoatCounter</a>
            {" "}for aggregate, cookie-free, no-PII page-view analytics. That means a counter increments
            when a page loads — we see total visits, top pages, and a rough geographic / device breakdown.
            We <strong>do not</strong> see who you are, who you were before, or what you typed.
          </p>
          <p>
            We also count a handful of named events: <code>Pro Pack Click</code>,{" "}
            <code>Promo Submit Success</code>, <code>Promo Submit Error</code>,{" "}
            <code>Promo Dismiss</code>, <code>Open App</code>. These tell us whether the funnel is working.
          </p>
        </div>

        <div className="content-section">
          <h2>What we collect when you opt in</h2>
          <p>
            If you submit your email via any of the &quot;Notify me&quot; / &quot;Pro Pack early access&quot; forms,
            that email is sent to <a href="https://formspree.io" target="_blank" rel="noreferrer">Formspree</a>
            {" "}and forwarded to our inbox. Formspree&apos;s privacy policy applies to that submission. We use
            it to email you when Pro Pack ships. We don&apos;t resell it, share it, or send unrelated
            marketing.
          </p>
          <p>
            Each submission carries a <code>source</code> tag (e.g. <code>prepos-landing</code>,{" "}
            <code>prepos-sidebar</code>, <code>prepos-simulator</code>, <code>prepos-ai-pm-gate</code>) so we
            know which surface drove the signup. That tag does not identify you.
          </p>
        </div>

        <div className="content-section">
          <h2>Third parties</h2>
          <ul className="bullet-list">
            <li><strong>GitHub Pages</strong> hosts the static site. GitHub may log standard server-side request data per its policy.</li>
            <li><strong>Cloudflare</strong> serves DNS for the domain. Cloudflare may log DNS queries per its policy.</li>
            <li><strong>GoatCounter</strong> handles aggregate analytics (cookie-free, GDPR-compliant).</li>
            <li><strong>Formspree</strong> handles email-form submissions when you opt in.</li>
            <li>
              <strong>Anthropic / OpenAI / ElevenLabs / D-ID</strong> only if you use the voice-mock
              simulator and provide your own API keys. PrepOS doesn&apos;t proxy those calls — your browser
              talks directly to them. Their privacy policies and pricing apply.
            </li>
          </ul>
        </div>

        <div className="content-section">
          <h2>Cookies</h2>
          <p>
            PrepOS sets no cookies. GoatCounter doesn&apos;t set cookies. The only persistent client-side
            storage is <code>localStorage</code> for your in-product state — never sent over the network
            unless you explicitly submit a form.
          </p>
        </div>

        <div className="content-section">
          <h2>Your rights</h2>
          <p>
            To delete everything PrepOS stores about you in this browser, open DevTools → Application →
            Storage → Clear site data. To remove your email from our list, reply to any PrepOS email and
            ask — we&apos;ll delete it the same day.
          </p>
        </div>

        <div className="content-section">
          <h2>Changes to this policy</h2>
          <p>
            If this policy changes, we&apos;ll update the date below and note the change in the changelog.
            Last updated: 2026-05-06.
          </p>
        </div>

        <div className="content-section">
          <h2>Contact</h2>
          <p>
            Privacy questions, takedown requests, or anything else — email the address listed on the
            About page.
          </p>
        </div>
      </section>
    </ContentShell>
  );
}
