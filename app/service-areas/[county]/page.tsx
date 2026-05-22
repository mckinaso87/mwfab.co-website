import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatLicenseLine,
  getCountyBySlug,
  getLicenseBySlug,
  licensedCountySlugs,
  neighborSlug,
} from "@/lib/licenses";
import { SERVICE_SLUGS, SERVICES } from "@/lib/services";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { CountyPageJsonLd } from "@/components/seo/CountyPageJsonLd";

interface CountyPageProps {
  params: Promise<{ county: string }>;
}

export function generateStaticParams() {
  return licensedCountySlugs().map((county) => ({ county }));
}

export async function generateMetadata({ params }: CountyPageProps): Promise<Metadata> {
  const { county } = await params;
  const meta = getCountyBySlug(county);
  const license = getLicenseBySlug(county);
  if (!meta || !license) {
    return { title: "Service area | McKinados Welding & Fabrication" };
  }

  const title = `Steel Contractor ${meta.displayName} County FL | McKinados Welding & Fabrication`;
  const description = `Licensed structural and ornamental steel contractor in ${meta.displayName} County, Florida. License ${license.numbers.join(", ")}. Serving ${meta.majorCities.slice(0, 3).join(", ")} and South Florida.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mwfab.co/service-areas/${county}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CountyServiceAreaPage({ params }: CountyPageProps) {
  const { county } = await params;
  const meta = getCountyBySlug(county);
  const license = getLicenseBySlug(county);

  if (!meta || !license) {
    notFound();
  }

  const citiesList =
    meta.majorCities.length > 1
      ? `${meta.majorCities.slice(0, -1).join(", ")}, and ${meta.majorCities[meta.majorCities.length - 1]}`
      : meta.majorCities[0];

  return (
    <div className="bg-charcoal">
      <CountyPageJsonLd meta={meta} license={license} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Service areas", path: "/service-areas" },
          { name: `${meta.displayName} County`, path: `/service-areas/${county}` },
        ]}
      />
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <p className="text-sm text-foreground-muted">
          <Link href="/service-areas" className="text-steel-blue hover:text-foreground">
            Service areas
          </Link>
          <span aria-hidden className="mx-2">
            /
          </span>
          <span>{meta.displayName} County</span>
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Steel Contractor in {meta.displayName} County, Florida
        </h1>

        <div className="mt-8 max-w-3xl space-y-6 text-foreground-muted">
          <p className="rounded-lg border border-steel/30 bg-gunmetal/50 p-4 text-sm text-foreground">
            <span className="font-semibold">Contractor license: </span>
            {formatLicenseLine(license)}
          </p>

          <p>
            McKinados Welding &amp; Fabrication provides structural steel, ornamental steel, and
            protective finishes for commercial and industrial projects in {meta.displayName} County.
            We routinely work in {citiesList} and across the Treasure Coast and South Florida where
            our license is active. East Coast Florida building codes, including wind-load and
            corrosion considerations, are part of every bid and submittal.
          </p>

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

          {meta.neighboringCounties.length > 0 && (
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
          )}

          <p>
            <Link
              href="/contact"
              className="font-medium text-steel-blue transition-colors hover:text-foreground"
            >
              Request a bid
            </Link>{" "}
            for work in {meta.displayName} County with your drawings and target schedule.
          </p>
        </div>
      </div>
    </div>
  );
}
