"use client";

type Props = {
  inviteUrl: string;
  message?: string;
};

export function InviteLinkDisplay({ inviteUrl, message }: Props) {
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      // fallback: select happens via readOnly input click
    }
  };

  return (
    <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      {message && <p className="text-amber-100">{message}</p>}
      <p className="mt-2 font-medium">Invitation link</p>
      <p className="mt-1 text-xs text-foreground-muted">
        Share this if the invite email did not arrive. The link is tied to the invited address.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          readOnly
          value={inviteUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="input-admin min-w-0 flex-1 font-mono text-xs"
        />
        <button
          type="button"
          onClick={copyLink}
          className="shrink-0 rounded-lg border border-steel/50 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-steel/30"
        >
          Copy link
        </button>
      </div>
    </div>
  );
}
