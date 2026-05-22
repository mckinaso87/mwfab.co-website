import type { CountyMeta } from "@/lib/licenses";
import type { ProposalLicenseEntry } from "@/lib/licenses";
import { organizationJsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site";
import { ServiceJsonLd } from "./ServiceJsonLd";

interface CountyPageJsonLdProps {
  meta: CountyMeta;
  license: ProposalLicenseEntry;
}

export function CountyPageJsonLd({ meta, license }: CountyPageJsonLdProps) {
  const areaName = `${meta.displayName} County, Florida`;
  const countyUrl = absoluteUrl(`/service-areas/${meta.slug}`);

  const localBusiness = {
    "@context": "https://schema.org",
    ...organizationJsonLd(),
    url: countyUrl,
    areaServed: {
      "@type": "AdministrativeArea",
      name: areaName,
    },
    identifier: license.numbers.map((number) => ({
      "@type": "PropertyValue",
      propertyID: "ContractorLicense",
      name: license.county,
      value: number,
    })),
  };

  return (
    <>
      <ServiceJsonLd
        serviceType="Structural and ornamental steel construction"
        areaServed={areaName}
        url={countyUrl}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
    </>
  );
}
