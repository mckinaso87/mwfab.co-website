"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { isAdminRole } from "@/lib/auth-constants";
import { HeaderAuth } from "./HeaderAuth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
] as const;

export function HeaderNav() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;
  const isAdmin = isAdminRole(role);

  return (
    <>
      {NAV_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="text-sm text-foreground-muted transition-colors hover:text-foreground"
        >
          {label}
        </Link>
      ))}
      <Link
        href="/contact"
        className="btn-cta"
      >
        Request a Bid
      </Link>
      {isAdmin && (
        <Link
          href="/admin"
          className="rounded-md border border-steel/50 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-steel/50"
        >
          Admin
        </Link>
      )}
      <ThemeToggle />
      <HeaderAuth />
    </>
  );
}
