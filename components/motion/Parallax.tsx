"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

import { useReducedMotionPreference } from "./MotionProvider";

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  offset?: number;
};

export function Parallax({
  children,
  className,
  offset = 40,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionPreference();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const active = !reducedMotion && isDesktop;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const y = useTransform(parallaxY, (value) => (active ? value : 0));

  return (
    <motion.div ref={ref} style={{ y }} className={cn(className)}>
      {children}
    </motion.div>
  );
}
