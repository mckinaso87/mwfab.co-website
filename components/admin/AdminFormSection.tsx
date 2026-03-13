import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function AdminFormSection({
  title,
  description,
  children,
  className,
}: Props) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title != null || description != null) && (
        <div>
          {title != null && title !== "" && (
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          )}
          {description != null && description !== "" && (
            <p className="mt-0.5 text-sm text-foreground-muted">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
