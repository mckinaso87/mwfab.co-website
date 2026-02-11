import { cn } from "@/lib/utils";

export function ServiceArea({ className }: { className?: string }) {
  return (
    <section className={cn("bg-charcoal py-12 md:py-16", className)} aria-labelledby="service-area-heading">
      <div className="container mx-auto px-4 md:px-6">
        <h2 id="service-area-heading" className="text-xl font-bold text-foreground md:text-2xl">
          Service Area
        </h2>
        <p className="mt-4 text-foreground-muted">
          East Coast Florida — from St. Augustine to Miami. We serve commercial, industrial, and custom clients throughout the region. Licensed and insured. 17+ years of steel fabrication and construction experience.
        </p>
      </div>
    </section>
  );
}
