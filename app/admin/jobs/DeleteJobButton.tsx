"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteJob } from "./actions";

type Props = {
  jobId: string;
  jobName: string;
  variant?: "list" | "detail";
};

export function DeleteJobButton({ jobId, jobName, variant = "list" }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm(`Remove job “${jobName}”? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteJob(jobId);
      if (result?.error) {
        alert(result.error);
        return;
      }
      router.push("/admin/jobs");
      router.refresh();
    });
  };

  if (variant === "detail") {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-lg border border-red-500/50 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
      >
        {isPending ? "Removing…" : "Remove job"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-sm font-medium text-red-400 hover:text-red-300 hover:underline disabled:opacity-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
    >
      {isPending ? "Removing…" : "Remove"}
    </button>
  );
}
