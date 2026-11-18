"use client";

import NumberFlow from "@number-flow/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { periodStats, type PeriodDays } from "@/lib/teacher/period-stats";
import type { ProgressPoint, SubjectMeta, Submission } from "@/lib/types";
import { cn } from "@/lib/utils";

const PERIODS: Array<{ days: PeriodDays; label: string; bucket: string }> = [
  { days: 7, label: "Hafta", bucket: "kun" },
  { days: 30, label: "Oy", bucket: "hafta" },
  { days: 90, label: "Çorak", bucket: "oy" },
];

const pct = (x: number) => Math.round(x * 100);
const signed = (x: number) => {
  const v = pct(x);
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v)}%`;
};
const dm = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;

/** Class and per-student stats for one subject over a week, a month or a quarter. */
export function PeriodStats({
  subject,
  students,
  submissions,
  history,
  labels = { entity: "Öquvçi", active: "Faol öquvçilar", table: "Öquvçilar statistikasi" },
}: {
  labels?: { entity: string; active: string; table: string };
  subject: SubjectMeta;
  students: Array<{ id: string; name: string }>;
  submissions: Submission[];
  history: ProgressPoint[];
}) {
  const [days, setDays] = useState<PeriodDays>(30);
  const s = useMemo(
    () => periodStats({ students, submissions, history, subjectId: subject.id, days }),
    [students, submissions, history, subject.id, days],
  );
  const period = PERIODS.find((p) => p.days === days)!;
  const rows = [...s.rows].sort((a, b) => (b.change ?? -2) - (a.change ?? -2));
  const trend = s.score !== null && s.prevScore !== null ? s.score - s.prevScore : null;

  return (
    <section aria-label="Statistika" className="sheet flex min-w-0 flex-col gap-4 p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Statistika · {subject.name}</h2>
        <div role="radiogroup" aria-label="Davr" className="bg-ink-wash flex rounded-xl p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              role="radio"
              aria-checked={p.days === days}
              onClick={() => setDays(p.days)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-sm font-semibold transition",
                p.days === days ? "bg-ink text-white shadow-sm" : "text-ink hover:bg-white",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Yeçilgan testlar">
          <NumberFlow value={s.tests} className="font-display tabular text-[1.6rem] leading-none font-bold" />
        </Stat>
        <Stat label="Örtaça ball">
          {s.score === null ? (
            <span className="text-ink-soft font-semibold">Hali yöq</span>
          ) : (
            <span className="flex items-baseline gap-2">
              <NumberFlow value={pct(s.score)} suffix="%" className="font-display tabular text-[1.6rem] leading-none font-bold" />
              {trend !== null && Math.abs(trend) >= 0.005 && (
                <span className={cn("flex items-center text-sm font-bold", trend > 0 ? "text-[#1f7a43]" : "text-red-pen")}>
                  {trend > 0 ? <ArrowUpRight className="size-4" aria-hidden /> : <ArrowDownRight className="size-4" aria-hidden />}
                  {signed(trend)}
                </span>
              )}
            </span>
          )}
        </Stat>
        <Stat label={labels.active}>
          <span className="font-display tabular text-[1.6rem] leading-none font-bold">
            {s.active}
            <span className="text-ink-soft text-base">/{students.length}</span>
          </span>
        </Stat>
        <Stat label="Özlaştiriş ösişi">
          <span className={cn("font-display tabular text-[1.6rem] leading-none font-bold", (s.change ?? 0) < 0 && "text-red-pen")}>
            {s.change === null ? "—" : signed(s.change)}
          </span>
        </Stat>
      </div>

      <div>
        <p className="text-ink-soft mb-2 text-sm font-medium">Örtaça ball har {period.bucket} böyiça</p>
        <div className="flex h-28 items-end gap-1.5" role="list" aria-label={`Örtaça ball har ${period.bucket} böyiça`}>
          {s.buckets.map((b) => (
            <div key={b.from} role="listitem" className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${dm(b.from)}: ${b.score === null ? "test yöq" : `${pct(b.score)}% · ${b.tests} ta test`}`}>
              <span className="tabular text-ink-soft text-[0.7rem] font-semibold">{b.score === null ? "" : pct(b.score)}</span>
              <span
                className="w-full rounded-t-md"
                style={{ height: `${b.score === null ? 3 : Math.max(6, b.score * 72)}px`, background: b.score === null ? "var(--border)" : subject.color }}
              />
              <span className="tabular text-ink-soft truncate text-[0.68rem]">{dm(b.from)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">{labels.table}</caption>
          <thead className="text-ink-soft sticky top-0 bg-white text-left text-[0.8rem]">
            <tr>
              <th className="py-1.5 pr-2 font-semibold">{labels.entity}</th>
              <th className="px-2 text-right font-semibold">Testlar</th>
              <th className="px-2 text-right font-semibold">Ball</th>
              <th className="pl-2 text-right font-semibold">Ösiş</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-border border-t">
                <td className="max-w-[12rem] truncate py-1.5 pr-2 font-semibold">{r.name}</td>
                <td className="tabular px-2 text-right">{r.tests}</td>
                <td className="tabular px-2 text-right">{r.score === null ? "—" : `${pct(r.score)}%`}</td>
                <td
                  className={cn(
                    "tabular pl-2 text-right font-bold",
                    r.change === null || Math.abs(r.change) < 0.005 ? "text-ink-soft" : r.change > 0 ? "text-[#1f7a43]" : "text-red-pen",
                  )}
                >
                  {r.change === null ? "—" : signed(r.change)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-border flex min-w-0 flex-col gap-1 rounded-2xl border px-4 py-3">
      <span className="text-ink-soft text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}
