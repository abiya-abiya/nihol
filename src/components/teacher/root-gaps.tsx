"use client";

import { FileText } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ClassReport } from "@/lib/types";
import { initials, skillTitle, worksheetHref } from "@/lib/teacher/view";
import { normalizeUz } from "@/lib/uz";

const MAX_AVATARS = 6;

export function RootGaps({ report }: { report: ClassReport }) {
  const reduce = useReducedMotion();
  const done = report.students.filter((s) => s.snapshot?.diagnosticDone).length || 1;
  const nameOf = new Map(report.students.map((s) => [s.student.id, normalizeUz(s.student.name)]));
  const gaps = report.topRootGaps.slice(0, 4);

  return (
    <section aria-labelledby="root-gaps-title" className="sheet flex flex-col px-5 pt-4 pb-2">
      <h2 id="root-gaps-title" className="text-lg font-bold">
        Sinfning ildiz muammolari
      </h2>
      <p className="text-ink-soft text-sm">Bir xil ildizli oʻquvchilar — bitta mashq varaqasi</p>

      {gaps.length === 0 ? (
        <p className="text-ink-soft py-6 text-center text-[0.95rem]">
          Hozircha ildiz muammo topilmadi. Oʻquvchilar diagnostikadan oʻtgach, shu yerda paydo boʻladi.
        </p>
      ) : (
        <ol className="mt-2 flex flex-col">
          {gaps.map((g, i) => {
            const share = g.studentIds.length / done;
            return (
              <li
                key={g.skillId}
                className="border-border grid grid-cols-[1fr_auto] items-center gap-x-4 border-t py-2.5 first:border-t-0"
              >
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-[1.02rem] font-bold" title={skillTitle(g.skillId)}>
                      {skillTitle(g.skillId)}
                    </span>
                    <span className="tabular shrink-0 text-sm font-bold">
                      <span className="font-display text-base">{g.studentIds.length}</span> oʻquvchi
                    </span>
                  </div>
                  <span className="bg-ink-wash relative mt-1.5 block h-2 overflow-hidden rounded-full">
                    <motion.span
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: i === 0 ? "var(--red-pen)" : "color-mix(in oklab, var(--red-pen) 55%, white)",
                      }}
                      initial={reduce ? false : { width: 0 }}
                      animate={{ width: `${Math.max(share * 100, 4)}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 22 }}
                    />
                  </span>
                  <div
                    className="mt-1.5 hidden items-center [@media(min-height:800px)]:flex"
                    aria-label={g.studentIds.map((id) => nameOf.get(id)).join(", ")}
                  >
                    {g.studentIds.slice(0, MAX_AVATARS).map((id) => (
                      <span
                        key={id}
                        title={nameOf.get(id)}
                        className="bg-ink-wash text-ink -ml-1.5 grid size-7 place-items-center rounded-full border-2 border-white text-[0.68rem] font-bold first:ml-0"
                      >
                        {initials(nameOf.get(id) ?? "?")}
                      </span>
                    ))}
                    {g.studentIds.length > MAX_AVATARS && (
                      <span className="text-ink-soft ml-1.5 text-xs font-semibold">
                        +{g.studentIds.length - MAX_AVATARS}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  asChild
                  variant={i === 0 ? "default" : "outline"}
                  className="h-10 rounded-[14px] px-3.5 text-sm font-semibold"
                  aria-label={`${skillTitle(g.skillId)}: mashq varaqasi yaratish`}
                >
                  <Link href={worksheetHref(report, g.skillId, g.studentIds)}>
                    <FileText aria-hidden />
                    Varaqa
                  </Link>
                </Button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
