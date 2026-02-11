import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Hero({ className }: { className?: string }) {
  return (
    <section
      className={cn("gradient-hero relative overflow-hidden py-16 md:py-24 lg:py-32", className)}
      aria-label="Hero"
    >
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Structural & Ornamental Steel Construction for East Coast Florida
            </h1>
            <p className="mt-4 text-lg text-foreground-muted md:text-xl">
              Licensed steel contractor with 17+ years of experience. From St. Augustine to Miami — commercial, industrial, and custom steel fabrication.
            </p>
            <div className="mt-8">
              <Button href="/contact">Request a Bid</Button>
            </div>
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-md border border-steel/30">
            <Image
              src="/images/hero-placeholder.svg"
              alt=""
              width={1200}
              height={675}
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
