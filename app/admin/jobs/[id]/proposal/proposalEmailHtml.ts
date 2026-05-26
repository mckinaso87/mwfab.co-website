import { groupLinesByScope, SCOPE_SUBGROUP_TITLE } from "@/lib/proposal-line-groups";
import { LETTERHEAD } from "@/components/admin/proposal/Letterhead";
import { isGalvanizerLine } from "@/lib/takeoff-calculations";
import type { ProposalData } from "./loadProposalData";
import { deriveProposalScopeLabel } from "./loadProposalData";

function formatMoney(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getBaseUrl(): string {
  if (typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (typeof process.env.VERCEL_URL === "string" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://www.mwfab.co";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function proposalScopeHeaderLabel(lines: Array<{ scope?: string | null }>): string {
  const scopes = new Set(lines.map((l) => l.scope).filter((s): s is string => !!s));
  if (scopes.has("furnish") && scopes.has("furnish_install")) {
    return "Mixed — see line items";
  }
  return deriveProposalScopeLabel(lines);
}

function subgroupTable(
  title: string,
  rows: string,
  scope: "furnish" | "furnish_install" = "furnish_install"
): string {
  const headerBg = scope === "furnish" ? "#e0f2fe" : "#fef3c7";
  const borderColor = scope === "furnish" ? "#0891b2" : "#d97706";
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px 0; border:2px solid ${borderColor}; border-radius:8px; background:#ffffff; overflow:hidden;">
  <tr>
    <td style="padding:10px 14px; border-bottom:1px solid ${borderColor}; background:${headerBg};">
      <span style="font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#64748b;">${escapeHtml(title)}</span>
    </td>
  </tr>
  <tr><td style="padding:8px 14px 12px 14px;">${rows}</td></tr>
</table>`;
}

function lineRow(description: string, galv?: boolean): string {
  const galvTag = galv ? ' <span style="color:#64748b; font-size:12px;">(galv)</span>' : "";
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 4px 0;">
  <tr>
    <td style="font-size:14px; color:#0f172a; padding:4px 0;">${escapeHtml(description)}${galvTag}</td>
  </tr>
</table>`;
}

function scopeLineBlocksHtml<L extends { scope?: string | null; sort_order: number }>(
  lines: L[],
  renderLine: (line: L) => string
): string {
  if (lines.length === 0) return "";
  const groups = groupLinesByScope(lines);
  let blocks = "";
  for (const { scope, lines: scoped } of groups) {
    const sorted = [...scoped].sort((a, b) => a.sort_order - b.sort_order);
    let inner = "";
    for (const line of sorted) {
      inner += renderLine(line);
    }
    blocks += subgroupTable(SCOPE_SUBGROUP_TITLE[scope], inner, scope);
  }
  return `<tr><td style="padding:10px 0; background:#f8fafc; border:2px solid #cbd5e1; border-radius:8px;">${blocks}</td></tr>`;
}

export function proposalEmailHtml(data: ProposalData): string {
  const { job, takeoff, metalLines, componentLines, miscLines, fieldMiscLines } = data;
  const customerName = job.customers?.company_name ?? "—";
  const quoteDate = takeoff.quote_date ?? "—";
  const quotedBy = takeoff.quoted_by?.trim() || "—";
  const jobNumber = `JOB-${job.id.slice(0, 6).toUpperCase()}`;
  const logoUrl = `${getBaseUrl()}/images/logo/mwf-logo.png`;
  const galvMode = takeoff.galv_mode ?? "not_galvanized";

  const allScoped = [...metalLines, ...componentLines, ...miscLines, ...fieldMiscLines];
  const scopeLabel = proposalScopeHeaderLabel(allScoped);

  const miscDisplay = miscLines.filter(
    (l) => !(isGalvanizerLine(l.label) && galvMode === "not_galvanized")
  );

  const galvBand =
    galvMode === "optional_addon" && (takeoff.galv_addon_amount ?? 0) > 0
      ? `
<p style="margin:12px 0 0 0; font-size:13px; color:#64748b;">Optional galvanizing is available; contact us for add-on pricing.</p>`
      : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:24px; font-family:system-ui,-apple-system,sans-serif; background:#f6f7f9; color:#0f172a;">
<table role="presentation" width="640" align="center" cellpadding="0" cellspacing="0" style="max-width:640px; width:100%; margin:0 auto;">
<tr><td style="background:#ffffff; border-radius:8px; padding:32px; border:1px solid #e5e7eb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding-bottom:12px;">
    <tr>
      <td align="left" valign="top" width="55%">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td valign="top" style="padding-right:14px;"><img src="${logoUrl}" alt="McKinados Welding &amp; Fabrication" width="72" height="72" style="display:block;" /></td>
            <td valign="middle">
              <p style="margin:0; font-size:17px; font-weight:700; color:#0f172a; line-height:1.25;">${escapeHtml(LETTERHEAD.companyName)}</p>
            </td>
          </tr>
        </table>
      </td>
      <td align="right" valign="top" width="45%" style="font-size:11px; color:#475569; line-height:1.5;">
        <p style="margin:0; text-align:right;">${escapeHtml(LETTERHEAD.addressLine1)}<br/>${escapeHtml(LETTERHEAD.addressLine2)}<br/><a href="mailto:${LETTERHEAD.email}" style="color:#2f4a6b; font-weight:600;">${escapeHtml(LETTERHEAD.email)}</a><br/>Office: ${escapeHtml(LETTERHEAD.office)}<br/>Mobile: ${escapeHtml(LETTERHEAD.mobile)}<br/>Fax: ${escapeHtml(LETTERHEAD.fax)}</p>
      </td>
    </tr>
  </table>

  <p style="margin:24px 0 0 0; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#64748b;">Proposal</p>
  <p style="margin:4px 0 0 0; font-size:22px; font-weight:700; color:#0f172a;">${escapeHtml(job.job_name)}</p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px; border-top:1px solid #e5e7eb; padding-top:16px;">
    <tr>
      <td width="25%" valign="top" style="padding:10px; font-size:13px; background:#eef2f7; border:2px solid #2f4a6b; border-radius:8px;"><span style="color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:0.05em;">Customer</span><br/><strong style="color:#0f172a;">${escapeHtml(customerName)}</strong></td>
      <td width="25%" valign="top" style="padding:10px; font-size:13px; background:#eef2f7; border:2px solid #2f4a6b; border-radius:8px;"><span style="color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:0.05em;">Quote date</span><br/><strong style="color:#0f172a;">${escapeHtml(quoteDate)}</strong></td>
      <td width="25%" valign="top" style="padding:10px; font-size:13px; background:#eef2f7; border:2px solid #2f4a6b; border-radius:8px;"><span style="color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:0.05em;">Quoted by</span><br/><strong style="color:#0f172a;">${escapeHtml(quotedBy)}</strong></td>
      <td width="25%" valign="top" style="padding:10px; font-size:13px; background:#eef2f7; border:2px solid #2f4a6b; border-radius:8px;"><span style="color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:0.05em;">Job #</span><br/><strong style="color:#0f172a;">${escapeHtml(jobNumber)}</strong></td>
    </tr>
    <tr><td colspan="4" style="padding:10px; margin-top:8px; font-size:13px; background:#eef2f7; border:2px solid #2f4a6b; border-radius:8px;"><span style="color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; padding:8px; display:block;">Scope</span><strong style="color:#0f172a; padding:0 8px 8px 8px; display:block;">${escapeHtml(scopeLabel)}</strong></td></tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
    ${scopeLineBlocksHtml(metalLines, (l) => lineRow(l.display_name, l.is_galvanized))}
    ${scopeLineBlocksHtml(componentLines, (l) => lineRow(l.display_name ?? ""))}
    ${scopeLineBlocksHtml(miscDisplay, (l) => lineRow(l.label ?? ""))}
    ${scopeLineBlocksHtml(fieldMiscLines, (l) => lineRow(l.label ?? ""))}
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; border:2px solid #2f4a6b; border-radius:6px; background:#f6f7f9;">
    <tr>
      <td style="padding:14px 16px; font-size:15px; font-weight:700; color:#0f172a;">Total</td>
      <td align="right" style="padding:14px 16px; font-size:24px; font-weight:700; color:#0f172a; font-variant-numeric:tabular-nums;">${formatMoney(takeoff.grand_total)}</td>
    </tr>
  </table>
  <p style="margin:8px 0 0 0; font-size:12px; color:#64748b;">Lump-sum price includes all scope and line items above.</p>
  ${galvBand}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px; border-top:1px solid #e5e7eb; padding-top:20px;">
    <tr>
      <td width="33%" valign="top" style="padding-right:8px; font-size:12px; color:#64748b;">Accepted by<br/><div style="margin-top:28px; border-bottom:1px solid #0f172a;">&nbsp;</div></td>
      <td width="33%" valign="top" style="padding:0 4px; font-size:12px; color:#64748b;">Signature<br/><div style="margin-top:28px; border-bottom:1px solid #0f172a;">&nbsp;</div></td>
      <td width="33%" valign="top" style="padding-left:8px; font-size:12px; color:#64748b;">Date<br/><div style="margin-top:28px; border-bottom:1px solid #0f172a;">&nbsp;</div></td>
    </tr>
    <tr><td colspan="3" style="padding-top:16px; font-size:13px; color:#0f172a;"><span style="color:#64748b;">Salesman:</span> ${escapeHtml(quotedBy)}</td></tr>
  </table>

  <p style="margin:24px 0 0 0; padding-top:16px; border-top:1px solid #e5e7eb; font-size:12px; color:#64748b; line-height:1.5;">
    <strong style="color:#0f172a;">McKinados Welding &amp; Fabrication</strong><br/>
    Reply to this email to confirm acceptance.
  </p>
</td></tr>
</table>
</body>
</html>`;
}
