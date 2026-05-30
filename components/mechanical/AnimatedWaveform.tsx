"use client";

import { motion } from "framer-motion";

interface AnimatedWaveformProps {
  active: boolean;
  bars?: number;
}

// Deterministic per-bar timing so SSR/CSR match and motion feels organic.
function durationFor(i: number): number {
  return 0.7 + ((i * 37) % 60) / 100;
}

function delayFor(i: number): number {
  return ((i * 13) % 50) / 100;
}

export function AnimatedWaveform({ active, bars = 28 }: AnimatedWaveformProps) {
  return (
    <div
      role="img"
      aria-label={active ? "Recording waveform" : "Idle waveform"}
      className="flex h-24 w-full items-end justify-center gap-1.5 overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/60 px-4 py-3 shadow-inner"
    >
      {Array.from({ length: bars }, (_, i) => (
        <motion.div
          key={i}
          className="h-full w-1.5 origin-bottom rounded-full bg-gradient-to-t from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_8px_rgba(99,102,241,0.35)]"
          initial={{ scaleY: 0.15 }}
          animate={
            active
              ? { scaleY: [0.2, 0.85, 0.35, 0.75, 0.25] }
              : { scaleY: 0.15 }
          }
          transition={
            active
              ? {
                  duration: durationFor(i),
                  delay: delayFor(i),
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}
