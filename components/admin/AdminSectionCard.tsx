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
        "admin-card admin-card-accent-top rounded-xl border p-6",
        className
      )}
    >
      {title != null && title !== "" && (
        <h2 className="mb-4 border-b border-admin-sky/20 pb-3 text-lg font-semibold text-foreground">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
