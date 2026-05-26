import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { canAccessAdmin } from "@/lib/auth";
import { getQboOAuthEnv, isQboOAuthConfigured } from "@/lib/env";
import { createOAuthClient, QBO_ACCOUNTING_SCOPE } from "@/lib/qbo/oauth";

const STATE_COOKIE = "qbo_oauth_state";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const integrationsUrl = new URL("/admin/settings/integrations", origin);

  if (!(await canAccessAdmin())) {
    const signIn = new URL("/sign-in", origin);
    signIn.searchParams.set("redirect_url", "/admin/settings/integrations");
    return NextResponse.redirect(signIn);
  }

  if (!isQboOAuthConfigured()) {
    integrationsUrl.searchParams.set("error", "not_configured");
    return NextResponse.redirect(integrationsUrl);
  }

  getQboOAuthEnv();
  const state = randomBytes(24).toString("hex");
  const oauth = createOAuthClient();
  const authorizeUrl = oauth.authorizeUri({
    scope: [QBO_ACCOUNTING_SCOPE],
    state,
  });

  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(authorizeUrl);
}
