import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  variant?: "default" | "primary" | "muted";
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
          "bg-steel-blue/80 text-foreground",
        variant === "muted" &&
          "bg-steel/20 text-foreground-muted",
        className
      )}
    >
      {children}
    </span>
  );
}
