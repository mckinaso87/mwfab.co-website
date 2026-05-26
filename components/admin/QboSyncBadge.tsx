import { cn } from "@/lib/utils";

type Props = {
  syncedAt?: string | null;
  syncError?: string | null;
  qboId?: string | null;
  connected?: boolean;
  className?: string;
};

export function QboSyncBadge({
  syncedAt,
  syncError,
  qboId,
  connected = true,
  className,
}: Props) {
  let label = "Not synced";
  let variant: "muted" | "success" | "error" | "warning" = "muted";

  if (!connected) {
    label = "QBO not connected";
    variant = "warning";
  } else if (syncError) {
    label = "Sync error";
    variant = "error";
  } else if (qboId && syncedAt) {
    label = "Synced to QBO";
    variant = "success";
  } else if (qboId) {
    label = "Linked";
    variant = "success";
  }

  const styles = {
    muted: "border-steel/40 bg-steel/20 text-foreground-muted",
    success: "border-admin-teal/40 bg-admin-teal/15 text-admin-teal",
    error: "border-red-500/40 bg-red-500/10 text-red-300",
    warning: "border-admin-amber/40 bg-admin-amber/15 text-admin-amber",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[variant],
        className
      )}
      title={syncError ?? (syncedAt ? `Last synced ${new Date(syncedAt).toLocaleString()}` : undefined)}
    >
      {label}
    </span>
  );
}
