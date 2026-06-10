"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { PROPOSAL_STATE_LICENSE } from "@/lib/licenses";
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
            <p className="text-xs font-medium uppercase tracking-widest text-foreground-muted">
              Florida State Certified Contractor · {PROPOSAL_STATE_LICENSE.number}
            </p>
            <Reveal y={16} delay={0}>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                Structural & Ornamental Steel, Built in Florida
              </h1>
            </Reveal>
            <Reveal y={16} delay={0.08}>
              <p className="mt-4 text-lg text-foreground-muted md:text-xl">
                Licensed statewide in Florida. 17+ years building structural and ornamental steel,
                headquartered on the East Coast, available across Florida for qualifying projects.
              </p>
            </Reveal>
            <Reveal y={16} delay={0.16}>
              <div className="mt-8">
                <Button href="/contact">Request a Bid</Button>
              </div>
            </Reveal>
          </div>
          <Parallax offset={24} className="relative aspect-video w-full overflow-hidden rounded-md border border-steel/30">
            <Image
              src="/images/hero.png"
              alt="Steel fabrication team and structural steel frame"
              width={1024}
              height={768}
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </Parallax>
        </div>
      </div>
    </section>
  );
}
