"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { isPromoConfigured, promoConfig } from "@/lib/promo";
import { PromoEmailForm } from "@/components/PromoEmailForm";

type Variant = "landing" | "sidebar";

const PROMO_OPEN_EVENT = "prepos:promo:open";

export function PromoSlot({ variant }: { variant: Variant }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem(promoConfig.dismissKey) === "true");

    function handleOpen() {
      setDismissed(false);
    }
    window.addEventListener(PROMO_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(PROMO_OPEN_EVENT, handleOpen);
  }, []);

  if (!isPromoConfigured()) return null;
  const anchorId = variant === "landing" ? "early-access" : undefined;
  if (dismissed) {
    return anchorId ? <span id={anchorId} className="promo-anchor" aria-hidden="true" /> : null;
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
        <PromoEmailForm source={`prepos-${variant}`} />
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
