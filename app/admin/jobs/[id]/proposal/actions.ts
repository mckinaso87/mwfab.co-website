"use server";

import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { getResendEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProposalData } from "./loadProposalData";
import { proposalEmailHtml } from "./proposalEmailHtml";
import { generateProposalPdf } from "./generateProposalPdf";

const BUCKET = "job-files";

export async function sendProposal(
  jobId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const to = (formData.get("to") as string)?.trim();
  const subject = (formData.get("subject") as string)?.trim();

  if (!to) return { error: "Recipient email is required." };

  const resendEnv = getResendEnv();
  if (!resendEnv) {
    return { error: "Email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL." };
  }

  const data = await getProposalData(jobId);
  if (!data) return { error: "Proposal data not found." };

  const html = proposalEmailHtml(data);
  const subjectLine = subject || `Proposal: ${data.job.job_name} – McKinados Welding & Fabrication`;
  const pdfFileName = `Proposal - ${data.job.job_name.replace(/[^a-zA-Z0-9._-]/g, "_")}.pdf`;

  try {
    const pdfBytes = await generateProposalPdf(data);
    const supabase = createAdminClient();

    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === BUCKET)) {
      await supabase.storage.createBucket(BUCKET, { public: false });
    }

    const storagePath = `${jobId}/${randomUUID()}-${pdfFileName}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, pdfBytes, { contentType: "application/pdf" });

    if (uploadError) return { error: `PDF upload failed: ${uploadError.message}` };

    const { error: fileInsertError } = await supabase.from("job_files").insert({
      job_id: jobId,
      file_url: storagePath,
      file_name: pdfFileName,
      uploaded_by: null,
    });

    if (fileInsertError) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return { error: `Job file record failed: ${fileInsertError.message}` };
    }

    const resend = new Resend(resendEnv.apiKey);
    const { error: sendError } = await resend.emails.send({
      from: resendEnv.fromEmail,
      to: [to],
      subject: subjectLine,
      html,
      attachments: [{ filename: pdfFileName, content: Buffer.from(pdfBytes) }],
    });

    if (sendError) return { error: sendError.message };

    await supabase.from("proposals").insert({
      customer_id: data.job.customer_id,
      job_id: jobId,
      takeoff_id: data.takeoff.id,
      sent_at: new Date().toISOString(),
      recipient_email: to,
      subject: subjectLine,
    });

    const { data: currentJob } = await supabase.from("jobs").select("status").eq("id", jobId).single();
    const previousStatus = (currentJob?.status as string) ?? null;
    await supabase.from("jobs").update({ status: "Sent" }).eq("id", jobId);
    if (previousStatus !== "Sent") {
      await supabase.from("job_status_history").insert({
        job_id: jobId,
        previous_status: previousStatus,
        new_status: "Sent",
        changed_by: null,
      });
    }

    revalidatePath(`/admin/jobs/${jobId}`);
    revalidatePath(`/admin/jobs/${jobId}/proposal`);
    revalidatePath(`/admin/customers/${data.job.customer_id}`);
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to send email.";
    return { error: message };
  }
}
