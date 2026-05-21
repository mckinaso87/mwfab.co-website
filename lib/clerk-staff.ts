import { randomBytes } from "crypto";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import type { StaffRole } from "./auth-constants";

export function staffPublicMetadata(role: StaffRole): { role: StaffRole } {
  return { role };
}

/** Clerk includes a direct accept URL on the invitation resource (use when email is delayed or blocked). */
export function getInvitationAcceptUrl(invitation: { url?: string | null }): string | null {
  const url = invitation.url?.trim();
  return url || null;
}

/** Meets typical Clerk password requirements (length, mixed case, digit). */
export function generateTempPassword(): string {
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const digits = "23456789";
  const all = lower + upper + digits;
  const pick = (chars: string) => chars[randomBytes(1)[0]! % chars.length]!;
  const rest = Array.from(randomBytes(10), (b) => all[b % all.length]).join("");
  return pick(lower) + pick(upper) + pick(digits) + rest;
}

export function parseClerkError(err: unknown): string {
  if (isClerkAPIResponseError(err)) {
    const first = err.errors[0];
    const code = first?.code ?? "";
    const longMessage = first?.longMessage ?? first?.message;

    if (code === "form_identifier_exists" || code === "duplicate_record") {
      return "An account with this email already exists.";
    }
    if (code === "form_password_pwned") {
      return "That password is not allowed. Try generating a new one.";
    }
    if (code === "form_param_format_invalid") {
      return "Invalid email address.";
    }
    if (err.status === 429) {
      return "Too many requests. Please wait a moment and try again.";
    }
    if (longMessage) return longMessage;
    if (first?.message) return first.message;
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return "Something went wrong with the login provider. Please try again.";
}
