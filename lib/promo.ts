export type PromoConfig = {
  enabled: boolean;
  formEndpoint: string;
  title: string;
  description: string;
  ctaLabel: string;
  successMessage: string;
  fineprint: string;
  dismissKey: string;
};

export const promoConfig: PromoConfig = {
  enabled: process.env.NEXT_PUBLIC_PROMO_ENABLED === "true",
  formEndpoint: process.env.NEXT_PUBLIC_PROMO_FORM_ENDPOINT ?? "",
  title: process.env.NEXT_PUBLIC_PROMO_TITLE ?? "Pro Pack — coming soon",
  description:
    process.env.NEXT_PUBLIC_PROMO_DESCRIPTION ??
    "AI PM interview questions, extra question banks, expert-answer library, premium personas. Get early-access pricing.",
  ctaLabel: process.env.NEXT_PUBLIC_PROMO_CTA_LABEL ?? "Notify me",
  successMessage:
    process.env.NEXT_PUBLIC_PROMO_SUCCESS ?? "Thanks — we’ll email you when Pro launches.",
  fineprint:
    process.env.NEXT_PUBLIC_PROMO_FINEPRINT ?? "No spam. One email at launch, that’s it.",
  dismissKey: "prepos-promo-dismissed-v1"
};

export function isPromoConfigured(): boolean {
  return promoConfig.enabled && promoConfig.formEndpoint.length > 0;
}
