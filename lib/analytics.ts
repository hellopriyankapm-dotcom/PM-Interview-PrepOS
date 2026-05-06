// Provider-agnostic analytics shim.
//
// Default OFF. Set one of the NEXT_PUBLIC_*_ANALYTICS env vars to enable a
// provider. The trackEvent() helper is a no-op until a provider script
// loads on the window.
//
// Supported providers (priority order — first one configured wins):
//   - GoatCounter   (NEXT_PUBLIC_GOATCOUNTER_DOMAIN)   recommended free tier
//   - Plausible     (NEXT_PUBLIC_PLAUSIBLE_DOMAIN)
//   - Umami         (NEXT_PUBLIC_UMAMI_WEBSITE_ID + NEXT_PUBLIC_UMAMI_SCRIPT_URL)

export type AnalyticsProvider = "goatcounter" | "plausible" | "umami" | "none";

export type AnalyticsConfig = {
  provider: AnalyticsProvider;
  goatcounterDomain?: string;
  plausibleDomain?: string;
  umamiWebsiteId?: string;
  umamiScriptUrl?: string;
};

export function getAnalyticsConfig(): AnalyticsConfig {
  const goatcounterDomain = process.env.NEXT_PUBLIC_GOATCOUNTER_DOMAIN ?? "";
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "";
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ?? "";
  const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ?? "";

  let provider: AnalyticsProvider = "none";
  if (goatcounterDomain) provider = "goatcounter";
  else if (plausibleDomain) provider = "plausible";
  else if (umamiWebsiteId && umamiScriptUrl) provider = "umami";

  return {
    provider,
    goatcounterDomain,
    plausibleDomain,
    umamiWebsiteId,
    umamiScriptUrl
  };
}

type GoatCounter = {
  count: (opts: { path?: string; title?: string; event?: boolean }) => void;
};

type Plausible = (eventName: string, options?: { props?: Record<string, string | number> }) => void;

type Umami = {
  track: (eventName: string, props?: Record<string, string | number>) => void;
};

type AnalyticsWindow = Window & {
  goatcounter?: GoatCounter;
  plausible?: Plausible;
  umami?: Umami;
};

export function trackEvent(name: string, props?: Record<string, string | number>): void {
  if (typeof window === "undefined") return;
  const w = window as AnalyticsWindow;

  try {
    if (w.goatcounter?.count) {
      w.goatcounter.count({ path: name, event: true });
      return;
    }
    if (typeof w.plausible === "function") {
      w.plausible(name, props ? { props } : undefined);
      return;
    }
    if (w.umami?.track) {
      w.umami.track(name, props);
      return;
    }
  } catch {
    // Analytics must never throw into product code.
  }
}
