import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function AdminEmptyState({
  message,
  actionLabel,
  actionHref,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-admin-teal/20 admin-card py-12 px-6 text-center",
        className
      )}
    >
      <p className="text-foreground-muted">{message}</p>
      {actionLabel != null && actionHref != null && (
        <Link
          href={actionHref}
          className="btn-admin-primary mt-4 inline-flex rounded-lg px-4 py-2.5 text-sm font-medium focus-visible:outline-none"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
