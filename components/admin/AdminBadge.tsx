import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  variant?: "default" | "primary" | "muted" | "copper" | "teal";
  className?: string;
};

export function AdminBadge({
  children,
  variant = "default",
  className,
}: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium",
        variant === "default" &&
          "border border-steel/50 bg-steel/30 text-foreground",
        variant === "primary" &&
          "bg-admin-sky/30 text-foreground border border-admin-sky/40",
        variant === "muted" &&
          "bg-steel/20 text-foreground-muted",
        variant === "copper" &&
          "border border-admin-copper/40 bg-admin-copper/20 text-amber-100",
        variant === "teal" &&
          "border border-admin-teal/40 bg-admin-teal/20 text-teal-100",
        className
      )}
    >
      {children}
    </span>
  );
}
