import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

export function Button({
  children,
  className,
  href,
  type = "button",
  disabled,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-steel-blue focus:ring-offset-2 focus:ring-offset-charcoal disabled:opacity-50";
  const primary = "bg-steel-blue text-foreground hover:bg-steel";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(base, primary, className)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(base, primary, className)}
    >
      {children}
    </button>
  );
}
