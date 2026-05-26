/** Indented customer note below a proposal line item. */
export function ProposalLineCustomerNote({ text }: { text: string }) {
  return (
    <p className="ml-8 -mt-1 mb-2 border-l-2 border-steel/40 pl-3 text-sm italic text-foreground-muted print:text-gray-600">
      {text}
    </p>
  );
}
