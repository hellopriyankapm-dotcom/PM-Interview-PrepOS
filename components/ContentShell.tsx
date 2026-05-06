import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PromoOpenButton } from "@/components/PromoOpenButton";
import { ThemeToggle } from "@/components/ThemeToggle";

type Crumb = { label: string; href?: string };

export function ContentShell({
  crumbs,
  children
}: {
  crumbs?: Crumb[];
  children: React.ReactNode;
}) {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Link href="/" className="landing-brand" aria-label="PrepOS home">
          <Logo size={28} withWordmark />
        </Link>
        <nav className="landing-nav-links" aria-label="Primary">
          <Link href="/questions">Questions</Link>
          <Link href="/concepts">Concepts</Link>
          <Link href="/rounds">Rounds</Link>
          <Link href="/levels">Levels</Link>
        </nav>
        <div className="landing-nav-cta">
          <ThemeToggle />
          <PromoOpenButton />
        </div>
      </header>

      <main className="content-shell">
        {crumbs && crumbs.length > 0 ? (
          <nav className="breadcrumbs" aria-label="Breadcrumbs">
            {crumbs.map((c, i) => (
              <span key={i}>
                {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
                {i < crumbs.length - 1 ? <span aria-hidden="true"> / </span> : null}
              </span>
            ))}
          </nav>
        ) : null}
        {children}
      </main>

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
