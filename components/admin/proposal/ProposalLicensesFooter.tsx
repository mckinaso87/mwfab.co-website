import { PROPOSAL_LICENSES, PROPOSAL_STATE_LICENSE } from "./Letterhead";

export function ProposalLicensesFooter() {
  return (
    <footer className="mt-10 border-t border-steel/50 pt-6 text-sm print:border-gray-300 print:text-black">
      <p className="font-semibold text-foreground print:text-black">Licenses</p>
      <p className="mt-2 font-semibold text-foreground print:text-black">
        {PROPOSAL_STATE_LICENSE.label}: {PROPOSAL_STATE_LICENSE.number}
      </p>
      <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2 print:grid-cols-2">
        {PROPOSAL_LICENSES.map((entry) => (
          <li
            key={entry.county}
            className="text-foreground-muted leading-relaxed print:text-gray-700"
          >
            <span className="font-medium text-foreground print:text-black">{entry.county}:</span>{" "}
            {entry.numbers.join(" · ")}
          </li>
        ))}
      </ul>
    </footer>
  );
}
