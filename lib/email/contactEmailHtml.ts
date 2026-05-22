import type { ContactFormPayload } from "@/lib/email/contact-types";
import { brandedEmailLayout, emailFieldCard } from "@/lib/email/brandedLayout";
import { EMAIL_THEME, escapeHtml } from "@/lib/email/html";

function formatSubmittedAt(): string {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function contactEmailHtml(data: ContactFormPayload): string {
  const company = data.company?.trim() ? escapeHtml(data.company.trim()) : "—";
  const phone = data.phone?.trim() ? escapeHtml(data.phone.trim()) : "—";
  const emailLink = `<a href="mailto:${escapeHtml(data.email)}" style="color:${EMAIL_THEME.link}; font-weight:600;">${escapeHtml(data.email)}</a>`;
  const description = escapeHtml(data.projectDescription.trim()).replace(/\n/g, "<br/>");

  const bodyHtml = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
    <tr>
      ${emailFieldCard("Submitted", escapeHtml(formatSubmittedAt()), 2)}
    </tr>
    <tr>
      ${emailFieldCard("Name", escapeHtml(data.name.trim()))}
      ${emailFieldCard("Company", company)}
    </tr>
    <tr>
      ${emailFieldCard("Email", emailLink)}
      ${emailFieldCard("Phone", phone)}
    </tr>
  </table>

  <p style="margin:20px 0 8px 0; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:${EMAIL_THEME.label};">Project description</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid ${EMAIL_THEME.accent}; border-radius:8px; background:${EMAIL_THEME.fieldBg};">
    <tr>
      <td style="padding:14px 16px; font-size:14px; color:${EMAIL_THEME.text}; line-height:1.6;">${description}</td>
    </tr>
  </table>`;

  return brandedEmailLayout({
    eyebrow: "Website inquiry",
    title: `Bid request from ${data.name.trim()}`,
    bodyHtml,
    footerNote: `<strong style="color:${EMAIL_THEME.text};">McKinados Welding &amp; Fabrication</strong><br/>Reply directly to the sender&apos;s email to respond.`,
  });
}

export function contactEmailText(data: ContactFormPayload): string {
  const lines = [
    "McKinados Welding & Fabrication — Website bid request",
    "",
    `Submitted: ${formatSubmittedAt()}`,
    `Name: ${data.name.trim()}`,
    `Company: ${data.company?.trim() || "—"}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone?.trim() || "—"}`,
    "",
    "Project description:",
    data.projectDescription.trim(),
  ];
  return lines.join("\n");
}
