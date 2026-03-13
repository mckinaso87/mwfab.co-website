import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: React.ReactNode;
  subtext?: React.ReactNode;
  className?: string;
};

export function AdminStatCard({ label, value, subtext, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border border-steel/50 bg-card p-5",
        className
      )}
    >
      <p className="text-sm font-medium text-foreground-muted">{label}</p>
      <div className="mt-1 text-2xl font-bold tabular-nums text-foreground">
        {value}
      </div>
      {subtext != null && (
        <div className="mt-2 text-sm text-foreground-muted">{subtext}</div>
      )}
    </div>
  );
}
