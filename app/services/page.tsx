import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  SteelBeamIcon,
  ColumnIcon,
  StructuralFrameIcon,
} from "@/components/ui/icons";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { SERVICE_SLUGS, SERVICES } from "@/lib/services";

const HUB_SECTIONS = SERVICE_SLUGS.map((slug) => {
  const service = SERVICES[slug];
  return {
    id: service.hubAnchorId,
    title: service.title,
    hubBlurb: service.hubBlurb,
    href: `/services/${slug}`,
    heroImage: service.heroImage,
    Icon:
      slug === "structural-steel"
        ? SteelBeamIcon
        : slug === "ornamental-steel"
          ? ColumnIcon
          : StructuralFrameIcon,
  };
});

export const metadata: Metadata = {
  title: "Services | Structural & Ornamental Steel | McKinados Welding & Fabrication",
  description:
    "Structural steel, ornamental steel, and finishes. Licensed steel contractor on Florida's East Coast and in South Florida.",
  openGraph: {
    title: "Services | McKinados Welding & Fabrication",
    description:
      "Structural steel, ornamental steel, and finishes. East Coast and South Florida.",
    url: "https://mwfab.co/services",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services | McKinados Welding & Fabrication",
    description: "Structural steel, ornamental steel, and finishes.",
  },
};

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
        <section
          key={section.id}
          id={section.id}
          className="border-t border-steel/30 py-12 md:py-16"
          aria-labelledby={`${section.id}-heading`}
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
              <div>
                <section.Icon className="h-12 w-12 text-steel-blue" />
                <h2 id={`${section.id}-heading`} className="mt-4 text-2xl font-bold text-foreground md:text-3xl">
                  {section.title}
                </h2>
                <p className="mt-4 text-foreground-muted">{section.hubBlurb}</p>
                <p className="mt-4">
                  <Link
                    href={section.href}
                    className="font-medium text-steel-blue transition-colors hover:text-foreground"
                  >
                    Read full {section.title.toLowerCase()} overview
                  </Link>
                </p>
              </div>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-steel/30">
                <Image
                  src={section.heroImage}
                  alt={`${section.title} — McKinados Welding & Fabrication`}
                  width={1200}
                  height={675}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
