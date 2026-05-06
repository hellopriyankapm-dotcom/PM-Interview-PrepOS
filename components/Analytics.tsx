import Script from "next/script";
import { getAnalyticsConfig } from "@/lib/analytics";

export function Analytics() {
  const config = getAnalyticsConfig();

  if (config.provider === "goatcounter" && config.goatcounterDomain) {
    const endpoint = `https://${config.goatcounterDomain}.goatcounter.com/count`;
    return (
      <>
        <Script
          id="goatcounter-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.goatcounter={endpoint:${JSON.stringify(endpoint)}};`
          }}
        />
        <Script
          src="//gc.zgo.at/count.js"
          strategy="afterInteractive"
          data-goatcounter={endpoint}
        />
      </>
    );
  }

  if (config.provider === "plausible" && config.plausibleDomain) {
    return (
      <>
        <Script
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
          data-domain={config.plausibleDomain}
        />
        <Script
          id="plausible-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}`
          }}
        />
      </>
    );
  }

  if (config.provider === "umami" && config.umamiWebsiteId && config.umamiScriptUrl) {
    return (
      <Script
        src={config.umamiScriptUrl}
        strategy="afterInteractive"
        data-website-id={config.umamiWebsiteId}
      />
    );
  }

  return null;
}
