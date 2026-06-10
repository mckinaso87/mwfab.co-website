import Link from "next/link";
import { PersonJsonLd } from "@/components/seo/PersonJsonLd";
import {
  PROPOSAL_LICENSES,
  formatLicenseLine,
  formatStateLicenseLine,
  getCountyBySlug,
  toCountySlug,
} from "@/lib/licenses";
import { publicPageMetadata } from "@/lib/metadata";

export const metadata = publicPageMetadata({
  title: "About | McKinados Welding & Fabrication | Florida Steel Contractor",
  description:
    "McKinados Welding & Fabrication: 17+ years of structural and ornamental steel experience. Florida state licensed contractor with active operations on the East Coast and in South Florida.",
  pathname: "/about",
});

export default function AboutPage() {
  return (
    <div className="bg-charcoal">
      <PersonJsonLd />
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          About McKinados Welding & Fabrication
        </h1>
        <div className="mt-8 max-w-3xl space-y-6 text-foreground-muted">
          <p className="text-lg">
            McKinados Welding &amp; Fabrication is a licensed structural and ornamental steel contractor
            headquartered on Florida&apos;s East Coast. We have more than 17 years of experience delivering
            commercial, industrial, and custom steel fabrication—licensed statewide in Florida with active
            operations in the counties listed below.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Leadership</h2>
          <p>Founder: Ali McKinney</p>

          <h2 className="text-xl font-semibold text-foreground">Mission</h2>
          <p>
            We fabricate and install steel that meets the engineer&apos;s design and the owner&apos;s schedule—without
            shortcuts on weld quality, connection detailing, or permit documentation. Our mission is to be the
            contractor general contractors call when steel scope must be right the first time in Florida&apos;s
            coastal environment.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Experience &amp; capability</h2>
          <p>
            Our team specializes in structural steel construction, ornamental steel (railings, gates,
            architectural metalwork), and protective finishes including powder coating and galvanizing. We work
            with developers, general contractors, and owners to meet Florida Building Code requirements and
            project milestones.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Licensed &amp; insured</h2>
          <p>
            We hold Florida State Certified Contractor authority plus county-specific licenses where we
            maintain local presence. Our work is performed to AISC and project specifications under the
            structural engineer of record.
          </p>

          <section id="licenses">
            <h2 className="text-xl font-semibold text-foreground">Licenses &amp; Credentials</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li className="font-medium text-foreground">{formatStateLicenseLine()}</li>
              {PROPOSAL_LICENSES.map((entry) => {
                const slug = toCountySlug(entry.county);
                const meta = getCountyBySlug(slug);
                return (
                  <li key={slug}>
                    <Link
                      href={`/service-areas/${slug}`}
                      className="font-medium text-steel-blue hover:text-foreground"
                    >
                      {formatLicenseLine(entry)}
                    </Link>
                    {meta && (
                      <span className="text-foreground-muted">
                        {" "}
                        — {meta.displayName} County
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
