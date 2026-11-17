"use client";

import { motion, useReducedMotion } from "motion/react";
import { Frac } from "@/components/brand/frac";
import { skillShort, skillTitle } from "@/lib/teacher/view";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Timeline (s): strike → question → line + chips → root → callout. */
const T = { strike: 0.5, ask: 1.15, line: 1.45, chip: 0.42, root: 3.0, note: 3.45 };

const CHAIN = ["frac-add-diff", "frac-common-denom", "lcm"] as const;

/**
 * The product's "aha" in one object: a wrong answer, crossed out in red pen,
 * traced down the prerequisite chain to its root. Ends visible with reduced motion.
 */
export function RootTrace({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const at = (delay: number) => (reduce ? { duration: 0 } : { duration: 0.5, ease: EASE, delay });
  const from = (o: Record<string, number>) => (reduce ? false : o);

  return (
    <div className={cn("relative", className)} aria-label="Misol: xatodan ildizgacha iz">
      {/* the wrong answer */}
      <div className="relative inline-flex items-center gap-4">
        <div className="sheet font-display text-ink relative inline-flex items-center gap-2 px-5 py-3 text-[1.9rem] font-bold sm:text-[2.4rem]">
          <Frac n={1} d={2} size="lg" />
          <span>+</span>
          <Frac n={1} d={3} size="lg" />
          <span>=</span>
          <span className="relative inline-flex">
            <Frac n={2} d={5} size="lg" />
            <svg
              className="pointer-events-none absolute -inset-x-2 -inset-y-1 h-[calc(100%+0.5rem)] w-[calc(100%+1rem)] overflow-visible"
              viewBox="0 0 40 40"
              preserveAspectRatio="none"
              aria-hidden
            >
              <motion.path
                d="M 3 34 C 14 26, 26 16, 38 5"
              fill="none"
              stroke="var(--red-pen)"
              strokeWidth="3.4"
              strokeLinecap="round"
              initial={from({ pathLength: 0 })}
              animate={{ pathLength: 1 }}
              transition={reduce ? { duration: 0 } : { duration: 0.45, ease: "easeOut", delay: T.strike }}
              />
            </svg>
          </span>
        </div>
        <motion.span
          className="font-hand text-red-pen text-[2rem] leading-none font-bold sm:text-[2.4rem]"
          initial={from({ opacity: 0, x: -6, rotate: -8 })}
          animate={{ opacity: 1, x: 0, rotate: -6 }}
          transition={at(T.ask)}
        >
          nega?
        </motion.span>
      </div>

      {/* the trace down to the root */}
      <div className="relative mt-3 ml-7 pl-9 sm:ml-9 sm:pl-11">
        <motion.span
          aria-hidden
          className="bg-red-pen absolute top-0 bottom-[78px] left-0 w-[3px] origin-top rounded-full"
          initial={from({ scaleY: 0 })}
          animate={{ scaleY: 1 }}
          transition={reduce ? { duration: 0 } : { duration: CHAIN.length * T.chip, ease: "easeInOut", delay: T.line }}
        />
        <ol className="flex flex-col gap-4 pt-4 pb-12">
          {CHAIN.map((c, i) => {
            const isRoot = i === CHAIN.length - 1;
            return (
              <motion.li
                key={c}
                className="relative flex items-center gap-3"
                initial={from({ opacity: 0, y: -8 })}
                animate={{ opacity: 1, y: 0 }}
                transition={at(isRoot ? T.root : T.line + i * T.chip + 0.15)}
              >
                {/* connector tick from the red line */}
                <span aria-hidden className="bg-red-pen absolute top-1/2 -left-9 h-[3px] w-7 rounded-full sm:-left-11 sm:w-9" />
                {isRoot ? (
                  <span className="relative">
                    {!reduce && (
                      <motion.span
                        aria-hidden
                        className="bg-red-pen/25 absolute -inset-2.5 rounded-full"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: [0, 1, 0.35, 1, 0.35], scale: [0.8, 1.08, 1, 1.08, 1] }}
                        transition={{ duration: 2.4, delay: T.root + 0.2, repeat: Infinity, repeatDelay: 1.2 }}
                      />
                    )}
                    <span className="border-red-pen text-red-pen font-display relative inline-flex items-center rounded-full border-[3px] bg-white px-5 py-2 text-[1.35rem] font-bold sm:text-[1.6rem]">
                      {skillTitle(c)}
                    </span>
                  </span>
                ) : (
                  <span className="border-border relative inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-[1rem] font-semibold shadow-[var(--shadow-sheet)] sm:text-[1.08rem]">
                    <span className="bg-red-pen size-2.5 rounded-full" aria-hidden />
                    <span title={skillTitle(c)}>{skillShort(c)}</span>
                  </span>
                )}
                {isRoot ? (
                  <motion.span
                    className="font-hand text-red-pen absolute top-full left-2 mt-2 -rotate-3 text-[1.9rem] leading-none font-bold whitespace-nowrap sm:text-[2.2rem]"
                    initial={from({ opacity: 0, x: -10 })}
                    animate={{ opacity: 1, x: 0 }}
                    transition={at(T.note)}
                  >
                    ildiz shu yerda!
                  </motion.span>
                ) : null}
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
