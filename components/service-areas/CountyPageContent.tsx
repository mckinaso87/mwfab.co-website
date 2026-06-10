"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import type { CountyMeta, ProposalLicenseEntry } from "@/lib/licenses";
import { PROPOSAL_STATE_LICENSE } from "@/lib/licenses";
import { SERVICE_SLUGS, SERVICES } from "@/lib/services";
import { neighborSlug } from "@/lib/licenses";

type CountyPageContentProps = {
  meta: CountyMeta;
  license: ProposalLicenseEntry;
  citiesList: string;
};

export function CountyPageContent({ meta, license, citiesList }: CountyPageContentProps) {
  return (
    <div className="mt-8 max-w-3xl space-y-6 text-foreground-muted">
      <Reveal>
        <p className="rounded-lg border border-steel/30 bg-gunmetal/50 p-4 text-sm text-foreground">
          <span className="font-semibold">
            {PROPOSAL_STATE_LICENSE.label} · {PROPOSAL_STATE_LICENSE.number}
          </span>
          {". Also licensed locally in "}
          {meta.displayName} County: {license.numbers.join(" · ")}.
        </p>
      </Reveal>

      <Reveal>
        <p>
          McKinados Welding &amp; Fabrication provides structural steel, ornamental steel, and
          protective finishes for commercial and industrial projects in {meta.displayName} County.
          We routinely work in {citiesList} and across the Treasure Coast and South Florida where
          our license is active. East Coast Florida building codes, including wind-load and
          corrosion considerations, are part of every bid and submittal.
        </p>
      </Reveal>

      <Reveal>
        <section>
          <h2 className="text-xl font-semibold text-foreground">Services in this county</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            {SERVICE_SLUGS.map((slug) => {
              const service = SERVICES[slug];
              return (
                <li key={slug}>
                  <Link
                    href={`/services/${slug}`}
                    className="font-medium text-steel-blue hover:text-foreground"
                  >
                    {service.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </Reveal>

      {meta.neighboringCounties.length > 0 && (
        <Reveal>
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Neighboring counties we also serve
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              {meta.neighboringCounties.map((neighbor) => (
                <li key={neighbor}>
                  <Link
                    href={`/service-areas/${neighborSlug(neighbor)}`}
                    className="font-medium text-steel-blue hover:text-foreground"
                  >
                    {neighbor} County
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      )}

      <Reveal>
        <p>
          <Link
            href="/contact"
            className="font-medium text-steel-blue transition-colors hover:text-foreground"
          >
            Request a bid
          </Link>{" "}
          for work in {meta.displayName} County with your drawings and target schedule.
        </p>
      </Reveal>
    </div>
  );
}
