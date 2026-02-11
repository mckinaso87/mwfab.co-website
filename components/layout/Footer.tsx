import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function Footer() {
  return (
    <footer className="gradient-footer border-t border-steel/30 text-foreground-muted">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <p className="font-semibold text-foreground">
              McKinados Welding & Fabrication
            </p>
            <p className="mt-2 text-sm">
              Structural and ornamental steel construction. East Coast Florida —
              St. Augustine to Miami. Licensed and insured. 17+ years experience.
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
                  className="text-sm font-medium text-steel-blue transition-colors hover:text-foreground"
                >
                  Request a Bid
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-8 border-t border-steel/30 pt-8 text-sm">
          <p>
            Service area: East Coast Florida (St. Augustine to Miami). Licensed
            steel contractor Florida.
          </p>
        </div>
      </div>
    </footer>
  );
}
