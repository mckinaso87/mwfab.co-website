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
        "flex flex-col items-center justify-center rounded-xl border border-steel/50 bg-card py-12 px-6 text-center",
        className
      )}
    >
      <p className="text-foreground-muted">{message}</p>
      {actionLabel != null && actionHref != null && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex rounded-lg bg-steel-blue px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
