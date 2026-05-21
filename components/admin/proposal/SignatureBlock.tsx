import { LETTERHEAD } from "./Letterhead";

type Props = {
  quotedBy: string | null;
};

export function SignatureBlock({ quotedBy }: Props) {
  const salesman = quotedBy?.trim() || "—";
  const lineClass =
    "mt-2 h-9 border-b border-foreground print:border-black";

  return (
    <section className="mt-10 border-t border-steel/50 pt-8 print:border-gray-300">
      <p className="text-sm leading-relaxed text-foreground print:text-black">
        Upon approval, this proposal becomes part of the binding contract between{" "}
        {LETTERHEAD.companyName} and the customer/company listed above. It also serves as the
        official scope of work for the project.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 text-sm sm:grid-cols-3 print:text-black">
        <div>
          <span className="text-foreground-muted print:text-gray-600">Accepted by</span>
          <div className={lineClass} />
        </div>
        <div>
          <span className="text-foreground-muted print:text-gray-600">Signature</span>
          <div className={lineClass} />
        </div>
        <div>
          <span className="text-foreground-muted print:text-gray-600">Date</span>
          <div className={lineClass} />
        </div>
      </div>
      <div className="mt-6 flex gap-2 text-sm print:text-black">
        <span className="text-foreground-muted print:text-gray-600">Salesman:</span>
        <span className="font-medium">{salesman}</span>
      </div>
    </section>
  );
}
