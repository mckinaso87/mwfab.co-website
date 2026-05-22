import { SITE_URL } from "@/lib/site";

/**
 * Founder Person schema for About page.
 * TODO: Replace name, jobTitle, image, and url with verified founder details.
 */
export function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "TODO_FOUNDER_NAME",
    jobTitle: "TODO_FOUNDER_TITLE",
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
