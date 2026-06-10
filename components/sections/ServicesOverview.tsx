"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { StickySection } from "@/components/motion/StickySection";
import { SteelBeamIcon } from "@/components/ui/icons/SteelBeamIcon";
import { ColumnIcon } from "@/components/ui/icons/ColumnIcon";
import { StructuralFrameIcon } from "@/components/ui/icons/StructuralFrameIcon";
import { cn } from "@/lib/utils";

const SERVICES = [
  {
    href: "/services/structural-steel",
    title: "Structural Steel",
    description: "Building frames, beams, and load-bearing systems.",
    Icon: SteelBeamIcon,
  },
  {
    href: "/services/ornamental-steel",
    title: "Ornamental Steel",
    description: "Railings, gates, and custom architectural metalwork.",
    Icon: ColumnIcon,
  },
  {
    href: "/services/finishes",
    title: "Finishes",
    description: "Powder coat, galvanizing, and protective coatings.",
    Icon: StructuralFrameIcon,
  },
] as const;

export function ServicesOverview({ className }: { className?: string }) {
  return (
    <section
      className={cn("gradient-section py-16 md:py-20", className)}
      aria-labelledby="services-heading"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
          <StickySection>
            <div>
              <h2 id="services-heading" className="text-2xl font-bold text-foreground md:text-3xl">
                Our Services
              </h2>
              <p className="mt-2 text-foreground-muted">
                Full-service structural and ornamental steel fabrication across East Coast Florida
                and South Florida.
              </p>
              <p className="mt-8 hidden lg:block">
                <Link
                  href="/services"
                  className="font-medium text-steel-blue transition-colors hover:text-foreground"
                >
                  View all services
                </Link>
              </p>
            </div>
          </StickySection>

          <div className="mt-10 space-y-6 lg:mt-0">
            {SERVICES.map(({ href, title, description, Icon }, index) => (
              <Reveal key={href} y={20} delay={index * 0.08}>
                <Link
                  href={href}
                  className="group block rounded-lg border border-steel/30 bg-gunmetal/50 p-6 transition-colors hover:border-steel-blue/50 hover:bg-gunmetal"
                >
                  <Icon className="h-10 w-10 text-steel-blue" />
                  <h3 className="mt-4 font-semibold text-foreground group-hover:text-steel-blue">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-foreground-muted">{description}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        <p className="mt-8 lg:hidden">
          <Link
            href="/services"
            className="font-medium text-steel-blue transition-colors hover:text-foreground"
          >
            View all services
          </Link>
        </p>
      </div>
    </section>
  );
}
