"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useReducedMotionPreference } from "./MotionProvider";

type StickySectionProps = {
  children: ReactNode;
  className?: string;
  stickyClassName?: string;
};

export function StickySection({
  children,
  className,
  stickyClassName,
}: StickySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionPreference();

  if (reducedMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div
        className={cn(
          "lg:sticky lg:top-24 lg:min-h-[50vh] lg:flex lg:items-center",
          stickyClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
