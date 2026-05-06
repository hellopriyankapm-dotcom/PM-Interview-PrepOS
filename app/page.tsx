import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Compass,
  LineChart,
  RefreshCw,
  Sparkles,
  Target,
  Timer
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { OpenAppButton } from "@/components/OpenAppButton";
import { PromoOpenButton } from "@/components/PromoOpenButton";
import { PromoSlot } from "@/components/PromoSlot";
import { ThemeToggle } from "@/components/ThemeToggle";
import questions from "@/content/questions/questions.json";
import concepts from "@/content/concepts/concepts.json";
import levels from "@/content/levels/levels.json";

const questionCount = questions.length;
const conceptCount = concepts.length;
const levelCount = Object.keys(levels).length;

const steps = [
  {
    icon: <Compass size={18} />,
    title: "Calibrate",
    body:
      "Tell PrepOS your target level, interview date, weekly hours, and weakest area. The plan re-tunes the moment any of those change."
  },
  {
    icon: <Brain size={18} />,
    title: "Practice",
    body:
      "An adaptive queue surfaces the highest-impact next rep. Coach mode builds skills; Interview mode pressure-tests them."
  },
  {
    icon: <LineChart size={18} />,
    title: "Improve",
    body:
      "A transparent six-axis scorecard names what worked, what to fix next, and the specific concept to revisit before the retry."
  }
];

const features = [
  {
    icon: <Target size={18} />,
    title: "Six target tracks",
    body: "APM, PM, Senior, Staff, AI PM, and PM-T — each with its own readiness bar and depth expectations."
  },
  {
    icon: <Sparkles size={18} />,
    title: "Five-mode coaching ladder",
    body: "Coach → Guided Practice → Light Feedback → Interview Practice → Maintenance. Support drops as mastery rises."
  },
  {
    icon: <CheckCircle2 size={18} />,
    title: "Concept mastery memory",
    body: "Every rep updates per-concept confidence so the queue keeps closing the gaps that matter."
  },
  {
    icon: <RefreshCw size={18} />,
    title: "Source-aware question bank",
    body: "Every prompt carries a reviewer, source type, and citation. No fabricated company claims."
  },
  {
    icon: <Timer size={18} />,
    title: "Date-aware urgency",
    body: "Within 10 days of your interview, PrepOS shifts toward harder, timed, interview-mode reps."
  }
];

const faqs = [
  {
    q: "Is PrepOS free?",
    a: "Yes. PrepOS is open source and runs in your browser. No account required."
  },
  {
    q: "Does it score answers with AI?",
    a: "MVP1 uses a transparent keyword-and-structure rubric. LLM-based scoring is on the roadmap and will be opt-in."
  },
  {
    q: "How fresh is the question bank?",
    a: `The bank ships with ${questionCount} reviewed prompts and is updated weekly. Every prompt has a reviewer name, source type, and (if applicable) citation.`
  },
  {
    q: "Who is PrepOS for?",
    a: "Candidates targeting APM, PM, Senior, Staff, AI PM, or PM-T loops at product-led companies."
  },
  {
    q: "Does my data leave the browser?",
    a: "No. State is local. PrepOS does not collect or transmit your answers."
  }
];

const sampleScores = [
  { label: "Structure", value: 4.2 },
  { label: "User insight", value: 3.8 },
  { label: "Metrics", value: 4.5 },
  { label: "Trade-offs", value: 3.4 },
  { label: "Communication", value: 4.0 },
  { label: "Level depth", value: 3.6 }
];

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Link href="/" className="landing-brand" aria-label="PrepOS home">
          <Logo size={28} withWordmark />
        </Link>
        <nav className="landing-nav-links" aria-label="Primary">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#scorecard">Scorecard</a>
          <a href="#story">Story</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="landing-nav-cta">
          <ThemeToggle />
          <PromoOpenButton />
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow hero-eyebrow">PM Interview Prep, Calibrated</span>
          <h1 className="hero-title">
            Know what to practice <em>next</em>,<br />
            not just what question to <em>answer</em>.
          </h1>
          <p className="hero-sub">
            PrepOS is an adaptive PM interview coach. Calibrate your target level, practice the highest-impact
            questions first, and track your readiness — all in your browser.
          </p>
          <div className="hero-actions">
            <OpenAppButton source="hero" />
          </div>
          <dl className="hero-stats">
            <div>
              <dt>Reviewed questions</dt>
              <dd>{questionCount}</dd>
            </div>
            <div>
              <dt>Tracked concepts</dt>
              <dd>{conceptCount}</dd>
            </div>
            <div>
              <dt>Target tracks</dt>
              <dd>{levelCount}</dd>
            </div>
            <div>
              <dt>Account required</dt>
              <dd>None</dd>
            </div>
          </dl>
        </div>
        <div className="hero-card" aria-hidden="true">
          <div className="hero-card-head">
            <span className="eyebrow">Adaptive queue</span>
            <span className="hero-card-chip">Senior PM · 7 days out</span>
          </div>
          <ul className="hero-card-list">
            <li className="hero-card-item active">
              <div>
                <strong>Improve activation for a personal finance app</strong>
                <p>Coach mode · close gap on success metrics</p>
              </div>
              <span className="hero-card-tag">Coach</span>
            </li>
            <li className="hero-card-item">
              <div>
                <strong>Choose metrics for a creator marketplace</strong>
                <p>Guided practice · north star + counter-metrics</p>
              </div>
              <span className="hero-card-tag warn">Guided</span>
            </li>
            <li className="hero-card-item">
              <div>
                <strong>Design evals for an AI support assistant</strong>
                <p>Interview mode · run timed, no scaffolding</p>
              </div>
              <span className="hero-card-tag accent">Interview</span>
            </li>
          </ul>
        </div>
      </section>

      <PromoSlot variant="landing" />

      <section className="strip">
        <div className="strip-inner">
          <span>Built for the loops that matter</span>
          <div className="strip-tags">
            <span>APM</span>
            <span>PM</span>
            <span>Senior PM</span>
            <span>Staff PM</span>
            <span>AI PM</span>
            <span>PM-T</span>
          </div>
        </div>
      </section>

      <section id="how" className="section-block">
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>From cold start to interview-ready in three loops.</h2>
          <p>
            PrepOS is not a question dump. It picks the next rep, adjusts how much support to give, and tells you
            exactly what to fix before the retry.
          </p>
        </div>
        <div className="step-grid">
          {steps.map((step, index) => (
            <article className="step-card" key={step.title}>
              <span className="step-index">0{index + 1}</span>
              <span className="step-icon">{step.icon}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="section-block alt">
        <div className="section-head">
          <span className="eyebrow">Why PrepOS</span>
          <h2>An interview coach with a memory and a method.</h2>
          <p>
            Most prep tools hand you questions. PrepOS hands you the right next question, then tells you whether your
            answer is at the target bar.
          </p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <span className="feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="scorecard" className="section-block">
        <div className="scorecard-grid">
          <div className="section-head left">
            <span className="eyebrow">Transparent feedback</span>
            <h2>Six axes, no black box.</h2>
            <p>
              Every answer is scored on structure, user insight, metrics, trade-offs, communication, and target-level
              depth — with a named strength and the single fastest improvement.
            </p>
            <Link className="btn-primary" href="/app">
              Try the scorecard <ArrowRight size={15} />
            </Link>
          </div>
          <article className="scorecard-preview" aria-hidden="true">
            <div className="scorecard-preview-head">
              <span className="eyebrow">Sample scorecard</span>
              <strong className="mono">3.9 / 5</strong>
            </div>
            <div className="scorecard-rows">
              {sampleScores.map((row) => (
                <div className="scorecard-row" key={row.label}>
                  <span>{row.label}</span>
                  <div className="scorecard-bar">
                    <span style={{ width: `${(row.value / 5) * 100}%` }} />
                  </div>
                  <strong className="mono">{row.value.toFixed(1)}</strong>
                </div>
              ))}
            </div>
            <div className="scorecard-note">
              <strong>Fastest next improvement</strong>
              <p>Anchor the answer in a sharper user segment and pain point, then state the trade-off explicitly.</p>
            </div>
          </article>
        </div>
      </section>

      <section id="story" className="section-block">
        <div className="story-grid">
          <div className="section-head left">
            <span className="eyebrow">By a PM, for PMs</span>
            <h2>Built by an aspiring PM. For the PMs ready to be next.</h2>
            <p>
              PrepOS started as my own interview lab — built across multiple PM loops when generic prep
              guides and free question dumps stopped earning their keep. Same question bank, rubric, and
              adaptive queue I still run before every onsite. Open-sourced so the next PM doesn&apos;t
              start from zero.
            </p>
            <p className="story-lead-quote">
              &ldquo;The tool I wish I&apos;d had the night before my first onsite — honest feedback, no
              marketing fluff, and the next rep always the right one. I still use it before every loop.&rdquo;
            </p>
            <span className="story-lead-attr">— Built and used by an aspiring PM</span>
          </div>
          <div className="story-cards">
            <article className="story-card">
              <span className="story-card-eyebrow">Principle 01</span>
              <h3>Honest by default</h3>
              <p>
                MVP1 ships with a transparent keyword-and-structure rubric. LLM scoring is on the roadmap and
                will always be opt-in. No black-box numbers.
              </p>
            </article>
            <article className="story-card">
              <span className="story-card-eyebrow">Principle 02</span>
              <h3>Source-aware questions</h3>
              <p>
                Every prompt names its reviewer and source type. No fabricated company claims, no scraped
                content from sources that disallow it.
              </p>
            </article>
            <article className="story-card">
              <span className="story-card-eyebrow">Principle 03</span>
              <h3>Local-first by design</h3>
              <p>
                Your answers, scores, and progress live in your browser. No account, no per-user
                tracking, no cookies. Aggregate page-view analytics only — used to understand demand,
                never to identify you.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="faq" className="section-block alt">
        <div className="section-head">
          <span className="eyebrow">FAQ</span>
          <h2>Straight answers about how PrepOS works.</h2>
        </div>
        <div className="faq-grid">
          {faqs.map((faq) => (
            <details className="faq-item" key={faq.q}>
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="cta-inner">
          <h2>Practice the rep that moves your readiness — not just any question.</h2>
          <OpenAppButton source="closing-cta" />
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <Logo size={24} withWordmark />
            <p>Adaptive PM interview prep. Local-first.</p>
          </div>
          <div className="landing-footer-cols">
            <div>
              <strong>Product</strong>
              <Link href="/app">Open app</Link>
              <a href="#how">How it works</a>
              <a href="#features">Features</a>
              <a href="#scorecard">Scorecard</a>
            </div>
          </div>
        </div>
        <p className="landing-footer-fineprint">© PrepOS · Made for PM candidates.</p>
      </footer>
    </div>
  );
}
