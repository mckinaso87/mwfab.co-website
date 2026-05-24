"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", accent: "admin-sky" },
  { href: "/admin/customers", label: "Customers", accent: "admin-teal" },
  { href: "/admin/jobs", label: "Jobs", accent: "admin-amber" },
  { href: "/admin/materials", label: "Materials", accent: "admin-copper" },
  { href: "/admin/staff", label: "Staff", accent: "admin-indigo" },
  { href: "/admin/settings", label: "Settings", accent: "steel-blue" },
] as const;

type NavAccent = (typeof ADMIN_NAV)[number]["accent"];

const ACCENT_STYLES: Record<
  NavAccent,
  { dot: string; activeBorder: string; activeBg: string; hoverBg: string }
> = {
  "admin-sky": {
    dot: "bg-admin-sky",
    activeBorder: "border-l-admin-sky",
    activeBg: "from-admin-sky/20 to-steel-blue/30",
    hoverBg: "hover:bg-admin-sky/10",
  },
  "admin-teal": {
    dot: "bg-admin-teal",
    activeBorder: "border-l-admin-teal",
    activeBg: "from-admin-teal/20 to-steel-blue/25",
    hoverBg: "hover:bg-admin-teal/10",
  },
  "admin-amber": {
    dot: "bg-admin-amber",
    activeBorder: "border-l-admin-amber",
    activeBg: "from-admin-amber/20 to-admin-copper/25",
    hoverBg: "hover:bg-admin-amber/10",
  },
  "admin-copper": {
    dot: "bg-admin-copper",
    activeBorder: "border-l-admin-copper",
    activeBg: "from-admin-copper/25 to-steel-blue/20",
    hoverBg: "hover:bg-admin-copper/10",
  },
  "admin-indigo": {
    dot: "bg-admin-indigo",
    activeBorder: "border-l-admin-indigo",
    activeBg: "from-admin-indigo/20 to-steel-blue/25",
    hoverBg: "hover:bg-admin-indigo/10",
  },
  "steel-blue": {
    dot: "bg-steel-blue",
    activeBorder: "border-l-steel-blue",
    activeBg: "from-steel-blue/35 to-gunmetal/50",
    hoverBg: "hover:bg-steel/40",
  },
};

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-20 z-50 flex h-10 w-10 items-center justify-center rounded-md border border-admin-copper/30 bg-gunmetal text-foreground shadow-lg shadow-black/20 focus-visible:outline focus-visible:ring-2 focus-visible:ring-admin-teal focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal lg:hidden"
        aria-label="Toggle admin menu"
        onClick={() => setMobileOpen((o) => !o)}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {mobileOpen && (
        <AdminSidebarOverlay onClose={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          "gradient-admin-sidebar fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col border-r transition-transform duration-200 lg:top-16 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
          <Link
            href="/admin"
            className="mb-6 rounded-lg border border-admin-copper/25 bg-gradient-to-r from-admin-copper/15 to-admin-teal/10 px-3 py-2.5 text-lg font-semibold text-foreground no-underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-admin-teal focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
            onClick={() => setMobileOpen(false)}
          >
            Admin
          </Link>
          <nav className="flex flex-1 flex-col gap-0.5" aria-label="Admin">
            {ADMIN_NAV.map(({ href, label, accent }) => {
              const active =
                pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
              const styles = ACCENT_STYLES[accent];
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md border-l-[3px] px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-admin-teal focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal",
                    active
                      ? cn("bg-gradient-to-r text-foreground shadow-sm", styles.activeBorder, styles.activeBg)
                      : cn("border-l-transparent text-foreground-muted", styles.hoverBg, "hover:text-foreground")
                  )}
                >
                  <span
                    className={cn("h-2 w-2 shrink-0 rounded-full", styles.dot, active && "ring-2 ring-white/20")}
                    aria-hidden
                  />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-admin-copper/20 pt-4">
            <Link
              href="/"
              className="mb-3 block rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors hover:bg-admin-teal/10 hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-admin-teal focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal focus-visible:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              ← Back to site
            </Link>
            <div className="flex items-center gap-2 rounded-lg bg-charcoal/40 px-3 py-2">
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

function AdminSidebarOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 bg-charcoal/80 backdrop-blur-sm lg:hidden"
      aria-hidden
      onClick={onClose}
    />
  );
}
