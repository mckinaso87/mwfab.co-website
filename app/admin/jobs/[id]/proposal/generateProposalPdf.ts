import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { CATEGORY_LABELS } from "@/lib/takeoff-catalog-spec";
import type { ProposalData } from "./loadProposalData";

function formatMoney(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const MARGIN = 50;
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 14;
const SECTION_GAP = 20;

export async function generateProposalPdf(data: ProposalData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function drawText(text: string, x: number, size = 10, bold = false) {
    const f = bold ? fontBold : font;
    const width = f.widthOfTextAtSize(text, size);
    if (y < MARGIN + LINE_HEIGHT) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
    page.drawText(text, { x, y, size, font: f, color: rgb(0.11, 0.11, 0.12) });
    y -= LINE_HEIGHT;
    return width;
  }

  const { job, takeoff, metalLines, componentLines, miscLines, fieldMiscLines } = data;
  const customerName = job.customers?.company_name ?? "—";
  const quoteDate = takeoff.quote_date ?? "—";
  const quotedBy = takeoff.quoted_by?.trim() || "—";

  // Header
  drawText("McKinados Welding & Fabrication", MARGIN, 18, true);
  y -= 4;
  drawText("Structural and ornamental steel construction. East Coast Florida — St. Augustine to Miami.", MARGIN, 9);
  drawText("Licensed and insured. 17+ years experience.", MARGIN, 9);
  y -= SECTION_GAP;

  // Meta
  drawText(`Job: ${job.job_name}`, MARGIN, 10);
  drawText(`Customer: ${customerName}`, MARGIN, 10);
  drawText(`Quote date: ${quoteDate}`, MARGIN, 10);
  drawText(`Quoted by: ${quotedBy}`, MARGIN, 10);
  y -= SECTION_GAP;

  function drawTable(
    title: string,
    headers: string[],
    rows: string[][],
    colWidths: number[]
  ) {
    if (y < MARGIN + LINE_HEIGHT * 3) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
    drawText(title, MARGIN, 10, true);
    y -= 6;
    let x = MARGIN;
    headers.forEach((h, i) => {
      page.drawText(h, { x, y, size: 9, font: fontBold, color: rgb(0.11, 0.11, 0.12) });
      x += colWidths[i] ?? 100;
    });
    y -= LINE_HEIGHT;
    for (const row of rows) {
      if (y < MARGIN + LINE_HEIGHT) {
        page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
      }
      x = MARGIN;
      row.forEach((cell, i) => {
        const w = colWidths[i] ?? 100;
        const truncated = font.widthOfTextAtSize(cell, 9) > w - 4
          ? cell.slice(0, Math.floor((w - 4) / font.widthOfTextAtSize("M", 9)))
          : cell;
        page.drawText(truncated, { x, y, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
        x += w;
      });
      y -= LINE_HEIGHT;
    }
    y -= SECTION_GAP;
  }

  if (metalLines.length > 0) {
    drawTable(
      "Metal",
      ["Description", "Category", "Total"],
      metalLines.map((l) => [
        l.display_name,
        CATEGORY_LABELS[l.category] ?? l.category,
        formatMoney(l.total_price),
      ]),
      [220, 120, 100]
    );
  }
  if (componentLines.length > 0) {
    drawTable(
      "Components",
      ["Name", "Total"],
      componentLines.map((l) => [l.display_name, formatMoney(l.total_price)]),
      [340, 100]
    );
  }
  if (miscLines.length > 0) {
    drawTable(
      "Materials – Miscellaneous",
      ["Label", "Total"],
      miscLines.map((l) => [l.label, formatMoney(l.total_price)]),
      [340, 100]
    );
  }
  if (fieldMiscLines.length > 0) {
    drawTable(
      "Field – Miscellaneous",
      ["Label", "Total"],
      fieldMiscLines.map((l) => [l.label, formatMoney(l.total)]),
      [340, 100]
    );
  }

  // Pricing summary
  drawText("Pricing summary", MARGIN, 10, true);
  y -= 6;
  drawText(`Materials: ${formatMoney(takeoff.all_material_subtotal)}`, MARGIN, 9);
  drawText(`Tax: ${formatMoney(takeoff.tax_total)}`, MARGIN, 9);
  drawText(`Material w/ tax: ${formatMoney(takeoff.material_total_with_tax)}`, MARGIN, 9);
  drawText(`Shop total: ${formatMoney(takeoff.shop_total)}`, MARGIN, 9);
  drawText(`Field total: ${formatMoney(takeoff.field_total)}`, MARGIN, 9);
  drawText(`Project total: ${formatMoney(takeoff.project_total)}`, MARGIN, 9);
  y -= 8;
  drawText(`Grand total: ${formatMoney(takeoff.grand_total)}`, MARGIN, 14, true);
  y -= SECTION_GAP;

  drawText("McKinados Welding & Fabrication", MARGIN, 9);
  drawText("Service area: East Coast Florida (St. Augustine to Miami). Licensed steel contractor Florida.", MARGIN, 8);

  return doc.save();
}
