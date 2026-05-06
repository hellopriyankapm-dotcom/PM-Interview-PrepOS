"use client";

import { Check, Sparkles } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics";
import { isPromoConfigured, promoConfig } from "@/lib/promo";

type Variant = "landing" | "sidebar";
type Status = "idle" | "submitting" | "success" | "error";

const PROMO_OPEN_EVENT = "prepos:promo:open";

export function PromoSlot({ variant }: { variant: Variant }) {
  const [dismissed, setDismissed] = useState(true);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem(promoConfig.dismissKey) === "true");

    function handleOpen() {
      setDismissed(false);
      setStatus("idle");
      setErrorMessage(null);
    }
    window.addEventListener(PROMO_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(PROMO_OPEN_EVENT, handleOpen);
  }, []);

  if (!isPromoConfigured()) return null;
  const anchorId = variant === "landing" ? "early-access" : undefined;
  if (dismissed) {
    return anchorId ? <span id={anchorId} className="promo-anchor" aria-hidden="true" /> : null;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const honeypot = (form.elements.namedItem("_gotcha") as HTMLInputElement | null)?.value;
    if (honeypot) return;

    setStatus("submitting");
    setErrorMessage(null);
    try {
      const response = await fetch(promoConfig.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, source: `prepos-${variant}` })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus("success");
      setEmail("");
      trackEvent("Promo Submit Success", { variant });
    } catch {
      setStatus("error");
      setErrorMessage("Couldn’t reach the signup service. Try again in a moment.");
      trackEvent("Promo Submit Error", { variant });
    }
  }

  function dismiss() {
    window.localStorage.setItem(promoConfig.dismissKey, "true");
    setDismissed(true);
    trackEvent("Promo Dismiss", { variant });
  }

  return (
    <aside
      id={anchorId}
      className={`promo-slot promo-slot--${variant}`}
      aria-label="PrepOS announcement"
    >
      <span className="promo-badge" aria-hidden="true">
        <Sparkles size={12} />
        Early access
      </span>
      <div className="promo-body">
        <div className="promo-head">
          <h3 className="promo-title">{promoConfig.title}</h3>
          <p className="promo-description">{promoConfig.description}</p>
        </div>
        {status === "success" ? (
          <p className="promo-success" role="status">
            <Check size={16} aria-hidden="true" />
            {promoConfig.successMessage}
          </p>
        ) : (
          <form className="promo-form" onSubmit={submit}>
            <input
              type="email"
              name="email"
              required
              placeholder="you@work.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={status === "submitting"}
              aria-label="Email address"
              autoComplete="email"
              className="promo-input"
            />
            <input
              type="text"
              name="_gotcha"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", height: 0, width: 0 }}
            />
            <button
              type="submit"
              className="promo-cta"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Sending…" : promoConfig.ctaLabel}
            </button>
          </form>
        )}
        {errorMessage ? (
          <p className="promo-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <div className="promo-actions">
          <p className="promo-fineprint">{promoConfig.fineprint}</p>
          <button type="button" className="link-btn promo-dismiss" onClick={dismiss}>
            Dismiss
          </button>
        </div>
      </div>
    </aside>
  );
}
