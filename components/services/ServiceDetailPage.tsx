import Image from "next/image";
import Link from "next/link";
import type { ServiceDefinition } from "@/lib/services";
import { licensedAreaServed } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ServiceJsonLd } from "@/components/seo/ServiceJsonLd";
import { ServiceGallery } from "./ServiceGallery";
import { publicPageMetadata } from "@/lib/metadata";
import { ServiceCta } from "./ServiceCta";

interface ServiceDetailPageProps {
  service: ServiceDefinition;
}

export function serviceMetadata(service: ServiceDefinition) {
  return publicPageMetadata({
    title: service.metadataTitle,
    description: service.metadataDescription,
    pathname: `/services/${service.slug}`,
  });
}

export function ServiceDetailPage({ service }: ServiceDetailPageProps) {
  const servicePath = `/services/${service.slug}`;

  return (
    <div className="bg-charcoal">
      <ServiceJsonLd
        serviceType={service.title}
        areaServed={licensedAreaServed()}
        url={absoluteUrl(servicePath)}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.title, path: servicePath },
        ]}
      />
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <p className="text-sm text-foreground-muted">
          <Link href="/services" className="text-steel-blue hover:text-foreground">
            Services
          </Link>
          <span aria-hidden className="mx-2">
            /
          </span>
          <span>{service.title}</span>
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {service.title}
        </h1>
        <div className="relative mt-8 aspect-video max-w-3xl overflow-hidden rounded-lg border border-steel/30">
          <Image
            src={service.heroImage}
            alt={`${service.title} — McKinados Welding & Fabrication`}
            width={1200}
            height={675}
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
        <div className="mt-10 max-w-3xl space-y-10 text-foreground-muted">
          {service.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-4">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
      <ServiceGallery folder={service.imageFolder} title={service.title} />
      <ServiceCta />
    </div>
  );
}
