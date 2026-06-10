"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { PROPOSAL_STATE_LICENSE } from "@/lib/licenses";
import { cn } from "@/lib/utils";

const PILLS = [
  {
    label: `Florida State Licensed · ${PROPOSAL_STATE_LICENSE.number}`,
    href: "/about#licenses" as const,
  },
  { label: "17+ Years Experience", href: null },
  { label: "Serving All of Florida", href: null },
] as const;

export function TrustStrip({ className }: { className?: string }) {
  return (
    <section
      className={cn("border-b border-steel/30 bg-charcoal py-4", className)}
      aria-label="Credentials"
    >
      <Reveal y={12}>
        <div className="container mx-auto px-4 md:px-6">
          <ul className="flex flex-wrap items-center justify-center gap-3">
            {PILLS.map((pill) => (
              <li key={pill.label}>
                {pill.href ? (
                  <Link
                    href={pill.href}
                    className="inline-block rounded-full border border-steel/50 bg-gunmetal/50 px-4 py-2 text-xs font-medium tracking-wide text-foreground transition-colors hover:border-steel-blue/50 hover:text-steel-blue"
                  >
                    {pill.label}
                  </Link>
                ) : (
                  <span className="inline-block rounded-full border border-steel/50 bg-gunmetal/50 px-4 py-2 text-xs font-medium tracking-wide text-foreground-muted">
                    {pill.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
