import type { Metadata } from "next";
import Image from "next/image";
import {
  SteelBeamIcon,
  ColumnIcon,
  WeldingSparkIcon,
  StructuralFrameIcon,
} from "@/components/ui/icons";

const SECTIONS = [
  {
    id: "structural",
    title: "Structural Steel",
    description:
      "We provide full-service structural steel construction for commercial and industrial projects across East Coast Florida. From building frames and load-bearing systems to beams and columns, our licensed team delivers precise, code-compliant structural steel fabrication. Whether you need a new build or an expansion, we handle design coordination, fabrication, and erection.",
    Icon: SteelBeamIcon,
    imageUrl: "/images/hero-placeholder.svg",
    imageWidth: 1200,
    imageHeight: 675,
  },
  {
    id: "ornamental",
    title: "Ornamental Steel",
    description:
      "Custom ornamental steel work including railings, gates, stairs, and architectural metalwork. We fabricate and install ornamental steel that meets both aesthetic and code requirements. Our ornamental steel services cover residential, commercial, and public projects throughout Florida.",
    Icon: ColumnIcon,
    imageUrl: "/images/hero-placeholder.svg",
    imageWidth: 1200,
    imageHeight: 675,
  },
  {
    id: "miscellaneous",
    title: "Miscellaneous Metals",
    description:
      "Miscellaneous metals fabrication: stairs, platforms, handrails, lintels, and specialty metalwork. We handle everything from small custom pieces to large-scale industrial installations. All work is fabricated to spec and installed by our experienced crew.",
    Icon: WeldingSparkIcon,
    imageUrl: "/images/hero-placeholder.svg",
    imageWidth: 1200,
    imageHeight: 675,
  },
  {
    id: "finishes",
    title: "Finishes",
    description:
      "Powder coating, galvanizing, and other protective finishes to extend the life and appearance of your steel. We coordinate finishes with your project requirements and offer options for both structural and ornamental steel. Finishes are applied in controlled environments for consistent quality.",
    Icon: StructuralFrameIcon,
    imageUrl: "/images/hero-placeholder.svg",
    imageWidth: 1200,
    imageHeight: 675,
  },
] as const;

export const metadata: Metadata = {
  title: "Services | Structural & Ornamental Steel | McKinados Welding & Fabrication",
  description:
    "Structural steel, ornamental steel, miscellaneous metals, and finishes. Licensed steel fabrication East Coast Florida. Powder coat, galvanizing.",
  openGraph: {
    title: "Services | McKinados Welding & Fabrication",
    description: "Structural steel, ornamental steel, miscellaneous metals, and finishes. East Coast Florida.",
    url: "https://mwfab.co/services",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services | McKinados Welding & Fabrication",
    description: "Structural steel, ornamental steel, miscellaneous metals, and finishes.",
  },
};

export default function ServicesPage() {
  return (
    <div className="bg-charcoal">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Our Services
        </h1>
        <p className="mt-4 text-lg text-foreground-muted">
          Structural and ornamental steel construction, miscellaneous metals, and finishes. Licensed steel contractor serving East Coast Florida.
        </p>
      </div>
      {SECTIONS.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="border-t border-steel/30 py-12 md:py-16"
          aria-labelledby={`${section.id}-heading`}
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
              <div>
                <section.Icon className="h-12 w-12 text-steel-blue" />
                <h2 id={`${section.id}-heading`} className="mt-4 text-2xl font-bold text-foreground md:text-3xl">
                  {section.title}
                </h2>
                <p className="mt-4 text-foreground-muted">{section.description}</p>
              </div>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-steel/30">
                <Image
                  src={section.imageUrl}
                  alt=""
                  width={section.imageWidth}
                  height={section.imageHeight}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
