"use client";

import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics";
import { isPromoConfigured, promoConfig } from "@/lib/promo";

type Status = "idle" | "submitting" | "success" | "error";

type Props = {
  /** Analytics tag + Formspree payload — e.g. "prepos-landing", "prepos-sidebar", "prepos-simulator". */
  source: string;
  /** Optional compact layout — single row, no fine-print line. */
  compact?: boolean;
  /** Optional CTA label override (default: from promoConfig). */
  ctaLabel?: string;
};

export function PromoEmailForm({ source, compact = false, ctaLabel }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isPromoConfigured()) return null;

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
        body: JSON.stringify({ email, source })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus("success");
      setEmail("");
      trackEvent("Promo Submit Success", { source });
    } catch {
      setStatus("error");
      setErrorMessage("Couldn’t reach the signup service. Try again in a moment.");
      trackEvent("Promo Submit Error", { source });
    }
  }

  if (status === "success") {
    return (
      <p className="promo-success" role="status">
        <Check size={16} aria-hidden="true" />
        {promoConfig.successMessage}
      </p>
    );
  }

  return (
    <>
      <form className={`promo-form ${compact ? "promo-form--compact" : ""}`} onSubmit={submit}>
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
        <button type="submit" className="promo-cta" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : ctaLabel ?? promoConfig.ctaLabel}
        </button>
      </form>
      {errorMessage ? (
        <p className="promo-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </>
  );
}
