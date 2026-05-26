import { createAdminClient } from "@/lib/supabase/admin";
import type { Customer } from "@/lib/db-types";
import { getQboClient } from "./client";
import { qboFetch, QboApiError } from "./request";
import { mapCustomerToQbo } from "./customer-mapper";

type QboCustomerResponse = {
  Customer: {
    Id: string;
    SyncToken: string;
    DisplayName?: string;
  };
};

async function queryCustomerByDisplayName(
  ctx: NonNullable<Awaited<ReturnType<typeof getQboClient>>>,
  displayName: string
): Promise<string | null> {
  try {
    const encoded = displayName.replace(/'/g, "\\'");
    const result = await qboFetch<{
      QueryResponse?: { Customer?: { Id: string; DisplayName?: string }[] };
    }>(ctx, "query", {
      method: "GET",
      query: {
        query: `select Id, DisplayName from Customer where DisplayName = '${encoded}' maxresults 1`,
        minorversion: "65",
      },
    });
    const match = result?.QueryResponse?.Customer?.[0];
    return match?.Id ?? null;
  } catch {
    return null;
  }
}

async function pushCustomerPayload(
  ctx: NonNullable<Awaited<ReturnType<typeof getQboClient>>>,
  payload: ReturnType<typeof mapCustomerToQbo>,
  isUpdate: boolean
): Promise<QboCustomerResponse> {
  return qboFetch<QboCustomerResponse>(ctx, "customer", {
    method: "POST",
    query: isUpdate ? { operation: "update" } : {},
    body: payload,
  });
}

/**
 * Sync a local customer to QBO. Never throws — errors are stored on the customer row.
 */
export async function syncCustomerToQbo(customerId: string): Promise<void> {
  const ctx = await getQboClient();
  if (!ctx) return;

  const supabase = createAdminClient();
  const { data: row, error: fetchError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single();

  if (fetchError || !row) return;
  const customer = row as Customer;

  try {
    let payload = mapCustomerToQbo(customer, {
      includeIds: !!customer.qbo_customer_id,
    });
    let isUpdate = !!customer.qbo_customer_id;

    let response: QboCustomerResponse;
    try {
      response = await pushCustomerPayload(ctx, payload, isUpdate);
    } catch (err) {
      if (
        err instanceof QboApiError &&
        !isUpdate &&
        (err.status === 400 || err.faults.some((f) => /duplicate|already exists/i.test(f.Detail ?? f.Message ?? "")))
      ) {
        const suffix = customer.id.slice(0, 8);
        payload = mapCustomerToQbo(customer, { displayNameSuffix: suffix });
        const existingId = await queryCustomerByDisplayName(ctx, payload.DisplayName);
        if (existingId) {
          payload.Id = existingId;
          const existing = await qboFetch<{ Customer: { SyncToken: string } }>(
            ctx,
            `customer/${existingId}`,
            { method: "GET" }
          );
          payload.SyncToken = existing.Customer.SyncToken;
          isUpdate = true;
          response = await pushCustomerPayload(ctx, payload, true);
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }

    const qboCustomer = response.Customer;
    await supabase
      .from("customers")
      .update({
        qbo_customer_id: qboCustomer.Id,
        qbo_sync_token: qboCustomer.SyncToken,
        qbo_synced_at: new Date().toISOString(),
        qbo_sync_error: null,
      })
      .eq("id", customerId);
  } catch (err) {
    const message =
      err instanceof QboApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "QBO customer sync failed";
    console.error("[qbo] customer sync error:", customerId, message);
    await supabase
      .from("customers")
      .update({ qbo_sync_error: message })
      .eq("id", customerId);
  }
}

/** Fire-and-forget wrapper for server actions. */
export function scheduleCustomerQboSync(customerId: string): void {
  void syncCustomerToQbo(customerId).catch((err) => {
    console.error("[qbo] scheduleCustomerQboSync failed:", err);
  });
}

export async function ensureCustomerSyncedForEstimate(
  customerId: string
): Promise<{ ok: true; qboCustomerId: string } | { ok: false; error: string }> {
  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single();

  if (!row) return { ok: false, error: "Customer not found." };
  const customer = row as Customer;

  if (customer.qbo_customer_id && !customer.qbo_sync_error) {
    return { ok: true, qboCustomerId: customer.qbo_customer_id };
  }

  await syncCustomerToQbo(customerId);

  const { data: refreshed } = await supabase
    .from("customers")
    .select("qbo_customer_id, qbo_sync_error")
    .eq("id", customerId)
    .single();

  if (refreshed?.qbo_sync_error) {
    return { ok: false, error: refreshed.qbo_sync_error };
  }
  if (!refreshed?.qbo_customer_id) {
    return { ok: false, error: "Customer is not linked to QuickBooks. Connect QBO and try again." };
  }
  return { ok: true, qboCustomerId: refreshed.qbo_customer_id };
}
