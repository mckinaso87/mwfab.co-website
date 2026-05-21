import type { TakeoffSectionNote } from "@/lib/db-types";

export function ProposalSectionNote({ note }: { note?: TakeoffSectionNote | null }) {
  if (!note?.include_in_proposal || !note.note.trim()) return null;
  return (
    <p className="mt-3 text-sm italic text-foreground-muted print:text-gray-600 border-l-2 border-steel/40 pl-3">
      {note.note.trim()}
    </p>
  );
}
