"use client";

import { useActionState } from "react";
import Link from "next/link";
import { disconnectQbo } from "./actions";

export function QboDisconnectForm() {
  const [state, formAction, isPending] = useActionState(
    async () => disconnectQbo(),
    null as { error?: string; success?: boolean } | null
  );

  return (
    <form action={formAction} className="mt-6">
      {state?.error && (
        <p className="mb-3 text-sm text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="mb-3 text-sm text-green-400">Disconnected from QuickBooks.</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-red-500/50 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
      >
        {isPending ? "Disconnecting…" : "Disconnect QuickBooks"}
      </button>
    </form>
  );
}

export function QboConnectButton({ configured }: { configured: boolean }) {
  if (!configured) {
    return (
      <p className="mt-4 text-sm text-foreground-muted">
        OAuth env vars are missing. Set QBO_CLIENT_ID, QBO_CLIENT_SECRET, QBO_REDIRECT_URI, and
        QBO_TOKEN_ENCRYPTION_KEY.
      </p>
    );
  }

  return (
    <Link
      href="/api/qbo/connect"
      className="btn-admin-primary mt-4 inline-flex rounded-lg px-4 py-2.5 text-sm font-medium"
    >
      Connect QuickBooks
    </Link>
  );
}
