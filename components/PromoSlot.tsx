"use client";

import { useEffect, useState, type FormEvent } from "react";
import { isPromoConfigured, promoConfig } from "@/lib/promo";

type Variant = "landing" | "sidebar";
type Status = "idle" | "submitting" | "success" | "error";

export function PromoSlot({ variant }: { variant: Variant }) {
  const [dismissed, setDismissed] = useState(true);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem(promoConfig.dismissKey) === "true");
  }, []);

  if (!isPromoConfigured() || dismissed) return null;

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
    } catch {
      setStatus("error");
      setErrorMessage("Couldn’t reach the signup service. Try again in a moment.");
    }
  }

  function dismiss() {
    window.localStorage.setItem(promoConfig.dismissKey, "true");
    setDismissed(true);
  }

  return (
    <aside className={`panel promo-slot promo-slot--${variant}`} aria-label="PrepOS announcement">
      <div className="panel-header">
        <h3>{promoConfig.title}</h3>
        <p>{promoConfig.description}</p>
      </div>
      {status === "success" ? (
        <p className="promo-success" role="status">
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
            className="mode-pill active"
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
        <button type="button" className="link-btn" onClick={dismiss}>
          Dismiss
        </button>
      </div>
    </aside>
  );
}
