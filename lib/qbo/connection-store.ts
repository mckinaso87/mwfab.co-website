import { createAdminClient } from "@/lib/supabase/admin";
import type { QboConnection } from "@/lib/db-types";
import { encryptToken, decryptToken } from "./token-crypto";

export type StoredQboConnection = {
  id: string;
  realmId: string;
  companyName: string | null;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date | null;
};

export async function getStoredConnection(): Promise<StoredQboConnection | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("qbo_connections")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as QboConnection;
  return {
    id: row.id,
    realmId: row.realm_id,
    companyName: row.company_name,
    accessToken: decryptToken(row.access_token),
    refreshToken: decryptToken(row.refresh_token),
    accessTokenExpiresAt: new Date(row.access_token_expires_at),
    refreshTokenExpiresAt: row.refresh_token_expires_at
      ? new Date(row.refresh_token_expires_at)
      : null,
  };
}

export async function saveConnection(params: {
  realmId: string;
  companyName?: string | null;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt?: Date | null;
  connectedBy?: string | null;
}): Promise<void> {
  const supabase = createAdminClient();
  const payload = {
    realm_id: params.realmId,
    company_name: params.companyName ?? null,
    access_token: encryptToken(params.accessToken),
    refresh_token: encryptToken(params.refreshToken),
    access_token_expires_at: params.accessTokenExpiresAt.toISOString(),
    refresh_token_expires_at: params.refreshTokenExpiresAt?.toISOString() ?? null,
    connected_by: params.connectedBy ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("qbo_connections")
    .select("id")
    .eq("realm_id", params.realmId)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase.from("qbo_connections").update(payload).eq("id", existing.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("qbo_connections").insert({
    ...payload,
    created_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function updateConnectionTokens(
  connectionId: string,
  params: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt?: Date | null;
  }
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("qbo_connections")
    .update({
      access_token: encryptToken(params.accessToken),
      refresh_token: encryptToken(params.refreshToken),
      access_token_expires_at: params.accessTokenExpiresAt.toISOString(),
      refresh_token_expires_at: params.refreshTokenExpiresAt?.toISOString() ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", connectionId);
  if (error) throw new Error(error.message);
}

export async function deleteConnection(): Promise<void> {
  const supabase = createAdminClient();
  const { data: rows, error: selectError } = await supabase
    .from("qbo_connections")
    .select("id");
  if (selectError) throw new Error(selectError.message);
  if (!rows?.length) return;
  const { error } = await supabase
    .from("qbo_connections")
    .delete()
    .in(
      "id",
      rows.map((r) => r.id)
    );
  if (error) throw new Error(error.message);
}

export async function getConnectionStatus(): Promise<{
  connected: boolean;
  realmId?: string;
  companyName?: string | null;
  accessTokenExpiresAt?: string;
}> {
  const conn = await getStoredConnection();
  if (!conn) return { connected: false };
  return {
    connected: true,
    realmId: conn.realmId,
    companyName: conn.companyName,
    accessTokenExpiresAt: conn.accessTokenExpiresAt.toISOString(),
  };
}
