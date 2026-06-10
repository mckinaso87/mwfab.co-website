"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import {
  PROPOSAL_LICENSES,
  PROPOSAL_STATE_LICENSE,
  formatStateLicenseLine,
} from "@/lib/licenses";
import { PUBLIC_CONTACT_EMAIL } from "@/lib/site";

const INCLUDE_BULLETS = [
  "Scope of work (structural, ornamental, finishes, or repair)",
  "Drawings, dimensions, or a clear description of the steel package",
  "Target schedule or bid due date",
] as const;

export function ContactAside() {
  const countyCount = PROPOSAL_LICENSES.length;

  return (
    <Reveal>
      <aside className="space-y-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-foreground-muted">
            Florida State Certified · {PROPOSAL_STATE_LICENSE.number}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Request a Bid
          </h1>
          <p className="mt-4 text-lg text-foreground-muted">
            Tell us about your project and we will review scope, licensing jurisdiction, and
            schedule fit. After you submit, our team reviews your details and follows up with
            questions or a formal proposal.
          </p>
          {/* TODO: confirm response time with operations team */}
          <p className="mt-3 text-sm text-foreground-muted">
            Typical response: 1–2 business days.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            What to include
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
            {INCLUDE_BULLETS.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-steel-blue" aria-hidden>
                  ·
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-steel/40 bg-gunmetal/40 p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Licensed in
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">{formatStateLicenseLine()}</p>
          <p className="mt-2 text-sm text-foreground-muted">
            <Link href="/service-areas" className="text-steel-blue hover:text-foreground">
              +{countyCount} counties
            </Link>{" "}
            where we maintain local credentials and active operations.
          </p>
        </div>

        <div className="space-y-2 text-sm text-foreground-muted">
          <p>
            <span className="font-medium text-foreground">Email: </span>
            <a href={`mailto:${PUBLIC_CONTACT_EMAIL}`} className="text-steel-blue hover:text-foreground">
              {PUBLIC_CONTACT_EMAIL}
            </a>
          </p>
          <p>
            <span className="font-medium text-foreground">Phone: </span>
            {/* TODO: add public sales phone */}
            <span className="text-foreground-muted">Available on request</span>
          </p>
        </div>
      </aside>
    </Reveal>
  );
}
