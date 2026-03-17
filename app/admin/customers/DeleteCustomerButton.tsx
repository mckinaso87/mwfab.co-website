"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCustomer } from "./actions";

type Props = {
  customerId: string;
  companyName: string;
  variant?: "list" | "detail";
};

export function DeleteCustomerButton({
  customerId,
  companyName,
  variant = "list",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm(`Remove customer “${companyName}”? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteCustomer(customerId);
      if (result?.error) {
        alert(result.error);
        return;
      }
      router.push("/admin/customers");
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
        {isPending ? "Removing…" : "Remove customer"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-lg border border-red-500/50 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
    >
      {isPending ? "Removing…" : "Remove"}
    </button>
  );
}
