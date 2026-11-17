"use client";

import { MathText } from "@/components/brand/math-text";
import { misconceptionsById } from "@/lib/content";
import type { ClassReport } from "@/lib/types";
import { normalizeUz } from "@/lib/uz";

export function Misconceptions({ report }: { report: ClassReport }) {
  const list = report.topMisconceptions.filter((m) => misconceptionsById[m.misconceptionId]).slice(0, 6);
  if (!list.length) {
    return <p className="text-ink-soft py-6 text-center">Hali xato turlari aniqlanmagan.</p>;
  }
  return (
    <ul className="flex flex-col">
      {list.map((m) => {
        const mc = misconceptionsById[m.misconceptionId];
        return (
          <li
            key={m.misconceptionId}
            className="border-border grid grid-cols-[1fr_auto] items-center gap-x-4 border-t py-2.5 first:border-t-0"
          >
            <div className="min-w-0">
              <p className="leading-snug font-semibold">{normalizeUz(mc.title)}</p>
              <MathText
                text={mc.example}
                as="span"
                fracSize="sm"
                className="text-red-pen text-[0.95rem] font-semibold"
              />
            </div>
            <div className="text-right">
              <span className="font-display tabular block text-xl leading-tight font-bold">{m.studentIds.length}</span>
              <span className="text-ink-soft text-xs font-medium">oʻquvchi</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
