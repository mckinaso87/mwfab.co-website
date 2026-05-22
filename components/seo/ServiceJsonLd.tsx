import { SITE_NAME, SITE_URL } from "@/lib/site";

interface ServiceJsonLdProps {
  serviceType: string;
  areaServed: string | { "@type": "AdministrativeArea"; name: string }[];
  url?: string;
}

export function ServiceJsonLd({ serviceType, areaServed, url }: ServiceJsonLdProps) {
  const served =
    typeof areaServed === "string"
      ? { "@type": "AdministrativeArea" as const, name: areaServed }
      : areaServed;

  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType,
    provider: {
      "@type": "LocalBusiness",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: served,
    ...(url ? { url } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
