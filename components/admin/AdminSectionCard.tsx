import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function AdminSectionCard({ title, children, className }: Props) {
  return (
    <section
      className={cn(
        "rounded-xl border border-steel/50 bg-card p-6",
        className
      )}
    >
      {title != null && title !== "" && (
        <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
      )}
      {children}
    </section>
  );
}
