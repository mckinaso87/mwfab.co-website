import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { groupLinesByScope, SCOPE_SUBGROUP_TITLE } from "@/lib/proposal-line-groups";
import { LETTERHEAD, proposalLicenseLines } from "@/components/admin/proposal/Letterhead";
import { isGalvanizerLine } from "@/lib/takeoff-calculations";
import type { ProposalData } from "./loadProposalData";
import { deriveProposalScopeLabel } from "./loadProposalData";

function formatMoney(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const MARGIN = 50;
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const LINE_HEIGHT = 14;
const SECTION_GAP = 16;
const RIGHT_EDGE = PAGE_WIDTH - MARGIN;

function proposalScopeHeaderLabel(lines: Array<{ scope?: string | null }>): string {
  const scopes = new Set(lines.map((l) => l.scope).filter((s): s is string => !!s));
  if (scopes.has("furnish") && scopes.has("furnish_install")) {
    return "Mixed — see line items";
  }
  return deriveProposalScopeLabel(lines);
}

export async function generateProposalPdf(data: ProposalData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function ensureSpace(lines = 1) {
    if (y < MARGIN + LINE_HEIGHT * lines) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  function drawText(text: string, x: number, size = 10, bold = false) {
    ensureSpace();
    const f = bold ? fontBold : font;
    page.drawText(text, { x, y, size, font: f, color: rgb(0.11, 0.11, 0.12) });
    y -= LINE_HEIGHT;
  }

  function drawTextRight(text: string, size = 9, bold = false) {
    ensureSpace();
    const f = bold ? fontBold : font;
    const w = f.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: RIGHT_EDGE - w,
      y,
      size,
      font: f,
      color: rgb(0.11, 0.11, 0.12),
    });
    y -= LINE_HEIGHT;
  }

  function drawRightAligned(text: string, size = 9, advanceY = true) {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: RIGHT_EDGE - w,
      y,
      size,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    if (advanceY) y -= LINE_HEIGHT;
  }

  function drawLineRow(description: string, galv?: boolean) {
    ensureSpace();
    const label = galv ? `${description} (galv)` : description;
    const truncated =
      font.widthOfTextAtSize(label, 9) > RIGHT_EDGE - MARGIN - 16
        ? label.slice(0, 85) + "…"
        : label;
    page.drawText(truncated, { x: MARGIN + 8, y, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
    y -= LINE_HEIGHT;
  }

  function drawSubgroupHeader(title: string) {
    ensureSpace(2);
    page.drawText(title, { x: MARGIN, y, size: 9, font: fontBold, color: rgb(0.11, 0.11, 0.12) });
    y -= LINE_HEIGHT + 4;
  }

  const { job, takeoff, metalLines, componentLines, miscLines, fieldMiscLines, terms } =
    data;
  const customerName = job.customers?.company_name ?? "—";
  const quoteDate = takeoff.quote_date ?? "—";
  const quotedBy = takeoff.quoted_by?.trim() || "—";
  const jobNumber = `JOB-${job.id.slice(0, 6).toUpperCase()}`;
  const galvMode = takeoff.galv_mode ?? "not_galvanized";
  const allScoped = [...metalLines, ...componentLines, ...miscLines, ...fieldMiscLines];
  const scopeLabel = proposalScopeHeaderLabel(allScoped);

  const miscDisplay = miscLines.filter(
    (l) => !(isGalvanizerLine(l.label) && galvMode === "not_galvanized")
  );

  const headerTopY = y;
  page.drawText(LETTERHEAD.companyName, {
    x: MARGIN,
    y: headerTopY,
    size: 12,
    font: fontBold,
    color: rgb(0.11, 0.11, 0.12),
  });
  const rightLines = [
    LETTERHEAD.addressLine1,
    LETTERHEAD.addressLine2,
    LETTERHEAD.email,
    `Office: ${LETTERHEAD.office}`,
    `Mobile: ${LETTERHEAD.mobile}`,
    `Fax: ${LETTERHEAD.fax}`,
  ];
  let rightY = headerTopY;
  for (const line of rightLines) {
    const w = font.widthOfTextAtSize(line, 8);
    page.drawText(line, {
      x: RIGHT_EDGE - w,
      y: rightY,
      size: 8,
      font,
      color: rgb(0.35, 0.35, 0.38),
    });
    rightY -= LINE_HEIGHT;
  }
  y = Math.min(headerTopY - LINE_HEIGHT, rightY) - SECTION_GAP / 2;

  drawText("PROPOSAL", MARGIN, 10, true);
  drawText(job.job_name, MARGIN, 12, true);
  y -= 6;
  drawText(`Customer: ${customerName}`, MARGIN, 10);
  drawText(`Quote date: ${quoteDate}`, MARGIN, 10);
  drawText(`Quoted by: ${quotedBy}`, MARGIN, 10);
  drawText(`Job #: ${jobNumber}`, MARGIN, 10);
  drawText(`Scope: ${scopeLabel}`, MARGIN, 10);
  y -= SECTION_GAP;

  function drawScopeLineBlocks<
    L extends {
      scope?: string | null;
      sort_order: number;
    },
  >(
    lines: L[],
    getLabel: (line: L) => string,
    galv?: (line: L) => boolean
  ) {
    if (lines.length === 0) return;
    for (const { scope, lines: scoped } of groupLinesByScope(lines)) {
      const sorted = [...scoped].sort((a, b) => a.sort_order - b.sort_order);
      drawSubgroupHeader(SCOPE_SUBGROUP_TITLE[scope]);
      for (const line of sorted) {
        drawLineRow(getLabel(line), galv?.(line));
      }
      y -= 6;
    }
    y -= SECTION_GAP;
  }

  drawScopeLineBlocks(metalLines, (l) => l.display_name, (l) => l.is_galvanized);
  drawScopeLineBlocks(componentLines, (l) => l.display_name ?? "");
  drawScopeLineBlocks(miscDisplay, (l) => l.label ?? "");
  drawScopeLineBlocks(fieldMiscLines, (l) => l.label ?? "");

  y -= 6;
  drawText(`Total: ${formatMoney(takeoff.grand_total)}`, MARGIN, 14, true);
  y -= 4;
  drawText(
    "Lump-sum price includes all scope and line items above.",
    MARGIN,
    8
  );

  if (galvMode === "optional_addon" && (takeoff.galv_addon_amount ?? 0) > 0) {
    y -= 4;
    drawText("Optional galvanizing available; contact us for add-on pricing.", MARGIN, 9);
  }

  y -= SECTION_GAP;
  if (data.exclusions.length > 0) {
    drawText("Exclusions", MARGIN, 10, true);
    for (const ex of data.exclusions) {
      drawText(`• ${ex.label}: ${ex.body}`, MARGIN, 8);
    }
    y -= SECTION_GAP;
  }

  drawText(
    "Upon approval, this proposal becomes part of the binding contract and scope of work.",
    MARGIN,
    9
  );
  drawText(`Salesman: ${quotedBy}`, MARGIN, 9);
  drawText("Accepted by: _________________________", MARGIN, 9);
  drawText("Signature: _________________________", MARGIN, 9);
  drawText("Date: _________________________", MARGIN, 9);

  if (terms?.body_md) {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
    drawText("Terms and Conditions", MARGIN, 14, true);
    y -= 8;
    const plain = terms.body_md
      .replace(/^##\s*/gm, "")
      .replace(/\*\*/g, "")
      .split("\n")
      .filter((l) => l.trim());
    for (const line of plain) {
      const wrapped = line.length > 85 ? line.slice(0, 85) + "…" : line;
      drawText(wrapped, MARGIN, 9);
    }
    y -= SECTION_GAP;
    drawText("Licenses", MARGIN, 9, true);
    for (const line of proposalLicenseLines()) {
      drawText(line, MARGIN, 8);
    }
  }

  return doc.save();
}
