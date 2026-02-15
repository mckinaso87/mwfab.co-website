"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

/** Renders Footer only on non-admin routes so admin has full space without footer overlap. */
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <Footer />;
}
