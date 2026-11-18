"use client";

import { Check, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { MasteryRing } from "@/components/brand/mastery-ring";
import { EASE_OUT_EXPO } from "@/components/brand/motion";
import { SubjectIcon } from "@/components/brand/subject-icon";
import { subjectMastery } from "@/components/lesson/snapshot";
import { SubjectMap } from "@/components/lesson/subject-map";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { ProgressPoint, SubjectContent, SubjectProgress, Submission } from "@/lib/types";
import { normalizeUz } from "@/lib/uz";
import { cn } from "@/lib/utils";

const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr"];
const DAY = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}-${MONTHS[d.getMonth()]}`;
};

export function ParentDashboard({
  childId,
  childName,
  subjects,
  progress,
  history,
  submissions,
}: {
  childId: string;
  childName: string;
  subjects: SubjectContent[];
  progress: SubjectProgress[];
  history: ProgressPoint[];
  submissions: Submission[];
}) {
  const [active, setActive] = useState(subjects[0]?.meta.id);
  const subject = subjects.find((s) => s.meta.id === active) ?? subjects[0];
  const prog = progress.find((p) => p.subjectId === subject?.meta.id) ?? null;

  // one row per day, one column per subject (average mastery %)
  const days = [...new Set(history.map((h) => h.date))].sort();
  const rows = days.map((d) => {
    const row: Record<string, string | number> = { day: DAY(d) };
    for (const s of subjects) {
      const points = history.filter((h) => h.subjectId === s.meta.id && h.date <= d).sort((a, b) => (a.date < b.date ? -1 : 1));
      const last = points[points.length - 1];
      if (last) row[s.meta.id] = Math.round(last.avg * 100);
    }
    return row;
  });
  const config: ChartConfig = Object.fromEntries(subjects.map((s) => [s.meta.id, { label: s.meta.name, color: s.meta.color }]));
  const recent = [...submissions].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)).slice(0, 6);
  const nameOf = (id: string) => subjects.find((s) => s.meta.id === id);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {subjects.map((s, i) => {
          const m = subjectMastery(s, progress.find((p) => p.subjectId === s.meta.id));
          const on = s.meta.id === subject?.meta.id;
          return (
            <motion.button
              key={s.meta.id}
              type="button"
              onClick={() => setActive(s.meta.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: EASE_OUT_EXPO }}
              aria-pressed={on}
              className={cn("sheet relative flex flex-col items-start gap-3 overflow-hidden p-4 text-left transition", on ? "ring-ink ring-2" : "hover:-translate-y-0.5")}
            >
              <span className="absolute inset-x-0 top-0 h-1" style={{ background: s.meta.color }} />
              <div className="flex w-full items-center justify-between">
                <SubjectIcon icon={s.meta.icon} color={s.meta.color} size={38} />
                <MasteryRing p={m} size={46} showValue />
              </div>
              <span className="font-semibold">{s.meta.name}</span>
            </motion.button>
          );
        })}
      </div>

      {subject && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">
            {childName}ning bilim xaritasi — {subject.meta.name}
          </h2>
          <SubjectMap key={subject.meta.id} subject={subject} progress={prog} studentId={childId} />
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="sheet space-y-3 p-5">
          <h2 className="text-lg font-bold">Özlaştiriş dinamikasi</h2>
          {rows.length >= 2 ? (
            <ChartContainer config={config} className="h-64 w-full">
              <LineChart data={rows} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} unit="%" width={44} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {subjects.map((s) => (
                  <Line key={s.meta.id} dataKey={s.meta.id} stroke={s.meta.color} strokeWidth={s.meta.id === active ? 3.5 : 2} dot={false} type="monotone" connectNulls />
                ))}
              </LineChart>
            </ChartContainer>
          ) : (
            <p className="text-muted-foreground">Grafik bir neçta kunlik natijadan keyin paydo böladi.</p>
          )}
        </div>
        <div className="sheet space-y-3 p-5">
          <h2 className="text-lg font-bold">Sönggi natijalar</h2>
          {recent.length === 0 && <p className="text-muted-foreground">Hali test yeçilmagan.</p>}
          <ul className="grid gap-2">
            {recent.map((s) => {
              const sub = nameOf(s.subjectId);
              const lesson = sub?.graph.skills.find((l) => l.id === s.lessonId);
              const good = s.score >= 0.6;
              return (
                <li key={s.id} className="flex items-center gap-3">
                  <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-white", good ? "bg-mastered" : "bg-red-pen-strong")}>
                    {good ? <Check className="size-4" strokeWidth={3} /> : <X className="size-4" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{normalizeUz(lesson?.title ?? sub?.meta.name ?? "Test")}</span>
                    <span className="text-muted-foreground text-xs">
                      {sub?.meta.name}, {DAY(s.submittedAt)}
                    </span>
                  </span>
                  <span className="font-display tabular text-sm font-bold">{Math.round(s.score * 100)}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
