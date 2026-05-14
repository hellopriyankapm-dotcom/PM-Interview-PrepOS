import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Compass,
  LineChart,
  RefreshCw,
  Sparkles,
  Target
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { OpenAppButton } from "@/components/OpenAppButton";
import { PromoOpenButton } from "@/components/PromoOpenButton";
import { PromoSlot } from "@/components/PromoSlot";
import { ThemeToggle } from "@/components/ThemeToggle";
import { faqs } from "@/lib/faqs";
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
    icon: <CheckCircle2 size={18} />,
    title: "Adaptive queue",
    body: "Every rep updates concept confidence so the queue keeps closing the gaps that matter most."
  },
  {
    icon: <RefreshCw size={18} />,
    title: "Source-aware question bank",
    body: "Every prompt carries a reviewer, source type, and citation. No fabricated company claims."
  }
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
          <MobileNav
            links={[
              { href: "#how", label: "How it works", external: true },
              { href: "#features", label: "Features", external: true },
              { href: "#scorecard", label: "Scorecard", external: true },
              { href: "#story", label: "Story", external: true },
              { href: "#faq", label: "FAQ", external: true }
            ]}
          />
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
            <Link href="/learn/ai-pm" className="btn hero-secondary-cta">
              <Sparkles size={16} /> Learn AI PM
            </Link>
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
      </section>

      <PromoSlot variant="landing" />

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
        <div className="section-head">
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
      </section>

      <section id="story" className="section-block">
        <div className="story-grid">
          <div className="section-head left">
            <span className="eyebrow">By a PM, for PMs</span>
            <h2>Built by an aspiring PM. For the PMs ready to be next.</h2>
            <p>
              PrepOS started as my own interview lab — built across multiple PM loops when generic prep
              guides and free question dumps stopped earning their keep. Same question bank, rubric, and
              adaptive queue I still run before every onsite.
            </p>
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
            <p className="landing-footer-contact">
              <a href="mailto:contact@pmprepos.com">contact@pmprepos.com</a>
            </p>
          </div>
          <div className="landing-footer-cols">
            <div>
              <strong>Product</strong>
              <Link href="/app">Open app</Link>
              <Link href="/questions">All questions</Link>
              <Link href="/concepts">Concepts</Link>
              <Link href="/rounds">Round types</Link>
              <Link href="/levels">Target levels</Link>
            </div>
            <div>
              <strong>Company</strong>
              <Link href="/about">About</Link>
              <Link href="/changelog">Changelog</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
        </div>
        <p className="landing-footer-fineprint">© PrepOS · Made for PM candidates.</p>
      </footer>
    </div>
  );
}
