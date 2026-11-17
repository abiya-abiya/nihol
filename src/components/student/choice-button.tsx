"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { MathText } from "@/components/brand/math-text";
import type { ChoiceId } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ChoiceState = "idle" | "selected" | "correct" | "wrong" | "dimmed";

/** Big tappable answer option. "wrong" draws a red-pen strike and shakes once. */
export function ChoiceButton({
  id,
  text,
  state = "idle",
  disabled,
  onSelect,
}: {
  id: ChoiceId;
  text: string;
  state?: ChoiceState;
  disabled?: boolean;
  onSelect?: (id: ChoiceId) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => onSelect?.(id)}
      whileTap={disabled || reduce ? undefined : { scale: 0.985 }}
      animate={state === "wrong" && !reduce ? { x: [0, -7, 7, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.38 }}
      aria-pressed={state === "selected"}
      className={cn(
        "group relative flex min-h-16 w-full items-center gap-4 overflow-hidden rounded-2xl border-2 bg-card px-4 py-3 text-left text-lg transition-colors duration-150",
        "disabled:cursor-default",
        state === "idle" && "border-input hover:border-ink hover:bg-ink-wash/40",
        state === "selected" && "border-ink bg-ink text-white",
        state === "correct" && "border-mastered bg-[color-mix(in_oklab,var(--mastered)_11%,white)]",
        state === "wrong" && "border-red-pen/60 bg-[color-mix(in_oklab,var(--red-pen)_6%,white)]",
        state === "dimmed" && "border-input text-ink/45",
      )}
    >
      <span
        className={cn(
          "font-display grid size-9 shrink-0 place-items-center rounded-full border-2 text-sm font-bold uppercase transition-colors",
          state === "selected" ? "border-white bg-white text-ink" : "border-current/25",
          state === "correct" && "border-mastered bg-mastered text-white",
          state === "wrong" && "border-red-pen text-red-pen",
        )}
      >
        {state === "correct" ? <Check className="size-5" strokeWidth={3} /> : id}
      </span>
      <MathText as="span" text={text} className="min-w-0 flex-1 leading-snug break-words" />
      {state === "wrong" && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <motion.line
            x1="4%"
            y1="66%"
            x2="96%"
            y2="38%"
            stroke="var(--red-pen)"
            strokeWidth={2.4}
            strokeLinecap="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          />
        </svg>
      )}
    </motion.button>
  );
}
