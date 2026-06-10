"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useReducedMotionPreference } from "./MotionProvider";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reducedMotion = useReducedMotionPreference();

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      animate={
        isInView
          ? { opacity: 1, y: 0 }
          : reducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y }
      }
      transition={{
        duration: reducedMotion ? 0 : 0.7,
        delay: reducedMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
