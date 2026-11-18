"use client";

import { Check, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ClassReport } from "@/lib/types";
import { misconceptionTitle, shortName, skillShort, timeAgo } from "@/lib/teacher/view";
import { cn } from "@/lib/utils";

export function ActivityFeed({ report }: { report: ClassReport }) {
  const reduce = useReducedMotion();
  const items = report.recentAttempts.slice(0, 14);
  if (!items.length) {
    return (
      <p className="text-ink-soft py-6 text-center">Hali javoblar yöq. Öquvçilar boşlaşi bilan şu yerda körinadi.</p>
    );
  }
  return (
    <ol className="flex flex-col" aria-live="polite">
      <AnimatePresence initial={false}>
        {items.map((a) => (
          <motion.li
            key={a.id}
            layout={reduce ? false : "position"}
            initial={reduce ? false : { opacity: 0, y: -14, backgroundColor: "rgba(255,228,92,0.45)" }}
            animate={{ opacity: 1, y: 0, backgroundColor: "rgba(255,228,92,0)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-[auto_1fr_auto] items-start gap-x-3 rounded-lg px-1 py-1.5"
          >
            <span
              className={cn(
                "mt-0.5 grid size-6 place-items-center rounded-full",
                a.correct ? "bg-mastered/15 text-mastered" : "bg-red-pen/12 text-red-pen",
              )}
            >
              {a.correct ? (
                <Check className="size-3.5" strokeWidth={3} aria-label="töğri" />
              ) : (
                <X className="size-3.5" strokeWidth={3} aria-label="xato" />
              )}
            </span>
            <span className="min-w-0 text-[0.95rem] leading-snug">
              <span className="font-semibold">{shortName(a.studentName)}</span>
              <span className="text-ink-soft"> — {skillShort(a.skillId)}</span>
              {!a.correct && a.misconceptionId && (
                <span className="text-red-pen block truncate text-sm font-medium">
                  {misconceptionTitle(a.misconceptionId)}
                </span>
              )}
            </span>
            <span className="text-ink-soft tabular pt-0.5 text-xs whitespace-nowrap">
              {timeAgo(a.ts, report.generatedAt)}
            </span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ol>
  );
}
