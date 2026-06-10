import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ServiceHubSection } from "@/components/services/ServiceHubSection";
import { publicPageMetadata } from "@/lib/metadata";
import { SERVICE_SLUGS, SERVICES } from "@/lib/services";

const HUB_SECTIONS = SERVICE_SLUGS.map((slug) => {
  const service = SERVICES[slug];
  return {
    id: service.hubAnchorId,
    title: service.title,
    hubBlurb: service.hubBlurb,
    href: `/services/${slug}`,
    heroImage: service.heroImage,
    iconKey: slug,
  };
});

export const metadata = publicPageMetadata({
  title: "Services | Structural & Ornamental Steel | McKinados Welding & Fabrication",
  description:
    "Structural steel, ornamental steel, and finishes. Licensed steel contractor on Florida's East Coast and in South Florida.",
  pathname: "/services",
});

export default function ServicesPage() {
  return (
    <div className="bg-charcoal">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ]}
      />
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Our Services
        </h1>
        <p className="mt-4 text-lg text-foreground-muted">
          Structural and ornamental steel construction, and protective finishes. Licensed steel
          contractor serving East Coast Florida and South Florida.
        </p>
      </div>
      {HUB_SECTIONS.map((section) => (
        <ServiceHubSection
          key={section.id}
          id={section.id}
          title={section.title}
          hubBlurb={section.hubBlurb}
          href={section.href}
          heroImage={section.heroImage}
          iconKey={section.iconKey}
        />
      ))}
    </div>
  );
}
