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
