import type { ProposalData } from "@/app/admin/jobs/[id]/proposal/loadProposalData";
import { getQboSyncEnv } from "@/lib/env";
import { isGalvanizerLine } from "@/lib/takeoff-calculations";

const MAX_DESC = 4000;

export type QboEstimateLine = {
  DetailType: "SalesItemLineDetail";
  Amount: number;
  Description?: string;
  SalesItemLineDetail: {
    ItemRef: { value: string };
    Qty: number;
    UnitPrice: number;
    TaxCodeRef?: { value: string };
  };
};

/** QBO API shape (MemoRef, not a plain string). */
export type QboMemoRef = { value: string };

export type QboEstimatePayload = {
  CustomerRef: { value: string };
  TxnDate: string;
  DocNumber?: string;
  PrivateNote?: string;
  CustomerMemo?: QboMemoRef;
  Line: QboEstimateLine[];
  Id?: string;
  SyncToken?: string;
  sparse?: boolean;
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function truncateDesc(text: string): string {
  const t = text.trim();
  return t.length <= MAX_DESC ? t : t.slice(0, MAX_DESC - 3) + "...";
}

function addLine(
  lines: QboEstimateLine[],
  description: string,
  amount: number,
  itemId: string,
  taxCodeId: string
): void {
  const rounded = roundMoney(amount);
  if (!Number.isFinite(rounded) || rounded <= 0) return;
  lines.push({
    DetailType: "SalesItemLineDetail",
    Amount: rounded,
    Description: truncateDesc(description),
    SalesItemLineDetail: {
      ItemRef: { value: itemId },
      Qty: 1,
      UnitPrice: rounded,
      TaxCodeRef: { value: taxCodeId },
    },
  });
}

export function mapProposalToQboEstimate(
  data: ProposalData,
  qboCustomerId: string
): QboEstimatePayload {
  const syncEnv = getQboSyncEnv();
  if (!syncEnv) throw new Error("QBO estimate sync is not configured.");

  const { defaultItemId, lineTaxCode } = syncEnv;
  const lines: QboEstimateLine[] = [];
  const { job, takeoff, metalLines, componentLines, miscLines, fieldMiscLines } = data;

  for (const line of metalLines) {
    addLine(lines, `[Metal] ${line.display_name}`, line.total_price ?? 0, defaultItemId, lineTaxCode);
  }

  for (const line of componentLines) {
    addLine(
      lines,
      `[Component] ${line.display_name}`,
      line.total_price ?? 0,
      defaultItemId,
      lineTaxCode
    );
  }

  for (const line of miscLines) {
    if (isGalvanizerLine(line.label)) continue;
    addLine(lines, `[Misc] ${line.label}`, line.total_price ?? 0, defaultItemId, lineTaxCode);
  }

  for (const line of fieldMiscLines) {
    addLine(lines, `[Field] ${line.label}`, line.total ?? 0, defaultItemId, lineTaxCode);
  }

  const shopLabor = roundMoney(takeoff.shop_labor_amount ?? 0);
  const shopDrawings = roundMoney(takeoff.shop_drawings_amount ?? 0);
  const shopCombined = roundMoney(takeoff.shop_total ?? shopLabor + shopDrawings);
  if (shopCombined > 0) {
    addLine(lines, "Shop labor & drawings", shopCombined, defaultItemId, lineTaxCode);
  } else {
    if (shopLabor > 0) addLine(lines, "Shop labor", shopLabor, defaultItemId, lineTaxCode);
    if (shopDrawings > 0) addLine(lines, "Shop drawings", shopDrawings, defaultItemId, lineTaxCode);
  }

  const fieldTotal = roundMoney(takeoff.field_total ?? 0);
  if (fieldTotal > 0) {
    addLine(lines, "Field / install", fieldTotal, defaultItemId, lineTaxCode);
  }

  const marginAmount = roundMoney((takeoff.grand_total ?? 0) - (takeoff.project_total ?? 0));
  if (marginAmount > 0) {
    addLine(lines, "Margin", marginAmount, defaultItemId, lineTaxCode);
  }

  const galvMode = takeoff.galv_mode ?? "not_galvanized";
  if (galvMode === "optional_addon") {
    const galvAddon = roundMoney(takeoff.galv_addon_amount ?? 0);
    if (galvAddon > 0) {
      addLine(lines, "Galvanizing (optional add-on)", galvAddon, defaultItemId, lineTaxCode);
    }
  }

  if (lines.length === 0) {
    throw new Error("Takeoff has no billable lines to push to QuickBooks.");
  }

  const txnDate =
    takeoff.quote_date ?? new Date().toISOString().slice(0, 10);
  const docNumber = `JOB-${job.id.slice(0, 8).toUpperCase()}`;
  const privateNoteParts = [takeoff.notes].filter(Boolean);
  const privateNote = privateNoteParts.length
    ? truncateDesc(privateNoteParts.join("\n\n"))
    : undefined;

  return {
    CustomerRef: { value: qboCustomerId },
    TxnDate: txnDate,
    DocNumber: docNumber,
    CustomerMemo: { value: truncateDesc(job.job_name) },
    PrivateNote: privateNote,
    Line: lines,
  };
}

export function applyEstimateIds(
  payload: QboEstimatePayload,
  estimateId: string,
  syncToken: string
): QboEstimatePayload {
  return { ...payload, Id: estimateId, SyncToken: syncToken, sparse: true };
}

