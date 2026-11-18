"use client";

import NumberFlow from "@number-flow/react";
import type { ClassReport } from "@/lib/types";
import { isInProgress, skillShort } from "@/lib/teacher/view";
import { cn } from "@/lib/utils";

function Tile({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col justify-center gap-0.5 px-6 py-2.5", className)}>
      <span className="text-ink-soft text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}

export function KpiTiles({ report }: { report: ClassReport }) {
  const total = report.students.length;
  const done = report.students.filter((s) => !isInProgress(s)).length;
  const finished = report.students.filter((s) => !isInProgress(s));
  const avg = finished.length ? finished.reduce((a, s) => a + s.masteryAvg, 0) / finished.length : 0;
  const top = report.topRootGaps[0];

  return (
    <section
      aria-label="Sinf körsatkiçlari"
      className="sheet divide-border grid grid-cols-[1fr_1fr_1fr_1.6fr] divide-x overflow-hidden"
    >
      <Tile label="Öquvçilar">
        <span className="font-display tabular text-[1.75rem] leading-none font-bold">
          <NumberFlow value={total} />
        </span>
      </Tile>
      <Tile label="Diagnostikadan ötdi">
        <span className="flex items-baseline gap-1.5">
          <span className="font-display tabular text-[1.75rem] leading-none font-bold">
            <NumberFlow value={done} />
          </span>
          <span className="text-ink-soft tabular text-lg font-semibold">/ {total}</span>
        </span>
      </Tile>
      <Tile label="Örtaça özlaştiriş">
        <span className="font-display tabular text-[1.75rem] leading-none font-bold">
          <NumberFlow value={Math.round(avg * 100)} suffix="%" />
        </span>
      </Tile>
      <Tile label="Eng köp uçragan ildiz muammo" className="bg-red-pen/[0.04]">
        {top ? (
          <span className="flex min-w-0 items-baseline gap-3">
            <span className="font-display marker truncate text-[1.5rem] leading-tight font-bold">
              {skillShort(top.skillId)}
            </span>
            <span className="text-red-pen tabular shrink-0 text-lg font-bold">
              <NumberFlow value={top.studentIds.length} /> öquvçi
            </span>
          </span>
        ) : (
          <span className="text-ink-soft text-lg font-semibold">Hali aniqlanmagan</span>
        )}
      </Tile>
    </section>
  );
}
