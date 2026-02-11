import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | McKinados Welding & Fabrication | Florida Steel Contractor",
  description:
    "McKinados Welding & Fabrication: 17+ years of structural and ornamental steel experience. Licensed and insured. Serving East Coast Florida from St. Augustine to Miami.",
  openGraph: {
    title: "About | McKinados Welding & Fabrication",
    description: "17+ years of structural and ornamental steel experience. Licensed and insured. East Coast Florida.",
    url: "https://mwfab.co/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About | McKinados Welding & Fabrication",
    description: "17+ years of structural and ornamental steel experience. East Coast Florida.",
  },
};

export default function AboutPage() {
  return (
    <div className="bg-charcoal">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          About McKinados Welding & Fabrication
        </h1>
        <div className="mt-8 max-w-3xl space-y-6 text-foreground-muted">
          <p className="text-lg">
            McKinados Welding & Fabrication is a licensed structural and ornamental steel contractor serving East Coast Florida. With over 17 years of experience, we deliver commercial, industrial, and custom steel fabrication from St. Augustine to Miami.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Experience & Capability
          </h2>
          <p>
            Our team specializes in structural steel construction, ornamental steel (railings, gates, architectural metalwork), miscellaneous metals, and protective finishes including powder coating and galvanizing. We work with developers, general contractors, and owners to meet code requirements and project schedules.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Licensed & Insured
          </h2>
          <p>
            We are licensed and insured to operate as a steel contractor in Florida. Our work is performed to industry standards and local building codes.
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Service Region
          </h2>
          <p>
            We serve East Coast Florida, including the greater Jacksonville, Daytona Beach, Orlando, Tampa, and South Florida corridors. From St. Augustine to Miami, we are available for structural steel Florida projects, ornamental steel Florida installations, and steel fabrication East Coast Florida contracts.
          </p>
        </div>
      </div>
    </div>
  );
}
