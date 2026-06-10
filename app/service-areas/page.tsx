import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import {
  PROPOSAL_LICENSES,
  PROPOSAL_STATE_LICENSE,
  formatLicenseLine,
  getCountyBySlug,
  toCountySlug,
} from "@/lib/licenses";
import { publicPageMetadata } from "@/lib/metadata";

export const metadata = publicPageMetadata({
  title: "Service Areas | Licensed Steel Contractor Florida | McKinados Welding & Fabrication",
  description:
    "Florida State Certified Contractor license SCC131154189 authorizes work statewide. Active steel contracting operations in Miami-Dade, Broward, Palm Beach, Martin, Port St. Lucie, St. Lucie, and Indian River counties.",
  pathname: "/service-areas",
});

export default function ServiceAreasPage() {
  return (
    <div className="bg-charcoal">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Service areas", path: "/service-areas" },
        ]}
      />
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Licensed Across Florida
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-foreground-muted">
          McKinados Welding &amp; Fabrication holds Florida State Certified Contractor license{" "}
          {PROPOSAL_STATE_LICENSE.number}, which authorizes structural and ornamental steel work
          statewide. We also maintain county-specific licenses and focus active operations in the
          East Coast and South Florida counties listed below.
        </p>

        <section className="mt-10" aria-labelledby="statewide-license-heading">
          <h2 id="statewide-license-heading" className="text-xl font-semibold text-foreground">
            Statewide License
          </h2>
          <article className="mt-4 max-w-3xl rounded-lg border border-steel/30 bg-gunmetal/50 p-6">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {PROPOSAL_STATE_LICENSE.number}
            </p>
            <p className="mt-1 text-sm font-medium text-steel-blue">
              {PROPOSAL_STATE_LICENSE.label} Contractor
            </p>
            <p className="mt-4 text-foreground-muted">
              This Florida Department of Business and Professional Regulation state certified license
              authorizes our company to perform contractor work in all 67 Florida counties. County
              licenses below reflect where we maintain local credentials and operate today. They
              complement, not replace, statewide authority.
            </p>
          </article>
        </section>

        <section className="mt-12" aria-labelledby="active-service-areas-heading">
          <h2 id="active-service-areas-heading" className="text-xl font-semibold text-foreground">
            Active Service Areas
          </h2>
          <p className="mt-2 max-w-3xl text-foreground-muted">
            Where we operate today on Florida&apos;s East Coast and in South Florida, not a limit on
            where we are licensed to work statewide.
          </p>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {PROPOSAL_LICENSES.map((entry) => {
              const slug = toCountySlug(entry.county);
              const meta = getCountyBySlug(slug);
              return (
                <li key={slug}>
                  <article className="rounded-lg border border-steel/30 bg-gunmetal/50 p-6">
                    <h3 className="text-xl font-semibold text-foreground">
                      <Link
                        href={`/service-areas/${slug}`}
                        className="text-steel-blue hover:text-foreground"
                      >
                        {meta?.displayName ?? entry.county} County
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-foreground-muted">{formatLicenseLine(entry)}</p>
                    {meta && (
                      <p className="mt-3 text-sm text-foreground-muted">{meta.shortBlurb}</p>
                    )}
                    <p className="mt-4">
                      <Link
                        href={`/service-areas/${slug}`}
                        className="text-sm font-medium text-steel-blue hover:text-foreground"
                      >
                        View county details
                      </Link>
                    </p>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
