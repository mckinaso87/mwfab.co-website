import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { isStaffRole } from "@/lib/auth-constants";
import { requireClerkWebhookEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

type ClerkUserPayload = {
  id: string;
  email_addresses?: { email_address: string; id: string }[];
  primary_email_address_id?: string | null;
  public_metadata?: { role?: string };
};

function primaryEmail(user: ClerkUserPayload): string | null {
  const addresses = user.email_addresses ?? [];
  if (user.primary_email_address_id) {
    const primary = addresses.find((a) => a.id === user.primary_email_address_id);
    if (primary) return primary.email_address.toLowerCase();
  }
  const first = addresses[0];
  return first ? first.email_address.toLowerCase() : null;
}

export async function POST(req: Request) {
  let webhookSecret: string;
  try {
    ({ webhookSecret } = requireClerkWebhookEnv());
  } catch {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing Svix headers" }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(webhookSecret);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === "user.created") {
    const user = event.data as ClerkUserPayload;
    const email = primaryEmail(user);
    if (!email) return NextResponse.json({ ok: true });

    const { error } = await supabase
      .from("users")
      .update({ clerk_id: user.id })
      .eq("email", email)
      .is("clerk_id", null);

    if (error) {
      console.error("[clerk webhook] user.created", error.message);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }
  }

  if (event.type === "user.updated") {
    const user = event.data as ClerkUserPayload;
    const email = primaryEmail(user);
    const roleRaw = user.public_metadata?.role;
    const updates: { email?: string; role?: string } = {};

    if (email) updates.email = email;
    if (roleRaw && isStaffRole(roleRaw)) updates.role = roleRaw;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: true });
    }

    const { error } = await supabase.from("users").update(updates).eq("clerk_id", user.id);

    if (error) {
      console.error("[clerk webhook] user.updated", error.message);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }
  }

  if (event.type === "user.deleted") {
    const user = event.data as { id?: string };
    if (!user.id) return NextResponse.json({ ok: true });

    const { error } = await supabase
      .from("users")
      .update({ clerk_id: null })
      .eq("clerk_id", user.id);

    if (error) {
      console.error("[clerk webhook] user.deleted", error.message);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
