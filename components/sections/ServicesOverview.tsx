import Link from "next/link";
import { SteelBeamIcon } from "@/components/ui/icons/SteelBeamIcon";
import { ColumnIcon } from "@/components/ui/icons/ColumnIcon";
import { StructuralFrameIcon } from "@/components/ui/icons/StructuralFrameIcon";
import { cn } from "@/lib/utils";

const SERVICES = [
  {
    href: "/services#structural",
    title: "Structural Steel",
    description: "Building frames, beams, and load-bearing systems.",
    Icon: SteelBeamIcon,
  },
  {
    href: "/services#ornamental",
    title: "Ornamental Steel",
    description: "Railings, gates, and custom architectural metalwork.",
    Icon: ColumnIcon,
  },
  {
    href: "/services#finishes",
    title: "Finishes",
    description: "Powder coat, galvanizing, and protective coatings.",
    Icon: StructuralFrameIcon,
  },
] as const;

export function ServicesOverview({ className }: { className?: string }) {
  return (
    <section className={cn("gradient-section py-16 md:py-20", className)} aria-labelledby="services-heading">
      <div className="container mx-auto px-4 md:px-6">
        <h2 id="services-heading" className="text-2xl font-bold text-foreground md:text-3xl">
          Our Services
        </h2>
        <p className="mt-2 text-foreground-muted">
          Full-service structural and ornamental steel fabrication across East Coast Florida.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ href, title, description, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-lg border border-steel/30 bg-gunmetal/50 p-6 transition-colors hover:border-steel-blue/50 hover:bg-gunmetal"
            >
              <Icon className="h-10 w-10 text-steel-blue" />
              <h3 className="mt-4 font-semibold text-foreground group-hover:text-steel-blue">
                {title}
              </h3>
              <p className="mt-2 text-sm text-foreground-muted">{description}</p>
            </Link>
          ))}
        </div>
        <p className="mt-8">
          <Link
            href="/services"
            className="font-medium text-steel-blue transition-colors hover:text-foreground"
          >
            View all services
          </Link>
        </p>
      </div>
    </section>
  );
}
