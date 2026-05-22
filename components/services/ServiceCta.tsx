import { Button } from "@/components/ui/Button";

export function ServiceCta() {
  return (
    <section className="gradient-section py-12 md:py-16" aria-labelledby="service-cta-heading">
      <div className="container mx-auto px-4 text-center md:px-6">
        <h2 id="service-cta-heading" className="text-2xl font-bold text-foreground md:text-3xl">
          Request a bid
        </h2>
        <p className="mt-4 text-foreground-muted">
          Share your drawings and schedule. We respond with scope, license jurisdiction, and timing for
          licensed counties on Florida&apos;s East Coast and in South Florida.
        </p>
        <div className="mt-8">
          <Button href="/contact">Contact us</Button>
        </div>
      </div>
    </section>
  );
}
