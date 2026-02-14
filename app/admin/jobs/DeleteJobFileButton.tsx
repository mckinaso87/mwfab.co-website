"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteJobFile } from "./files/actions";

export function DeleteJobFileButton({
  fileId,
  jobId,
  storagePath,
}: {
  fileId: string;
  jobId: string;
  storagePath: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="text-sm text-red-400 hover:underline disabled:opacity-50"
      onClick={() => {
        if (!confirm("Delete this file?")) return;
        startTransition(async () => {
          await deleteJobFile(fileId, jobId, storagePath);
          router.refresh();
        });
      }}
    >
      {isPending ? "…" : "Delete"}
    </button>
  );
}
