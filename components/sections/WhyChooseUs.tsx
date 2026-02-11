import { cn } from "@/lib/utils";

const POINTS = [
  "17+ years of structural and ornamental steel experience",
  "Licensed and insured steel contractor in Florida",
  "Full-service fabrication: structural, ornamental, miscellaneous metals, and finishes",
  "Service area from St. Augustine to Miami",
  "Commercial, industrial, and custom projects",
] as const;

export function WhyChooseUs({ className }: { className?: string }) {
  return (
    <section className={cn("gradient-section py-16 md:py-20", className)} aria-labelledby="why-heading">
      <div className="container mx-auto px-4 md:px-6">
        <h2 id="why-heading" className="text-2xl font-bold text-foreground md:text-3xl">
          Why Choose Us
        </h2>
        <ul className="mt-8 space-y-4">
          {POINTS.map((point, i) => (
            <li key={i} className="flex gap-3 text-foreground-muted">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-steel-blue" aria-hidden />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
