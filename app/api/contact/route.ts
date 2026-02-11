import { NextResponse } from "next/server";
import { z } from "zod";
import { getResendEnv } from "@/lib/env";

/**
 * Contact form payload. Honeypot field (website) should be empty; if set, treat as spam.
 * Anti-spam: honeypot + optional future rate limit or Turnstile. See /docs for strategy.
 */
const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  company: z.string().max(200).optional(),
  email: z.string().email("Invalid email"),
  phone: z.string().max(50).optional(),
  projectDescription: z.string().min(1, "Project description is required").max(5000),
  website: z.string().max(0).optional(), // honeypot: must be empty
});

export type ContactBody = z.infer<typeof contactSchema>;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const message = Object.values(first).flat().join(" ") || "Validation failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const data = parsed.data;

    // Honeypot: if "website" was submitted, treat as spam
    if (data.website && data.website.length > 0) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    const resendEnv = getResendEnv();
    if (resendEnv) {
      // Scaffold: when RESEND_API_KEY and RESEND_FROM_EMAIL are set, uncomment and use:
      // const { Resend } = await import("resend");
      // const resend = new Resend(resendEnv.apiKey);
      // await resend.emails.send({
      //   from: resendEnv.fromEmail,
      //   to: process.env.CONTACT_TO_EMAIL ?? resendEnv.fromEmail,
      //   subject: `Bid request from ${data.name}`,
      //   text: `Name: ${data.name}\nCompany: ${data.company ?? ""}\nEmail: ${data.email}\nPhone: ${data.phone ?? ""}\n\nProject:\n${data.projectDescription}`,
      // });
      // For Phase 1 we do not send; just validate and return success.
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
