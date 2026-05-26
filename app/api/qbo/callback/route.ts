import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { getQboOAuthEnv } from "@/lib/env";
import { createOAuthClient } from "@/lib/qbo/oauth";
import { saveConnection } from "@/lib/qbo/connection-store";
import { qboFetch } from "@/lib/qbo/request";
import type { QboClientContext } from "@/lib/qbo/client";

const STATE_COOKIE = "qbo_oauth_state";

function appOrigin(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const origin = appOrigin(request);
  const integrationsUrl = new URL("/admin/settings/integrations", origin);

  const searchParams = request.nextUrl.searchParams;
  const errorParam = searchParams.get("error");
  if (errorParam) {
    integrationsUrl.searchParams.set("error", errorParam);
    return NextResponse.redirect(integrationsUrl);
  }

  const state = searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (!state || !expectedState || state !== expectedState) {
    integrationsUrl.searchParams.set(
      "error",
      "invalid_state — start Connect again from Integrations (stay in the same browser; allow cookies)."
    );
    return NextResponse.redirect(integrationsUrl);
  }

  const realmId = searchParams.get("realmId");
  if (!realmId) {
    integrationsUrl.searchParams.set("error", "missing_realm");
    return NextResponse.redirect(integrationsUrl);
  }

  try {
    getQboOAuthEnv();
    const oauth = createOAuthClient();
    const callbackUrl = request.url;
    const authResponse = await oauth.createToken(callbackUrl);
    const token = authResponse.getToken();

    const accessToken = token.access_token;
    const refreshToken = token.refresh_token;
    if (!accessToken || !refreshToken) {
      throw new Error("QBO did not return access or refresh token.");
    }

    const accessTokenExpiresAt = new Date(
      Date.now() + (token.expires_in ?? 3600) * 1000
    );
    const refreshTokenExpiresAt = token.x_refresh_token_expires_in
      ? new Date(Date.now() + token.x_refresh_token_expires_in * 1000)
      : null;

    const { userId } = await auth();

    let companyName: string | null = null;
    try {
      const { environment } = getQboOAuthEnv();
      const ctx: QboClientContext = {
        realmId,
        accessToken,
        environment,
        connectionId: "pending",
      };
      const info = await qboFetch<{ CompanyInfo?: { CompanyName?: string } }>(
        ctx,
        "companyinfo/" + realmId,
        { method: "GET" }
      );
      companyName = info?.CompanyInfo?.CompanyName ?? null;
    } catch {
      companyName = null;
    }

    await saveConnection({
      realmId,
      companyName,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      connectedBy: userId ?? null,
    });

    integrationsUrl.searchParams.set("connected", "1");
    return NextResponse.redirect(integrationsUrl);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "oauth_failed";
    console.error("[qbo] OAuth callback failed:", err);
    integrationsUrl.searchParams.set("error", message);
    return NextResponse.redirect(integrationsUrl);
  }
}
