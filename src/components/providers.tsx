"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  // "user" respects the visitor's prefers-reduced-motion setting
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
