import { createAdminClient } from "@/lib/supabase/admin";
import { getQboSyncEnv } from "@/lib/env";
import { getProposalData } from "@/app/admin/jobs/[id]/proposal/loadProposalData";
import { recomputeAndSaveTotals } from "@/app/admin/jobs/[id]/takeoff/actions";
import { getQboClient } from "./client";
import { qboFetch, QboApiError } from "./request";
import { ensureCustomerSyncedForEstimate } from "./customer-sync";
import {
  applyEstimateIds,
  mapProposalToQboEstimate,
  type QboEstimatePayload,
} from "./estimate-mapper";
import { getQboAppEstimateUrl } from "./oauth";

type QboEstimateResponse = {
  Estimate: {
    Id: string;
    SyncToken: string;
  };
};

export type PushEstimateResult =
  | { ok: true; estimateId: string; estimateUrl: string; updated: boolean }
  | { ok: false; error: string };

async function findAnchorProposal(takeoffId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("proposals")
    .select("*")
    .eq("takeoff_id", takeoffId)
    .not("qbo_estimate_id", "is", null)
    .maybeSingle();
  return data;
}

async function upsertAnchorProposal(params: {
  customerId: string;
  jobId: string;
  takeoffId: string;
  recipientEmail: string;
  jobName: string;
  estimateId: string;
  syncToken: string;
  existingId?: string;
}): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const payload = {
    qbo_estimate_id: params.estimateId,
    qbo_sync_token: params.syncToken,
    qbo_synced_at: now,
    qbo_sync_error: null,
    subject: `QBO Estimate: ${params.jobName}`,
    sent_at: now,
  };

  if (params.existingId) {
    await supabase.from("proposals").update(payload).eq("id", params.existingId);
    return;
  }

  await supabase.from("proposals").insert({
    customer_id: params.customerId,
    job_id: params.jobId,
    takeoff_id: params.takeoffId,
    recipient_email: params.recipientEmail,
    ...payload,
  });
}

export async function pushEstimateToQbo(jobId: string): Promise<PushEstimateResult> {
  const syncEnv = getQboSyncEnv();
  if (!syncEnv) {
    return {
      ok: false,
      error:
        "Estimate push is not configured. Set QBO_DEFAULT_ITEM_ID and QBO_LINE_TAX_CODE (TAX or NON).",
    };
  }

  const ctx = await getQboClient();
  if (!ctx) {
    return { ok: false, error: "QuickBooks is not connected. Connect in Settings → Integrations." };
  }

  const data = await getProposalData(jobId);
  if (!data) return { ok: false, error: "Proposal data not found." };

  await recomputeAndSaveTotals(data.takeoff.id, jobId);
  const refreshed = await getProposalData(jobId);
  if (!refreshed) return { ok: false, error: "Could not reload takeoff data." };

  const customerSync = await ensureCustomerSyncedForEstimate(refreshed.job.customer_id);
  if (!customerSync.ok) return { ok: false, error: customerSync.error };

  let payload: QboEstimatePayload;
  try {
    payload = mapProposalToQboEstimate(refreshed, customerSync.qboCustomerId);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not build estimate.",
    };
  }

  const anchor = await findAnchorProposal(refreshed.takeoff.id);
  let updated = false;

  try {
    let response: QboEstimateResponse;

    if (anchor?.qbo_estimate_id) {
      const current = await qboFetch<{ Estimate: { SyncToken: string } }>(
        ctx,
        `estimate/${anchor.qbo_estimate_id}`,
        { method: "GET" }
      );
      const updatePayload = applyEstimateIds(
        payload,
        anchor.qbo_estimate_id,
        current.Estimate.SyncToken
      );
      response = await qboFetch<QboEstimateResponse>(ctx, "estimate", {
        method: "POST",
        query: { operation: "update", minorversion: "65" },
        body: updatePayload,
      });
      updated = true;
    } else {
      response = await qboFetch<QboEstimateResponse>(ctx, "estimate", {
        method: "POST",
        query: { minorversion: "65" },
        body: payload,
      });
    }

    const estimate = response.Estimate;
    const recipientEmail =
      refreshed.job.customers?.email?.trim() || "sales@mwfab.co";

    await upsertAnchorProposal({
      customerId: refreshed.job.customer_id,
      jobId,
      takeoffId: refreshed.takeoff.id,
      recipientEmail,
      jobName: refreshed.job.job_name,
      estimateId: estimate.Id,
      syncToken: estimate.SyncToken,
      existingId: anchor?.id,
    });

    return {
      ok: true,
      estimateId: estimate.Id,
      estimateUrl: getQboAppEstimateUrl(syncEnv.environment, estimate.Id),
      updated,
    };
  } catch (err) {
    const message =
      err instanceof QboApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Failed to push estimate to QuickBooks.";

    const supabase = createAdminClient();
    if (anchor?.id) {
      await supabase
        .from("proposals")
        .update({ qbo_sync_error: message })
        .eq("id", anchor.id);
    }

    return { ok: false, error: message };
  }
}
