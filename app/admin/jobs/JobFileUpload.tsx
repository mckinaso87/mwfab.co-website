"use client";

import { useActionState } from "react";
import { uploadJobFile } from "./files/actions";

export function JobFileUpload({ jobId }: { jobId: string }) {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => uploadJobFile(jobId, formData),
    null as { error?: string; success?: boolean } | null
  );

  return (
    <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="job-file" className="block text-sm text-foreground-muted">
          Upload file
        </label>
        <input
          id="job-file"
          name="file"
          type="file"
          className="mt-1 text-sm text-foreground"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-steel-blue px-3 py-2 text-sm font-medium text-foreground hover:bg-steel disabled:opacity-50"
      >
        {isPending ? "Uploading…" : "Upload"}
      </button>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-400">Uploaded.</p>}
    </form>
  );
}
