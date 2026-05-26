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
  const base = "btn-cta disabled:opacity-50";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(base, className)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(base, className)}
    >
      {children}
    </button>
  );
}
