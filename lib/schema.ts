import { PROPOSAL_LICENSES } from "@/lib/licenses";
import { SITE_NAME, SITE_URL, PUBLIC_CONTACT_EMAIL } from "@/lib/site";

export function licensedAreaServed() {
  return PROPOSAL_LICENSES.map((entry) => ({
    "@type": "AdministrativeArea" as const,
    name: `${entry.county} County, Florida`,
  }));
}

export function licenseIdentifiers() {
  const ids: { "@type": "PropertyValue"; propertyID: string; name: string; value: string }[] = [];
  for (const entry of PROPOSAL_LICENSES) {
    for (const number of entry.numbers) {
      ids.push({
        "@type": "PropertyValue",
        propertyID: "ContractorLicense",
        name: entry.county,
        value: number,
      });
    }
  }
  return ids;
}

export function organizationJsonLd() {
  return {
    "@type": ["LocalBusiness", "Organization", "ProfessionalService"],
    name: SITE_NAME,
    url: SITE_URL,
    email: PUBLIC_CONTACT_EMAIL,
    priceRange: "$$",
    // TODO: Replace with actual company founding year (ISO 8601 date, e.g. "2008-01-01").
    foundingDate: "TODO_FOUNDING_YEAR",
    // TODO: Replace streetAddress, addressLocality, addressRegion, postalCode with verified NAP.
    address: {
      "@type": "PostalAddress",
      streetAddress: "TODO_STREET_ADDRESS",
      addressLocality: "TODO_CITY",
      addressRegion: "FL",
      postalCode: "TODO_ZIP",
      addressCountry: "US",
    },
    // TODO: Replace with primary business phone (E.164 or national format).
    telephone: "TODO_TELEPHONE",
    areaServed: licensedAreaServed(),
    identifier: licenseIdentifiers(),
    knowsAbout: [
      "Structural steel",
      "Ornamental steel",
      "Steel fabrication",
      "Steel construction",
      "Powder coating",
      "Hot-dip galvanizing",
    ],
    description:
      "Licensed structural and ornamental steel contractor serving East Coast Florida and South Florida. 17+ years experience.",
    // TODO: Replace each URL when profiles are live.
    sameAs: [
      "TODO_GOOGLE_BUSINESS_PROFILE_URL",
      "TODO_FACEBOOK_URL",
      "TODO_INSTAGRAM_URL",
      "TODO_BBB_URL",
    ],
  };
}
