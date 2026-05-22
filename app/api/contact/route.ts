import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactNotification } from "@/lib/email/contact";

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
export type { ContactFormPayload } from "@/lib/email/contact-types";

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

    const { sent, error } = await sendContactNotification(data);

    if (!sent) {
      console.error("[contact] Email delivery failed:", error);
      return NextResponse.json(
        {
          error:
            error ??
            "We could not send your request right now. Please email sales@mwfab.co directly.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
