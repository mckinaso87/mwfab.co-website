import { Resend } from "resend";
import { LETTERHEAD } from "@/components/admin/proposal/Letterhead";
import type { ContactFormPayload } from "@/lib/email/contact-types";
import { getResendEnv } from "@/lib/env";
import { contactEmailHtml, contactEmailText } from "@/lib/email/contactEmailHtml";

const DEFAULT_CONTACT_TO = LETTERHEAD.email;

function contactToEmail(): string {
  const override = process.env.CONTACT_TO_EMAIL?.trim();
  return override || DEFAULT_CONTACT_TO;
}

export async function sendContactNotification(
  data: ContactFormPayload
): Promise<{ sent: boolean; error?: string }> {
  const resendEnv = getResendEnv();
  if (!resendEnv) {
    return { sent: false, error: "Email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL." };
  }

  const to = contactToEmail();
  const subject = `Bid request from ${data.name.trim()} — mwfab.co`;
  const resend = new Resend(resendEnv.apiKey);

  const { error } = await resend.emails.send({
    from: resendEnv.fromEmail,
    to: [to],
    replyTo: data.email,
    subject,
    html: contactEmailHtml(data),
    text: contactEmailText(data),
  });

  if (error) {
    return { sent: false, error: error.message };
  }

  return { sent: true };
}
