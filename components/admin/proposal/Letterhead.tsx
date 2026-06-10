// TODO: move to settings_company table when company profile settings exist.

export const LETTERHEAD = {
  companyName: "McKinado's Welding & Fabrication, LLC",
  addressLine1: "1733 SW Biltmore Street",
  addressLine2: "Port St Lucie, FL 34984",
  email: "sales@mwfab.co",
  office: "(772) 204-2932",
  mobile: "(772) 985-9533",
  fax: "(772) 345-1768",
} as const;

export const PROPOSAL_STATE_LICENSE = {
  jurisdiction: "Florida",
  label: "Florida State Certified",
  number: "SCC131154189",
} as const;

/** Shown at the end of Terms and Conditions (proposal preview, PDF). */
export const PROPOSAL_LICENSES = [
  { county: "Miami Dade", numbers: ["#10BS00296"] },
  { county: "Broward", numbers: ["CC#10-MM-17000", "CC#10-SS-16942-X"] },
  { county: "Palm Beach", numbers: ["#U21579"] },
  { county: "Martin", numbers: ["#MCSS6779"] },
  { county: "Port Saint Lucie", numbers: ["#11-11463"] },
  { county: "Saint Lucie", numbers: ["#26391"] },
  { county: "Indian River", numbers: ["#18904"] },
] as const;

/** Plain-text lines for PDF terms footer. */
export function proposalLicenseLines(): string[] {
  const stateLine = `${PROPOSAL_STATE_LICENSE.label}: ${PROPOSAL_STATE_LICENSE.number}`;
  const countyLines = PROPOSAL_LICENSES.map(
    (entry) => `${entry.county}: ${entry.numbers.join(" · ")}`
  );
  return [stateLine, ...countyLines];
}

export function Letterhead() {
  return (
    <div className="border-b-2 border-steel-blue/50 pb-6 print:border-gray-400">
      <div className="flex items-start justify-between gap-8">
        <div className="flex min-w-0 items-start gap-4">
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo/mwf-logo.png"
              alt="McKinados Welding & Fabrication"
              width={72}
              height={72}
              className="print:h-16 print:w-16"
            />
          </div>
          <p className="max-w-[280px] pt-1 text-lg font-bold leading-tight tracking-tight text-foreground print:text-black sm:text-xl">
            {LETTERHEAD.companyName}
          </p>
        </div>

        <div className="shrink-0 text-right text-xs leading-relaxed text-foreground-muted print:text-gray-700">
          <p>{LETTERHEAD.addressLine1}</p>
          <p>{LETTERHEAD.addressLine2}</p>
          <p className="pt-1">
            <a
              href={`mailto:${LETTERHEAD.email}`}
              className="font-medium text-steel-blue print:text-black hover:underline"
            >
              {LETTERHEAD.email}
            </a>
          </p>
          <p>Office: {LETTERHEAD.office}</p>
          <p>Mobile: {LETTERHEAD.mobile}</p>
          <p>Fax: {LETTERHEAD.fax}</p>
        </div>
      </div>
    </div>
  );
}
