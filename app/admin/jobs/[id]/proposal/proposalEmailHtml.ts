import { CATEGORY_LABELS } from "@/lib/takeoff-catalog-spec";
import type { ProposalData } from "./loadProposalData";

function formatMoney(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Base URL for assets (e.g. logo) in email. */
function getBaseUrl(): string {
  if (typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (typeof process.env.VERCEL_URL === "string" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://www.mwfab.co";
}

export function proposalEmailHtml(data: ProposalData): string {
  const { job, takeoff, metalLines, componentLines, miscLines, fieldMiscLines } = data;
  const customerName = job.customers?.company_name ?? "—";
  const quoteDate = takeoff.quote_date ?? "—";
  const quotedBy = takeoff.quoted_by?.trim() || "—";
  const logoUrl = `${getBaseUrl()}/images/logo/mwf-logo.png`;

  const tableStyle = "width:100%; border-collapse:collapse; font-size:14px; margin-top:8px;";
  const thStyle = "text-align:left; padding:8px 12px; border-bottom:1px solid #e2e8f0; font-weight:600; color:#1e293b;";
  const thRightStyle = "text-align:right; padding:8px 12px; border-bottom:1px solid #e2e8f0; font-weight:600; color:#1e293b;";
  const tdStyle = "padding:8px 12px; border-bottom:1px solid #f1f5f9; color:#334155;";
  const tdRightStyle = "padding:8px 12px; border-bottom:1px solid #f1f5f9; text-align:right; color:#334155;";
  const sectionTitleStyle = "font-size:11px; font-weight:600; letter-spacing:0.05em; text-transform:uppercase; color:#64748b; margin:24px 0 0 0;";
  const metaStyle = "font-size:14px; color:#334155; margin:4px 0;";

  let metalRows = "";
  for (const line of metalLines) {
    const cat = CATEGORY_LABELS[line.category] ?? line.category;
    metalRows += `<tr><td style="${tdStyle}">${escapeHtml(line.display_name)}</td><td style="${tdStyle}">${escapeHtml(cat)}</td><td style="${tdRightStyle}">${formatMoney(line.total_price)}</td></tr>`;
  }
  let componentRows = "";
  for (const line of componentLines) {
    componentRows += `<tr><td style="${tdStyle}">${escapeHtml(line.display_name)}</td><td style="${tdRightStyle}">${formatMoney(line.total_price)}</td></tr>`;
  }
  let miscRows = "";
  for (const line of miscLines) {
    miscRows += `<tr><td style="${tdStyle}">${escapeHtml(line.label)}</td><td style="${tdRightStyle}">${formatMoney(line.total_price)}</td></tr>`;
  }
  let fieldMiscRows = "";
  for (const line of fieldMiscLines) {
    fieldMiscRows += `<tr><td style="${tdStyle}">${escapeHtml(line.label)}</td><td style="${tdRightStyle}">${formatMoney(line.total)}</td></tr>`;
  }

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:24px; font-family: system-ui, -apple-system, sans-serif; background:#f8fafc; color:#1e293b;">
  <div style="max-width:640px; margin:0 auto; background:#fff; padding:32px; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <table style="width:100%; border:0;"><tr>
      <td style="vertical-align:top; padding-right:16px;"><img src="${logoUrl}" alt="McKinados Welding & Fabrication" width="72" height="72" style="display:block;" /></td>
      <td style="vertical-align:top;">
        <h1 style="margin:0; font-size:20px; font-weight:700;">McKinados Welding & Fabrication</h1>
        <p style="margin:6px 0 0 0; font-size:13px; color:#64748b;">Structural and ornamental steel construction. East Coast Florida — St. Augustine to Miami. Licensed and insured. 17+ years experience.</p>
      </td>
    </tr></table>

    <div style="margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0;">
      <p style="${metaStyle}"><strong style="color:#64748b;">Job:</strong> ${escapeHtml(job.job_name)}</p>
      <p style="${metaStyle}"><strong style="color:#64748b;">Customer:</strong> ${escapeHtml(customerName)}</p>
      <p style="${metaStyle}"><strong style="color:#64748b;">Quote date:</strong> ${escapeHtml(quoteDate)}</p>
      <p style="${metaStyle}"><strong style="color:#64748b;">Quoted by:</strong> ${escapeHtml(quotedBy)}</p>
    </div>

    ${metalLines.length > 0 ? `
    <p style="${sectionTitleStyle}">Metal</p>
    <table style="${tableStyle}"><thead><tr><th style="${thStyle}">Description</th><th style="${thStyle}">Category</th><th style="${thRightStyle}">Total</th></tr></thead><tbody>${metalRows}</tbody></table>
    ` : ""}

    ${componentLines.length > 0 ? `
    <p style="${sectionTitleStyle}">Components</p>
    <table style="${tableStyle}"><thead><tr><th style="${thStyle}">Name</th><th style="${thRightStyle}">Total</th></tr></thead><tbody>${componentRows}</tbody></table>
    ` : ""}

    ${miscLines.length > 0 ? `
    <p style="${sectionTitleStyle}">Materials – Miscellaneous</p>
    <table style="${tableStyle}"><thead><tr><th style="${thStyle}">Label</th><th style="${thRightStyle}">Total</th></tr></thead><tbody>${miscRows}</tbody></table>
    ` : ""}

    ${fieldMiscLines.length > 0 ? `
    <p style="${sectionTitleStyle}">Field – Miscellaneous</p>
    <table style="${tableStyle}"><thead><tr><th style="${thStyle}">Label</th><th style="${thRightStyle}">Total</th></tr></thead><tbody>${fieldMiscRows}</tbody></table>
    ` : ""}

    <p style="${sectionTitleStyle}">Pricing summary</p>
    <table style="${tableStyle}">
      <tr><td style="${tdStyle}">Materials</td><td style="${tdRightStyle}">${formatMoney(takeoff.all_material_subtotal)}</td></tr>
      <tr><td style="${tdStyle}">Tax</td><td style="${tdRightStyle}">${formatMoney(takeoff.tax_total)}</td></tr>
      <tr><td style="${tdStyle}">Material w/ tax</td><td style="${tdRightStyle}">${formatMoney(takeoff.material_total_with_tax)}</td></tr>
      <tr><td style="${tdStyle}">Shop total</td><td style="${tdRightStyle}">${formatMoney(takeoff.shop_total)}</td></tr>
      <tr><td style="${tdStyle}">Field total</td><td style="${tdRightStyle}">${formatMoney(takeoff.field_total)}</td></tr>
      <tr><td style="${tdStyle}">Project total</td><td style="${tdRightStyle}">${formatMoney(takeoff.project_total)}</td></tr>
    </table>
    <div style="margin-top:16px; padding:16px; background:#f1f5f9; border-radius:8px; border:2px solid #94a3b8;">
      <table style="width:100%; border:0;"><tr><td style="font-weight:600; font-size:16px;">Grand total</td><td style="text-align:right; font-weight:700; font-size:22px;">${formatMoney(takeoff.grand_total)}</td></tr></table>
    </div>

    <p style="margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0; font-size:13px; color:#64748b;">
      <strong style="color:#334155;">McKinados Welding & Fabrication</strong><br/>
      Service area: East Coast Florida (St. Augustine to Miami). Licensed steel contractor Florida.
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
