import { createOAuthClient } from "./oauth";
import {
  getStoredConnection,
  updateConnectionTokens,
  type StoredQboConnection,
} from "./connection-store";
import { getQboOAuthEnv } from "@/lib/env";

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

export type QboClientContext = {
  realmId: string;
  accessToken: string;
  environment: "sandbox" | "production";
  connectionId: string;
};

function tokenExpiryFromResponse(expiresInSeconds?: number): Date {
  const seconds = expiresInSeconds ?? 3600;
  return new Date(Date.now() + seconds * 1000);
}

function refreshExpiryFromResponse(xRefreshExpiresIn?: number): Date | null {
  if (!xRefreshExpiresIn) return null;
  return new Date(Date.now() + xRefreshExpiresIn * 1000);
}

async function refreshConnectionIfNeeded(
  conn: StoredQboConnection
): Promise<StoredQboConnection> {
  const expiresSoon =
    conn.accessTokenExpiresAt.getTime() - Date.now() < REFRESH_BUFFER_MS;
  if (!expiresSoon) return conn;

  const oauth = createOAuthClient();
  const authResponse = await oauth.refreshUsingToken(conn.refreshToken);
  const token = authResponse.getToken();
  const accessToken = token.access_token;
  const refreshToken = token.refresh_token ?? conn.refreshToken;
  if (!accessToken) throw new Error("QBO token refresh returned no access token.");

  const accessTokenExpiresAt = tokenExpiryFromResponse(token.expires_in);
  const refreshTokenExpiresAt =
    refreshExpiryFromResponse(token.x_refresh_token_expires_in) ??
    conn.refreshTokenExpiresAt;

  await updateConnectionTokens(conn.id, {
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  });

  return {
    ...conn,
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  };
}

/** Load active QBO connection with valid access token, refreshing if needed. */
export async function getQboClient(): Promise<QboClientContext | null> {
  const conn = await getStoredConnection();
  if (!conn) return null;

  try {
    const fresh = await refreshConnectionIfNeeded(conn);
    const { environment } = getQboOAuthEnv();
    return {
      realmId: fresh.realmId,
      accessToken: fresh.accessToken,
      environment,
      connectionId: fresh.id,
    };
  } catch (err) {
    console.error("[qbo] token refresh failed:", err);
    return null;
  }
}

export function isQboConnected(): Promise<boolean> {
  return getStoredConnection().then((c) => c !== null);
}
