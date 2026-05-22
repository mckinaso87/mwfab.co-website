import type { Metadata } from "next";
import Link from "next/link";
import {
  PROPOSAL_LICENSES,
  formatLicenseLine,
  getCountyBySlug,
  toCountySlug,
} from "@/lib/licenses";

export const metadata: Metadata = {
  title: "Service Areas | Licensed Steel Contractor Counties | McKinados Welding & Fabrication",
  description:
    "Licensed structural and ornamental steel contractor in Miami-Dade, Broward, Palm Beach, Martin, Port St. Lucie, St. Lucie, and Indian River counties. East Coast and South Florida.",
  openGraph: {
    title: "Service Areas | McKinados Welding & Fabrication",
    description:
      "Licensed steel contractor counties on Florida's East Coast and in South Florida.",
    url: "https://mwfab.co/service-areas",
  },
  twitter: {
    card: "summary_large_image",
    title: "Service Areas | McKinados Welding & Fabrication",
    description: "Licensed counties for structural and ornamental steel in South Florida.",
  },
};

export default function ServiceAreasPage() {
  return (
    <div className="bg-charcoal">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Licensed service areas
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-foreground-muted">
          McKinados Welding &amp; Fabrication holds contractor licenses in seven Florida counties on
          the East Coast and in South Florida. Select a county for license numbers, cities served,
          and service details.
        </p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {PROPOSAL_LICENSES.map((entry) => {
            const slug = toCountySlug(entry.county);
            const meta = getCountyBySlug(slug);
            return (
              <li key={slug}>
                <article className="rounded-lg border border-steel/30 bg-gunmetal/50 p-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    <Link
                      href={`/service-areas/${slug}`}
                      className="text-steel-blue hover:text-foreground"
                    >
                      {meta?.displayName ?? entry.county} County
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-foreground-muted">{formatLicenseLine(entry)}</p>
                  {meta && <p className="mt-3 text-sm text-foreground-muted">{meta.shortBlurb}</p>}
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
      </div>
    </div>
  );
}
