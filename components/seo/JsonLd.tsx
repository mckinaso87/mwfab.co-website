import { organizationJsonLd } from "@/lib/schema";

/**
 * Site-wide LocalBusiness + Organization JSON-LD for SEO and GEO.
 * Rendered once in root layout.
 */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    ...organizationJsonLd(),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
