"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

const BUCKET = "job-files";

export async function uploadJobFile(jobId: string, formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file selected." };

  const supabase = createAdminClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, { public: false });
  }

  const ext = file.name.replace(/^.*\./, "") || "";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${jobId}/${randomUUID()}${ext ? `.${ext}` : ""}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || "application/octet-stream" });

  if (uploadError) return { error: uploadError.message };

  const { error: insertError } = await supabase.from("job_files").insert({
    job_id: jobId,
    file_url: path,
    file_name: file.name,
    uploaded_by: null,
  });

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([path]);
    return { error: insertError.message };
  }

  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function deleteJobFile(fileId: string, jobId: string, storagePath: string) {
  const supabase = createAdminClient();
  await supabase.storage.from(BUCKET).remove([storagePath]);
  await supabase.from("job_files").delete().eq("id", fileId);
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/admin/dashboard");
  return { success: true };
}
