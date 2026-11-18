"use client";

import { motion, useReducedMotion } from "motion/react";

const ROOTS = [
  "M100 70 C 98 95, 80 110, 62 130",
  "M100 70 C 104 100, 122 112, 140 128",
  "M100 70 C 100 100, 99 125, 100 150",
  "M62 130 C 54 138, 44 142, 36 150",
  "M140 128 C 150 136, 160 140, 168 146",
];

/** Full-screen interlude between the last question and the result: roots draw themselves. */
export function Analyzing({ text = "Bilim xaritang çizilmoqda…" }: { text?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-6 text-center" role="status" aria-live="polite">
      <svg width="200" height="170" viewBox="0 0 200 170" aria-hidden>
        <motion.path
          d="M100 70 V 34"
          stroke="var(--ink)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.path
          d="M100 44 C 96 28, 80 22, 66 26 C 70 40, 86 46, 100 44 Z"
          fill="var(--mastered)"
          initial={{ scale: reduce ? 1 : 0, originX: "100px", originY: "44px" }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.45, type: "spring", stiffness: 260, damping: 16 }}
        />
        <motion.path
          d="M100 38 C 105 24, 120 19, 132 22 C 129 36, 114 41, 100 38 Z"
          fill="var(--mastered)"
          opacity={0.8}
          initial={{ scale: reduce ? 1 : 0, originX: "100px", originY: "38px" }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 16 }}
        />
        <line x1="30" y1="70" x2="170" y2="70" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
        {ROOTS.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke="var(--ink-soft)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.18, duration: 0.7, ease: "easeOut" }}
          />
        ))}
        <motion.circle
          cx="100"
          cy="150"
          r="7"
          fill="var(--red-pen)"
          initial={{ scale: reduce ? 1 : 0 }}
          animate={{ scale: reduce ? 1 : [0, 1.3, 1] }}
          transition={{ delay: 1.1, duration: 0.5 }}
        />
      </svg>
      <p className="font-display text-xl font-semibold">{text}</p>
    </div>
  );
}
