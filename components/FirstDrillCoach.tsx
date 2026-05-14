"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

const SEEN_KEY = "prepos-first-drill-coach-seen-v1";

export function FirstDrillCoach() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(SEEN_KEY) !== "true") {
        setShow(true);
      }
    } catch {
      // localStorage unavailable — skip the tour; StorageWarning will surface it.
    }
  }, []);

  function dismiss() {
    setShow(false);
    try {
      window.localStorage.setItem(SEEN_KEY, "true");
    } catch {
      // ignore — we already set show=false for the session
    }
  }

  if (!show) return null;

  return (
    <aside className="first-drill-coach" role="region" aria-label="Quick tour">
      <div className="first-drill-coach-head">
        <span className="first-drill-coach-eyebrow">
          <Sparkles size={14} aria-hidden="true" />
          Quick tour
        </span>
        <button
          type="button"
          className="first-drill-coach-close"
          onClick={dismiss}
          aria-label="Dismiss tour"
        >
          <X size={14} />
        </button>
      </div>
      <ul>
        <li>
          <strong>Mode pills</strong> set how much guidance you get — start with Auto, switch to
          Interview when you want the room.
        </li>
        <li>
          <strong>Resources</strong> and <strong>AI Coach</strong> buttons next to the question
          surface hints when you&apos;re stuck.
        </li>
        <li>
          <strong>Voice mock</strong> (top of the drill panel) runs a live LLM simulation when
          you&apos;re ready to practice the real thing.
        </li>
      </ul>
      <button type="button" className="btn primary first-drill-coach-cta" onClick={dismiss}>
        Got it
      </button>
    </aside>
  );
}
