import { faqs } from "@/lib/faqs";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export function StructuredData() {
  const blocks = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon-48.png`
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: `${SITE_NAME} — Adaptive PM Interview Prep`,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      url: `${SITE_URL}/app`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Adaptive PM interview simulator. Practice the highest-impact rep for your target level, with open rubrics and a learning queue that tracks 18 concepts across 6 PM interview round types."
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a }
      }))
    }
  ];

  return (
    <>
      {blocks.map((b, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }}
        />
      ))}
    </>
  );
}
