import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function CtaSection({ className }: { className?: string }) {
  return (
    <section className={cn("gradient-section py-16 md:py-20", className)} aria-labelledby="cta-heading">
      <div className="container mx-auto px-4 text-center md:px-6">
        <h2 id="cta-heading" className="text-2xl font-bold text-foreground md:text-3xl">
          Ready to Get Started?
        </h2>
        <p className="mt-4 text-foreground-muted">
          Request a bid for your structural or ornamental steel project. We serve East Coast Florida from St. Augustine to Miami.
        </p>
        <div className="mt-8">
          <Button href="/contact">Request a Bid</Button>
        </div>
      </div>
    </section>
  );
}
