/**
 * LocalBusiness + construction/contractor JSON-LD for SEO.
 * Rendered in root layout; single block, no duplicates.
 */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    name: "McKinados Welding & Fabrication",
    description:
      "Licensed structural and ornamental steel construction. East Coast Florida. 17+ years experience. Structural steel, ornamental steel, and finishes.",
    url: "https://mwfab.co",
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 28.5,
        longitude: -81,
      },
      geoRadius: "200000",
    },
    serviceArea: {
      "@type": "State",
      name: "Florida",
    },
    knowsAbout: [
      "Structural steel",
      "Ornamental steel",
      "Steel fabrication",
      "Steel construction",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
