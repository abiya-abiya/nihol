import type { ProgressPoint, Submission } from "@/lib/types";

/** Stats window in days: a week, a month, a quarter (çorak). */
export type PeriodDays = 7 | 30 | 90;

const DAY = 86_400_000;

export interface PeriodRow {
  id: string;
  name: string;
  tests: number;
  /** 0..1, null when no test in the window */
  score: number | null;
  /** mastery change across the window, -1..1; null without history */
  change: number | null;
}

export interface PeriodStats {
  tests: number;
  score: number | null;
  /** the same window right before this one, for the trend arrow */
  prevScore: number | null;
  active: number;
  change: number | null;
  rows: PeriodRow[];
  /** score per day (week), per week (month) or per month (quarter), oldest first */
  buckets: Array<{ from: string; tests: number; score: number | null }>;
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** Mastery value at a moment: the last history point on or before it, else the first one after. */
function masteryAt(points: ProgressPoint[], day: string): number | null {
  if (!points.length) return null;
  let v: number | null = null;
  for (const p of points) if (p.date <= day) v = p.avg;
  return v ?? points[0].avg;
}

export function periodStats(input: {
  students: Array<{ id: string; name: string }>;
  submissions: Submission[];
  history: ProgressPoint[];
  subjectId: string;
  days: PeriodDays;
  now?: Date;
}): PeriodStats {
  const { students, subjectId, days } = input;
  const end = (input.now ?? new Date()).getTime();
  const from = end - days * DAY;
  const subs = input.submissions.filter((s) => s.subjectId === subjectId);
  const inWin = subs.filter((s) => {
    const t = Date.parse(s.submittedAt);
    return t > from && t <= end;
  });
  const prev = subs.filter((s) => {
    const t = Date.parse(s.submittedAt);
    return t > from - days * DAY && t <= from;
  });
  const dayOf = (t: number) => new Date(t).toISOString().slice(0, 10);
  const hist = input.history
    .filter((h) => h.subjectId === subjectId)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const rows: PeriodRow[] = students.map((st) => {
    const mine = inWin.filter((s) => s.studentId === st.id);
    const pts = hist.filter((h) => h.studentId === st.id);
    const a = masteryAt(pts, dayOf(from));
    const b = masteryAt(pts, dayOf(end));
    return { id: st.id, name: st.name, tests: mine.length, score: mean(mine.map((s) => s.score)), change: a === null || b === null ? null : b - a };
  });

  const size = days === 7 ? 1 : days === 30 ? 7 : 30;
  const buckets: PeriodStats["buckets"] = [];
  for (let t = from; t < end; t += size * DAY) {
    const mine = inWin.filter((s) => {
      const x = Date.parse(s.submittedAt);
      return x > t && x <= Math.min(end, t + size * DAY);
    });
    buckets.push({ from: dayOf(t + DAY), tests: mine.length, score: mean(mine.map((s) => s.score)) });
  }

  return {
    tests: inWin.length,
    score: mean(inWin.map((s) => s.score)),
    prevScore: mean(prev.map((s) => s.score)),
    active: rows.filter((r) => r.tests > 0).length,
    change: mean(rows.flatMap((r) => (r.change === null ? [] : [r.change]))),
    rows,
    buckets,
  };
}
