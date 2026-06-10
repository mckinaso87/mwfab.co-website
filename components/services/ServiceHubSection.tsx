"use client";

import type { ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import {
  SteelBeamIcon,
  ColumnIcon,
  StructuralFrameIcon,
} from "@/components/ui/icons";

type ServiceIconKey = "structural-steel" | "ornamental-steel" | "finishes";

const ICONS: Record<ServiceIconKey, ComponentType<{ className?: string }>> = {
  "structural-steel": SteelBeamIcon,
  "ornamental-steel": ColumnIcon,
  finishes: StructuralFrameIcon,
};

type ServiceHubSectionProps = {
  id: string;
  title: string;
  hubBlurb: string;
  href: string;
  heroImage: string;
  iconKey: ServiceIconKey;
};

export function ServiceHubSection({
  id,
  title,
  hubBlurb,
  href,
  heroImage,
  iconKey,
}: ServiceHubSectionProps) {
  const Icon = ICONS[iconKey];
  return (
    <section
      id={id}
      className="border-t border-steel/30 py-12 md:py-16"
      aria-labelledby={`${id}-heading`}
    >
      <Reveal>
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div>
              <Icon className="h-12 w-12 text-steel-blue" />
              <h2 id={`${id}-heading`} className="mt-4 text-2xl font-bold text-foreground md:text-3xl">
                {title}
              </h2>
              <p className="mt-4 text-foreground-muted">{hubBlurb}</p>
              <p className="mt-4">
                <Link
                  href={href}
                  className="font-medium text-steel-blue transition-colors hover:text-foreground"
                >
                  Read full {title.toLowerCase()} overview
                </Link>
              </p>
            </div>
            <Parallax
              offset={20}
              className="relative aspect-video w-full overflow-hidden rounded-lg border border-steel/30"
            >
              <Image
                src={heroImage}
                alt={`${title}, McKinados Welding & Fabrication`}
                width={1200}
                height={675}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </Parallax>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
