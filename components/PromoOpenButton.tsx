"use client";

import { Sparkles } from "lucide-react";
import { promoConfig } from "@/lib/promo";

const PROMO_OPEN_EVENT = "prepos:promo:open";

export function PromoOpenButton() {
  function handleClick() {
    if (typeof window === "undefined") return;

    window.localStorage.removeItem(promoConfig.dismissKey);
    window.dispatchEvent(new Event(PROMO_OPEN_EVENT));

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = document.getElementById("early-access");
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => {
          const input = target.querySelector<HTMLInputElement>('input[type="email"]');
          input?.focus({ preventScroll: true });
        }, 650);
      });
    });
  }

  return (
    <button type="button" className="cta-promo" onClick={handleClick}>
      <Sparkles size={14} aria-hidden="true" />
      <span>Pro Pack early access</span>
    </button>
  );
}
