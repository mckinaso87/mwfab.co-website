import { LETTERHEAD } from "@/components/admin/proposal/Letterhead";
import { getAppBaseUrl } from "@/lib/app-url";
import { EMAIL_THEME, escapeHtml } from "@/lib/email/html";

export interface BrandedEmailLayoutOptions {
  eyebrow: string;
  title: string;
  bodyHtml: string;
  footerNote?: string;
}

/**
 * Shared HTML email shell: letterhead, steel-blue accents, proposal-style field cards.
 */
export function brandedEmailLayout({
  eyebrow,
  title,
  bodyHtml,
  footerNote,
}: BrandedEmailLayoutOptions): string {
  const logoUrl = `${getAppBaseUrl()}/images/logo/mwf-logo.png`;
  const footer = footerNote
    ? `<p style="margin:24px 0 0 0; padding-top:16px; border-top:1px solid ${EMAIL_THEME.cardBorder}; font-size:12px; color:${EMAIL_THEME.muted}; line-height:1.5;">${footerNote}</p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:24px; font-family:system-ui,-apple-system,sans-serif; background:${EMAIL_THEME.pageBg}; color:${EMAIL_THEME.text};">
<table role="presentation" width="640" align="center" cellpadding="0" cellspacing="0" style="max-width:640px; width:100%; margin:0 auto;">
<tr><td style="background:${EMAIL_THEME.cardBg}; border-radius:8px; padding:32px; border:1px solid ${EMAIL_THEME.cardBorder};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding-bottom:12px; border-bottom:2px solid ${EMAIL_THEME.accent};">
    <tr>
      <td align="left" valign="top" width="55%">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td valign="top" style="padding-right:14px;"><img src="${logoUrl}" alt="McKinados Welding &amp; Fabrication" width="72" height="72" style="display:block;" /></td>
            <td valign="middle">
              <p style="margin:0; font-size:17px; font-weight:700; color:${EMAIL_THEME.text}; line-height:1.25;">${escapeHtml(LETTERHEAD.companyName)}</p>
            </td>
          </tr>
        </table>
      </td>
      <td align="right" valign="top" width="45%" style="font-size:11px; color:#475569; line-height:1.5;">
        <p style="margin:0; text-align:right;">${escapeHtml(LETTERHEAD.addressLine1)}<br/>${escapeHtml(LETTERHEAD.addressLine2)}<br/><a href="mailto:${LETTERHEAD.email}" style="color:${EMAIL_THEME.link}; font-weight:600;">${escapeHtml(LETTERHEAD.email)}</a><br/>Office: ${escapeHtml(LETTERHEAD.office)}<br/>Mobile: ${escapeHtml(LETTERHEAD.mobile)}</p>
      </td>
    </tr>
  </table>

  <p style="margin:24px 0 0 0; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:${EMAIL_THEME.label};">${escapeHtml(eyebrow)}</p>
  <p style="margin:4px 0 0 0; font-size:22px; font-weight:700; color:${EMAIL_THEME.text};">${escapeHtml(title)}</p>

  <div style="margin-top:20px;">
    ${bodyHtml}
  </div>

  ${footer}
</td></tr>
</table>
</body>
</html>`;
}

/** Proposal-style labeled field card for email tables. */
export function emailFieldCard(label: string, value: string, colspan = 1): string {
  const span = colspan > 1 ? ` colspan="${colspan}"` : "";
  return `<td${span} valign="top" style="padding:10px; font-size:13px; background:${EMAIL_THEME.fieldBg}; border:2px solid ${EMAIL_THEME.accent}; border-radius:8px;"><span style="color:${EMAIL_THEME.label}; font-size:11px; text-transform:uppercase; letter-spacing:0.05em;">${escapeHtml(label)}</span><br/><strong style="color:${EMAIL_THEME.text};">${value}</strong></td>`;
}
