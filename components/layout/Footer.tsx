import Link from "next/link";
import { PROPOSAL_LICENSES, formatLicenseLine, toCountySlug } from "@/lib/licenses";

const FOOTER_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export function Footer() {
  return (
    <footer className="gradient-footer border-t border-steel/30 text-foreground-muted">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 md:gap-12">
          <div>
            <p className="font-semibold text-foreground">
              McKinados Welding & Fabrication
            </p>
            <p className="mt-2 text-sm">
              Structural and ornamental steel construction. East Coast Florida and
              South Florida. Licensed and insured. 17+ years experience.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {FOOTER_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/contact"
                  className="text-sm font-medium text-accent-link transition-colors hover:text-foreground"
                >
                  Request a Bid
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <p className="font-semibold text-foreground">Licensed in</p>
            <ul className="mt-2 space-y-1 text-sm">
              {PROPOSAL_LICENSES.map((entry) => {
                const slug = toCountySlug(entry.county);
                return (
                  <li key={slug}>
                    <Link
                      href={`/service-areas/${slug}`}
                      className="transition-colors hover:text-foreground"
                    >
                      {formatLicenseLine(entry)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-steel/30 pt-8 text-sm">
          <p>
            Service area: licensed counties on Florida&apos;s East Coast and in South Florida.
          </p>
        </div>
      </div>
    </footer>
  );
}
