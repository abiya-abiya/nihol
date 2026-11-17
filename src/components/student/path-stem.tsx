"use client";

import { Check, Lock } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { MasteryRing } from "@/components/brand/mastery-ring";
import type { PathStep, SkillId, SkillState } from "@/lib/types";
import { normalizeUz } from "@/lib/uz";
import { cn } from "@/lib/utils";

const ROW = 118;
const SWAY = 54;

/**
 * The personal path as a stem growing from the root (bottom) to the target (top).
 * path[0] is the first step, drawn lowest.
 */
export function PathStem({
  path,
  skills,
  titleOf,
  onOpen,
}: {
  path: PathStep[];
  skills: Record<SkillId, SkillState>;
  titleOf: (id: SkillId) => string;
  onOpen: (step: PathStep) => void;
}) {
  const reduce = useReducedMotion();
  const n = path.length;
  const height = n * ROW + 40;
  const xOf = (i: number) => (i % 2 === 0 ? -SWAY : SWAY) * (n === 1 ? 0 : 1);
  const yOf = (i: number) => height - 70 - i * ROW; // i = 0 at the bottom

  const points = path.map((_, i) => ({ x: xOf(i), y: yOf(i) }));
  const d = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y + 60} L ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const my = (prev.y + p.y) / 2;
    return `${acc} C ${prev.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`;
  }, "");
  const doneCount = path.filter((s) => s.status === "done").length;
  const grown = n <= 1 ? 1 : Math.min(1, (doneCount + 0.5) / (n - 0.5));

  return (
    <div className="relative mx-auto w-full max-w-md" style={{ height }}>
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`-160 0 320 ${height}`} preserveAspectRatio="xMidYMin meet" aria-hidden>
        <path d={d} fill="none" stroke="var(--grid)" strokeWidth={10} strokeLinecap="round" />
        <motion.path
          d={d}
          fill="none"
          stroke="var(--mastered)"
          strokeWidth={10}
          strokeLinecap="round"
          initial={{ pathLength: reduce ? grown : 0 }}
          animate={{ pathLength: grown }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
        {/* soil and roots under the first step */}
        <g transform={`translate(${points[0]?.x ?? 0} ${height - 10})`} stroke="var(--ink-soft)" strokeWidth={3} strokeLinecap="round" fill="none">
          <path d="M -70 -10 H 70" stroke="var(--ink)" />
          <path d="M 0 -10 c -4 10 -16 14 -26 20 M 0 -10 c 2 10 14 13 24 18 M 0 -10 v 16" opacity={0.6} />
        </g>
      </svg>

      {path.map((step, i) => {
        const p = points[i];
        const st = skills[step.skillId];
        const current = step.status === "current";
        const done = step.status === "done";
        const size = current ? 76 : 60;
        const labelLeft = p.x > 0;
        return (
          <motion.div
            key={step.skillId}
            className="absolute left-1/2"
            style={{ top: p.y - size / 2, marginLeft: p.x - size / 2, width: size, height: size }}
            initial={reduce ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 260, damping: 20 }}
          >
            {current && !reduce && (
              <motion.span
                className="border-ink absolute inset-0 rounded-full border-4"
                animate={{ scale: [1, 1.35], opacity: [0.45, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                aria-hidden
              />
            )}
            <button
              type="button"
              onClick={() => onOpen(step)}
              aria-label={`${titleOf(step.skillId)} — ${done ? "tugallangan" : current ? "joriy qadam" : "yopiq"}`}
              className={cn(
                "relative grid size-full place-items-center rounded-full border-4 shadow-[var(--shadow-sheet)] transition-transform active:scale-95",
                done && "border-mastered bg-mastered text-white",
                current && "border-ink bg-ink text-white",
                step.status === "locked" && "border-grid bg-card text-ink-soft/60",
              )}
            >
              {done ? (
                <Check className="size-7" strokeWidth={3} />
              ) : current ? (
                <span className="font-display text-xl font-bold">{i + 1}</span>
              ) : (
                <Lock className="size-5" />
              )}
            </button>
            <div
              className={cn(
                "absolute top-1/2 w-[9.5rem] -translate-y-1/2 space-y-1",
                labelLeft ? "right-full mr-3 text-right" : "left-full ml-3 text-left",
              )}
            >
              {step.reason === "root-gap" && (
                <span className="bg-red-pen-strong inline-block rounded-full px-2 py-0.5 text-[11px] font-bold text-white">Ildiz</span>
              )}
              {step.reason === "target" && (
                <span className="bg-ink-wash text-ink inline-block rounded-full px-2 py-0.5 text-[11px] font-bold">Maqsad</span>
              )}
              <p className={cn("text-sm leading-snug font-semibold", step.status === "locked" && "text-ink-soft")}>
                {normalizeUz(titleOf(step.skillId))}
              </p>
              {st && st.attempts > 0 && (
                <div className={cn("flex items-center gap-1.5", labelLeft && "justify-end")}>
                  <MasteryRing p={st.p} size={18} />
                  <span className="text-muted-foreground tabular text-xs">{Math.round(st.p * 100)}%</span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
