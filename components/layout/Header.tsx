"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { isAdminRole } from "@/lib/auth-constants";
import { HeaderNav } from "./HeaderNav";
import { HeaderAuth } from "./HeaderAuth";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;
  const isAdmin = isAdminRole(role);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-steel/50 bg-charcoal/95 backdrop-blur supports-[backdrop-filter]:bg-charcoal/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground no-underline transition-opacity hover:opacity-90"
          aria-label="McKinados Welding & Fabrication home"
        >
          <span className="relative h-8 w-[92px] flex-shrink-0 md:h-9 md:w-[116px]">
            <Image
              src="/images/logo/mwf-logo.png"
              alt="MWFAB logo"
              width={320}
              height={120}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span className="font-semibold tracking-tight md:text-lg">
            McKinados Welding
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          <HeaderNav />
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md text-foreground md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span className="sr-only">Toggle menu</span>
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          "border-t border-steel/50 bg-charcoal md:hidden",
          mobileOpen ? "block" : "hidden"
        )}
        role="region"
        aria-label="Mobile menu"
      >
        <div className="container mx-auto flex flex-col gap-1 px-4 py-4">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-2 text-foreground-muted transition-colors hover:bg-steel/30 hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="mt-2 rounded-md bg-steel-blue px-3 py-2 text-center font-medium text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Request a Bid
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="mt-2 rounded-md border border-steel/50 px-3 py-2 text-center font-medium text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Admin
            </Link>
          )}
          <div className="mt-3 flex justify-center">
            <HeaderAuth />
          </div>
        </div>
      </div>
    </header>
  );
}
