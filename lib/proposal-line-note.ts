/** Line types that may carry an optional customer note on proposals. */
export type LineCustomerNoteFields = {
  customer_note?: string | null;
  customer_note_in_proposal?: boolean;
};

/** Text to show on proposal/PDF/email below a line item, or null if hidden/empty. */
export function proposalLineCustomerNote(line: LineCustomerNoteFields): string | null {
  if (!line.customer_note_in_proposal) return null;
  const text = line.customer_note?.trim();
  return text || null;
}
