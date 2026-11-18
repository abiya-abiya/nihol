"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Timeline (s): strike → question → line + chips → root → callout. */
const T = { strike: 0.6, ask: 1.15, line: 1.45, chip: 0.5, root: 2.6, note: 3.05 };
const CYCLE_MS = 8000;

/** Real lessons and prerequisites from the seeded subjects (src/content/subjects). */
const EXAMPLES = [
  {
    subject: "Biologiya",
    color: "#0e7490",
    question: "Fotosintez ösimlikning qaysi qismida boradi?",
    answer: "Ildizda",
    chain: ["Barg va fotosintez", "Ösimlik töqimalari"],
    root: "Hujayra tuzilişi",
  },
  {
    subject: "Kimyo",
    color: "#c2410c",
    question: "Suv (H₂O) neçta elementdan tuzilgan?",
    answer: "3 ta",
    chain: ["Suv – eng muhim modda", "Kimyoviy formulalar"],
    root: "Atom va kimyoviy element",
  },
  {
    subject: "Ingliz tili",
    color: "#7c3aed",
    question: "Yesterday I ___ to the park.",
    answer: "go",
    chain: ["Past Simple zamoni"],
    root: "Present Simple zamoni",
  },
] as const;

/**
 * The product's "aha" in one object: a wrong answer, crossed out in red pen,
 * traced down the lesson chain to its root. Cycles through subjects to show it works for any of them.
 * Ends visible with reduced motion (no auto-cycle; the tabs still switch).
 */
export function RootTrace({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (reduce || !auto) return;
    const t = window.setTimeout(() => setI((x) => (x + 1) % EXAMPLES.length), CYCLE_MS);
    return () => window.clearTimeout(t);
  }, [i, auto, reduce]);

  const ex = EXAMPLES[i];
  const at = (delay: number) => (reduce ? { duration: 0 } : { duration: 0.5, ease: EASE, delay });
  const from = (o: Record<string, number>) => (reduce ? false : o);

  return (
    <div className={cn("relative w-full max-w-[34rem] min-w-0", className)} aria-label="Misol: xatodan asl sababgaça iz">
      {/* subject tabs */}
      <div role="tablist" aria-label="Fan" className="mb-4 flex flex-wrap gap-2">
        {EXAMPLES.map((e, k) => (
          <button
            key={e.subject}
            type="button"
            role="tab"
            aria-selected={k === i}
            onClick={() => {
              setI(k);
              setAuto(false);
            }}
            className={cn(
              "rounded-full border-2 px-3.5 py-1 text-sm font-bold transition",
              k === i ? "border-transparent text-white" : "border-[rgb(246_243_234/0.35)] text-[rgb(246_243_234/0.85)] hover:border-[rgb(246_243_234/0.7)]",
            )}
            style={k === i ? { background: e.color } : undefined}
          >
            {e.subject}
          </button>
        ))}
      </div>

      <div className="min-h-[360px] sm:min-h-[380px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={ex.subject}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {/* the wrong answer */}
            <div className="relative flex items-end gap-3">
              <div className="sheet text-ink relative max-w-[26rem] px-5 py-4">
                <span className="absolute inset-x-0 top-0 h-1.5 rounded-t-[inherit]" style={{ background: ex.color }} aria-hidden />
                <p className="text-sm font-bold" style={{ color: ex.color }}>
                  {ex.subject}
                </p>
                <p className="font-display mt-1 text-[1.1rem] leading-snug font-bold sm:text-[1.25rem]">{ex.question}</p>
                <p className="mt-3 text-[1.05rem] font-semibold">
                  Javob:{" "}
                  <span className="relative inline-block px-1">
                    {ex.answer}
                    <svg
                      className="pointer-events-none absolute -inset-x-1 -inset-y-1 h-[calc(100%+0.5rem)] w-[calc(100%+0.5rem)] overflow-visible"
                      viewBox="0 0 40 40"
                      preserveAspectRatio="none"
                      aria-hidden
                    >
                      <motion.path
                        d="M 2 32 C 14 26, 26 16, 38 8"
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
                </p>
              </div>
              <motion.span
                className="font-hand text-red-pen shrink-0 text-[2rem] leading-none font-bold sm:text-[2.4rem]"
                initial={from({ opacity: 0, x: -6, rotate: -8 })}
                animate={{ opacity: 1, x: 0, rotate: -6 }}
                transition={at(T.ask)}
              >
                nega?
              </motion.span>
            </div>

            {/* the trace down to the root */}
            <div className="relative mt-3 ml-6 pl-8">
              <motion.span
                aria-hidden
                className="bg-red-pen absolute top-0 bottom-[78px] left-0 w-[3px] origin-top rounded-full"
                initial={from({ scaleY: 0 })}
                animate={{ scaleY: 1 }}
                transition={reduce ? { duration: 0 } : { duration: (ex.chain.length + 1) * T.chip, ease: "easeInOut", delay: T.line }}
              />
              <ol className="flex flex-col gap-4 pt-4 pb-12">
                {ex.chain.map((c, k) => (
                  <motion.li
                    key={c}
                    className="relative flex items-center gap-3"
                    initial={from({ opacity: 0, y: -8 })}
                    animate={{ opacity: 1, y: 0 }}
                    transition={at(T.line + k * T.chip + 0.15)}
                  >
                    <span aria-hidden className="bg-red-pen absolute top-1/2 -left-8 h-[3px] w-6 rounded-full" />
                    <span className="border-border text-ink relative inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-[0.98rem] font-semibold whitespace-nowrap shadow-[var(--shadow-sheet)]">
                      <span className="bg-red-pen size-2.5 rounded-full" aria-hidden />
                      {c}
                    </span>
                  </motion.li>
                ))}
                <motion.li
                  className="relative flex items-center gap-3"
                  initial={from({ opacity: 0, y: -8 })}
                  animate={{ opacity: 1, y: 0 }}
                  transition={at(T.root)}
                >
                  <span aria-hidden className="bg-red-pen absolute top-1/2 -left-8 h-[3px] w-6 rounded-full" />
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
                    <span className="border-red-pen text-red-pen font-display relative inline-flex max-w-[15rem] items-center rounded-[22px] border-[3px] bg-white px-4 py-2 text-[1.08rem] leading-tight font-bold text-balance 2xl:max-w-none 2xl:text-[1.25rem]">
                      {ex.root}
                    </span>
                  </span>
                  <motion.span
                    className="font-hand text-red-pen absolute top-full left-0 mt-2 -rotate-3 text-[1.7rem] leading-none font-bold whitespace-nowrap sm:text-[1.9rem]"
                    initial={from({ opacity: 0, x: -10 })}
                    animate={{ opacity: 1, x: 0 }}
                    transition={at(T.note)}
                  >
                    nihol şu yerdan östadi!
                  </motion.span>
                </motion.li>
              </ol>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
