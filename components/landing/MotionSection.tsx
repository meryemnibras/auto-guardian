"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface MotionSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}

const variants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

export function MotionSection({
  children,
  className,
  id,
  delay = 0,
}: MotionSectionProps) {
  return (
    <motion.section
      id={id}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      custom={delay}
      variants={variants}
    >
      {children}
    </motion.section>
  );
}
