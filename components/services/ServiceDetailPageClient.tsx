"use client";

import Image from "next/image";
import Link from "next/link";
import type { ServiceDefinition } from "@/lib/services";
import { licensedAreaServed } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ServiceJsonLd } from "@/components/seo/ServiceJsonLd";
import { ServiceGallery } from "./ServiceGallery";
import { ServiceCta } from "./ServiceCta";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";

interface ServiceDetailPageClientProps {
  service: ServiceDefinition;
}

export function ServiceDetailPageClient({ service }: ServiceDetailPageClientProps) {
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
        <Reveal>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {service.title}
          </h1>
        </Reveal>
        <Parallax
          offset={20}
          className="relative mt-8 aspect-video max-w-3xl overflow-hidden rounded-lg border border-steel/30"
        >
          <Image
            src={service.heroImage}
            alt={`${service.title}, McKinados Welding & Fabrication`}
            width={1200}
            height={675}
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </Parallax>
        <div className="mt-10 max-w-3xl space-y-10 text-foreground-muted">
          {service.sections.map((section) => (
            <Reveal key={section.heading}>
              <section>
                <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="mt-4">
                    {paragraph}
                  </p>
                ))}
              </section>
            </Reveal>
          ))}
        </div>
      </div>
      <ServiceGallery folder={service.imageFolder} title={service.title} />
      <ServiceCta />
    </div>
  );
}
