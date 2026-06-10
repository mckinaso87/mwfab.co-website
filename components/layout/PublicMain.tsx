"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { MotionProvider } from "@/components/motion/MotionProvider";

type PublicMainProps = {
  children: ReactNode;
};

/** Wraps public routes with MotionProvider; admin routes render without motion context. */
export function PublicMain({ children }: PublicMainProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <MotionProvider>
      <main className="flex-1">{children}</main>
    </MotionProvider>
  );
}
