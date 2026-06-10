import Link from "next/link";
import { publicPageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import { CountyPageContent } from "@/components/service-areas/CountyPageContent";
import { getCountyBySlug, getLicenseBySlug, licensedCountySlugs } from "@/lib/licenses";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { CountyPageJsonLd } from "@/components/seo/CountyPageJsonLd";

interface CountyPageProps {
  params: Promise<{ county: string }>;
}

export function generateStaticParams() {
  return licensedCountySlugs().map((county) => ({ county }));
}

export async function generateMetadata({ params }: CountyPageProps) {
  const { county } = await params;
  const meta = getCountyBySlug(county);
  const license = getLicenseBySlug(county);
  if (!meta || !license) {
    return { title: "Service area | McKinados Welding & Fabrication" };
  }

  const title = `Steel Contractor ${meta.displayName} County FL | McKinados Welding & Fabrication`;
  const description = `Licensed structural and ornamental steel contractor in ${meta.displayName} County, Florida. License ${license.numbers.join(", ")}. Serving ${meta.majorCities.slice(0, 3).join(", ")} and South Florida.`;

  return publicPageMetadata({
    title,
    description,
    pathname: `/service-areas/${county}`,
  });
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

        <CountyPageContent meta={meta} license={license} citiesList={citiesList} />
      </div>
    </div>
  );
}
