"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { JobStatus } from "@/lib/db-types";

export async function createJob(formData: FormData) {
  const supabase = createAdminClient();
  const job_name = (formData.get("job_name") as string)?.trim();
  const customer_id = (formData.get("customer_id") as string)?.trim();
  if (!job_name) return { error: "Job name is required." };
  if (!customer_id) return { error: "Customer is required." };

  const status = (formData.get("status") as JobStatus) || "To Bid";
  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      customer_id,
      job_name,
      description: (formData.get("description") as string)?.trim() || null,
      bid_due_date: (formData.get("bid_due_date") as string)?.trim() || null,
      status,
      assigned_to: (formData.get("assigned_to") as string)?.trim() || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/jobs");
  revalidatePath("/admin/dashboard");
  if (job) revalidatePath(`/admin/customers/${customer_id}`);
  redirect("/admin/jobs");
}

export async function updateJob(id: string, formData: FormData) {
  const supabase = createAdminClient();
  const job_name = (formData.get("job_name") as string)?.trim();
  if (!job_name) return { error: "Job name is required." };

  const newStatus = (formData.get("status") as JobStatus) || "To Bid";

  const { data: current } = await supabase
    .from("jobs")
    .select("status")
    .eq("id", id)
    .single();
  const previousStatus: JobStatus | undefined = current?.status as JobStatus | undefined;
  if (previousStatus !== undefined && previousStatus !== newStatus) {
    await supabase.from("job_status_history").insert({
      job_id: id,
      previous_status: previousStatus,
      new_status: newStatus,
      changed_by: null,
    });
  }

  const { error } = await supabase
    .from("jobs")
    .update({
      job_name,
      description: (formData.get("description") as string)?.trim() || null,
      bid_due_date: (formData.get("bid_due_date") as string)?.trim() || null,
      status: newStatus,
      assigned_to: (formData.get("assigned_to") as string)?.trim() || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${id}`);
  revalidatePath("/admin/dashboard");
  return { success: true };
}

/** Server action for form: create or update based on job_id in formData. */
export async function createOrUpdateJob(formData: FormData) {
  const jobId = (formData.get("job_id") as string)?.trim();
  if (jobId) return updateJob(jobId, formData);
  return createJob(formData);
}

export async function deleteJob(jobId: string) {
  const supabase = createAdminClient();
  const id = jobId?.trim();
  if (!id) return { error: "Job ID is required." };

  const { data: takeoff } = await supabase
    .from("takeoffs")
    .select("id")
    .eq("job_id", id)
    .maybeSingle();

  if (takeoff?.id) {
    await supabase.from("takeoff_metal_lines").delete().eq("takeoff_id", takeoff.id);
    await supabase.from("takeoff_component_lines").delete().eq("takeoff_id", takeoff.id);
    await supabase.from("takeoff_misc_lines").delete().eq("takeoff_id", takeoff.id);
    await supabase.from("takeoff_field_misc").delete().eq("takeoff_id", takeoff.id);
    await supabase.from("takeoffs").delete().eq("id", takeoff.id);
  }

  const { data: files } = await supabase.from("job_files").select("id, file_url").eq("job_id", id);
  if (files?.length) {
    await supabase.storage.from("job-files").remove(files.map((f) => f.file_url));
    await supabase.from("job_files").delete().eq("job_id", id);
  }

  await supabase.from("job_status_history").delete().eq("job_id", id);
  const { error } = await supabase.from("jobs").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/jobs");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
