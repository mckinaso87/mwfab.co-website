"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/materials", label: "Materials" },
  { href: "/admin/staff", label: "Staff" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-20 z-50 flex h-10 w-10 items-center justify-center rounded-md border border-steel/50 bg-charcoal text-foreground lg:hidden"
        aria-label="Toggle admin menu"
        onClick={() => setMobileOpen((o) => !o)}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/80 backdrop-blur-sm lg:hidden"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-steel/50 bg-gunmetal transition-transform duration-200 lg:top-16 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
          <Link
            href="/admin"
            className="mb-6 px-3 py-2 text-lg font-semibold text-foreground no-underline"
            onClick={() => setMobileOpen(false)}
          >
            Admin
          </Link>
          <nav className="flex flex-1 flex-col gap-0.5" aria-label="Admin">
            {ADMIN_NAV.map(({ href, label }) => {
              const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-steel-blue text-foreground"
                      : "text-foreground-muted hover:bg-steel/50 hover:text-foreground"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-steel/50 pt-4">
            <Link
              href="/"
              className="mb-3 block rounded-md px-3 py-2 text-sm text-foreground-muted hover:bg-steel/50 hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              ← Back to site
            </Link>
            <div className="flex items-center gap-2 px-3 py-2">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
              <span className="text-sm text-foreground-muted">Account</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
