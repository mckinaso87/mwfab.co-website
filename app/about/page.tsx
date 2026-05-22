import Link from "next/link";
import { PersonJsonLd } from "@/components/seo/PersonJsonLd";
import { PROPOSAL_LICENSES, getCountyBySlug, toCountySlug } from "@/lib/licenses";
import { publicPageMetadata } from "@/lib/metadata";

export const metadata = publicPageMetadata({
  title: "About | McKinados Welding & Fabrication | Florida Steel Contractor",
  description:
    "McKinados Welding & Fabrication: 17+ years of structural and ornamental steel experience. Licensed in seven South Florida and Treasure Coast counties.",
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
            serving East Coast Florida and South Florida. We have more than 17 years of experience delivering
            commercial, industrial, and custom steel fabrication in the counties where we hold active
            licenses.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Leadership</h2>
          <p>
            {/* TODO: Replace with founder full name. */}
            Founder: TODO_FOUNDER_NAME
            <br />
            {/* TODO: Replace with year the company was founded (e.g. 2008). */}
            Founded: TODO_YEAR_FOUNDED
          </p>

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

          <h2 className="text-xl font-semibold text-foreground">Certifications</h2>
          <ul className="list-disc space-y-2 pl-6">
            {/* TODO: Replace with actual certification names and numbers when confirmed. */}
            <li>TODO_CERTIFICATION_1</li>
            <li>TODO_CERTIFICATION_2</li>
            <li>TODO_CERTIFICATION_3</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">Licensed &amp; insured</h2>
          <p>
            We are licensed and insured to operate as a steel contractor in the Florida counties listed below.
            Our work is performed to AISC and project specifications under the structural engineer of record.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Counties we serve</h2>
          <p>
            Licensed work is available in these jurisdictions on the East Coast and in South Florida:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            {PROPOSAL_LICENSES.map((entry) => {
              const slug = toCountySlug(entry.county);
              const meta = getCountyBySlug(slug);
              return (
                <li key={slug}>
                  <Link
                    href={`/service-areas/${slug}`}
                    className="font-medium text-steel-blue hover:text-foreground"
                  >
                    {meta?.displayName ?? entry.county} County
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
