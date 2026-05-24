import { cn } from "@/lib/utils";

type StatTone = "default" | "copper" | "teal" | "sky" | "amber";

type Props = {
  label: string;
  value: React.ReactNode;
  subtext?: React.ReactNode;
  tone?: StatTone;
  className?: string;
};

const TONE_BORDER: Record<StatTone, string> = {
  default: "border-t-admin-sky/70",
  copper: "border-t-admin-copper",
  teal: "border-t-admin-teal",
  sky: "border-t-admin-sky",
  amber: "border-t-admin-amber",
};

export function AdminStatCard({ label, value, subtext, tone = "default", className }: Props) {
  return (
    <div
      className={cn(
        "admin-card rounded-xl border border-t-[3px] p-5",
        TONE_BORDER[tone],
        className
      )}
    >
      <p className="text-sm font-medium text-foreground-muted">{label}</p>
      <div className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</div>
      {subtext != null && (
        <div className="mt-2 text-sm text-foreground-muted">{subtext}</div>
      )}
    </div>
  );
}
