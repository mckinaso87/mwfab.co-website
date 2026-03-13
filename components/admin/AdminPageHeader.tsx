import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string | null;
  actions?: React.ReactNode;
  className?: string;
};

export function AdminPageHeader({ title, subtitle, actions, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle != null && subtitle !== "" && (
          <p className="mt-1 text-sm text-foreground-muted">{subtitle}</p>
        )}
      </div>
      {actions != null && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
