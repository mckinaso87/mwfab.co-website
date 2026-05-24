import { SITE_URL } from "@/lib/site";

/**
 * Founder Person schema for About page.
 * TODO: Replace image and url when a public profile or headshot is available.
 */
export function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Ali McKinney",
    jobTitle: "Founder",
    worksFor: {
      "@type": "Organization",
      name: "McKinados Welding & Fabrication",
      url: SITE_URL,
    },
    image: "TODO_FOUNDER_IMAGE_URL",
    url: "TODO_FOUNDER_PROFILE_URL",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
