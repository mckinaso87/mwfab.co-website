import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function AdminToolbar({ children, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3",
        className
      )}
    >
      {children}
    </div>
  );
}
