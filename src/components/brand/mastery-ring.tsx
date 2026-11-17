"use client";

import NumberFlow from "@number-flow/react";
import { motion, useReducedMotion } from "motion/react";
import { levelOf } from "@/engine/bkt";
import type { MasteryLevel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { levelColor } from "./levels";

/** Ring that fills to p (0..1), coloured by level. Shows the percentage when large enough. */
export function MasteryRing({
  p,
  size = 44,
  level,
  showValue,
  className,
}: {
  p: number;
  size?: number;
  level?: MasteryLevel;
  showValue?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const lvl = level ?? levelOf({ skillId: "", p, attempts: 1, correct: 0, inferred: false, misconceptions: {} });
  const stroke = Math.max(3, size * 0.11);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const value = Math.max(0, Math.min(1, p));
  const withValue = showValue ?? size >= 56;

  return (
    <span className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ink-wash)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={levelColor(lvl)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - value) }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 22 }}
        />
      </svg>
      {withValue && (
        <span
          className="font-display tabular absolute font-semibold"
          style={{ fontSize: size * 0.26 }}
          aria-label={`${Math.round(value * 100)} foiz`}
        >
          <NumberFlow value={Math.round(value * 100)} suffix="%" />
        </span>
      )}
    </span>
  );
}
