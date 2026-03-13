import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  stickyHeader?: boolean;
  className?: string;
};

export function AdminDataTable({
  children,
  stickyHeader,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-steel/50",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full min-w-[400px] border-collapse text-sm",
            stickyHeader && "[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-gunmetal/95"
          )}
        >
          {children}
        </table>
      </div>
    </div>
  );
}

export function AdminDataTableHead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <thead>
      <tr className={cn("border-b border-steel/50 bg-gunmetal/80", className)}>
        {children}
      </tr>
    </thead>
  );
}

export function AdminDataTableHeaderCell({
  children,
  className,
  align = "left",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left font-medium text-foreground-muted",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </th>
  );
}

export function AdminDataTableBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tbody className={className}>{children}</tbody>;
}

export function AdminDataTableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "border-b border-steel/30 transition-colors last:border-b-0 hover:bg-steel/20",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function AdminDataTableCell({
  children,
  className,
  align = "left",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <td
      className={cn(
        "px-4 py-3",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </td>
  );
}
