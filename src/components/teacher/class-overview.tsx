"use client";

import NumberFlow from "@number-flow/react";
import { ArrowRight, FileText, GitBranch } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { levelColor, levelLabel } from "@/components/brand/levels";
import { FadeIn } from "@/components/brand/motion";
import { SubjectIcon } from "@/components/brand/subject-icon";
import { levelOf } from "@/engine/bkt";
import type { Assignment, ProgressResponse, SkillState, Submission, SubjectContent, SubjectProgress } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LiveBadge } from "./live-badge";

export type OverviewSubject = Pick<SubjectContent, "meta" | "graph">;
export type OverviewAssignment = Pick<Assignment, "id" | "subjectId" | "lessonId" | "title" | "createdAt" | "studentIds">;
export interface OverviewStudent {
  id: string;
  name: string;
}
export interface OverviewData {
  progress: SubjectProgress[];
  submissions: Submission[];
  assignments: OverviewAssignment[];
}

const POLL_MS = 4000;
const STALE_MS = 12_000;

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json();
}

const pct = (x: number) => Math.round(x * 100);

function cellStyle(state: SkillState | undefined): React.CSSProperties {
  const level = levelOf(state);
  if (level === "unknown") return { background: "color-mix(in oklab, var(--unknown) 28%, white)" };
  return { background: `color-mix(in oklab, ${levelColor(level)} 100%, white)` };
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

export function ClassOverview({
  classId,
  className: classTitle,
  subjects,
  students,
  initial,
  initialSubject,
}: {
  classId: string;
  className: string;
  subjects: OverviewSubject[];
  students: OverviewStudent[];
  initial: OverviewData;
  initialSubject?: string;
}) {
  const lastOk = useRef(0);
  const [stale, setStale] = useState(false);
  useEffect(() => {
    lastOk.current = Date.now();
    const t = setInterval(() => setStale(Date.now() - lastOk.current > STALE_MS), 1000);
    return () => clearInterval(t);
  }, []);
  const ok = () => {
    lastOk.current = Date.now();
  };
  const { data: prog } = useSWR<ProgressResponse>(`/api/progress?classId=${encodeURIComponent(classId)}`, getJson, {
    fallbackData: { progress: initial.progress, history: [], submissions: initial.submissions },
    refreshInterval: POLL_MS,
    keepPreviousData: true,
    onSuccess: ok,
  });
  const { data: asg } = useSWR<OverviewAssignment[]>(`/api/assignments?classId=${encodeURIComponent(classId)}`, getJson, {
    fallbackData: initial.assignments,
    refreshInterval: POLL_MS,
    keepPreviousData: true,
    onSuccess: ok,
  });

  const [activeId, setActiveId] = useState(
    subjects.some((s) => s.meta.id === initialSubject) ? (initialSubject as string) : (subjects[0]?.meta.id ?? ""),
  );
  const subject = subjects.find((s) => s.meta.id === activeId) ?? subjects[0];
  const progress = prog?.progress ?? initial.progress;
  const submissions = prog?.submissions ?? initial.submissions;
  const assignments = asg ?? initial.assignments;

  const view = useMemo(() => {
    if (!subject) return null;
    const lessons = subject.graph.skills;
    const byStudent = new Map(progress.filter((p) => p.subjectId === subject.meta.id).map((p) => [p.studentId, p]));
    const rows = students.map((st) => {
      const skills = byStudent.get(st.id)?.skills ?? {};
      const avg = lessons.length ? lessons.reduce((a, l) => a + (skills[l.id]?.p ?? 0), 0) / lessons.length : 0;
      return { student: st, skills, avg };
    });
    const lessonAvg = lessons.map((l) => {
      const touched = rows.filter((r) => (r.skills[l.id]?.attempts ?? 0) > 0);
      return { lesson: l, avg: touched.length ? touched.reduce((a, r) => a + (r.skills[l.id]?.p ?? 0), 0) / touched.length : null };
    });
    const weakest = lessonAvg.filter((x) => x.avg !== null).sort((a, b) => (a.avg as number) - (b.avg as number))[0];
    const subs = submissions.filter((s) => s.subjectId === subject.meta.id);
    const tests = assignments
      .filter((a) => a.subjectId === subject.meta.id)
      .map((a) => {
        const mine = subs.filter((s) => s.assignmentId === a.id);
        const audience = a.studentIds.length || students.length;
        const done = new Set(mine.map((s) => s.studentId)).size;
        const score = mine.length ? mine.reduce((x, s) => x + s.score, 0) / mine.length : null;
        return { a, done, audience, score };
      })
      .sort((x, y) => y.a.createdAt.localeCompare(x.a.createdAt));
    const scored = subs.length ? subs.reduce((x, s) => x + s.score, 0) / subs.length : null;
    const classAvg = rows.length ? rows.reduce((x, r) => x + r.avg, 0) / rows.length : 0;
    return { lessons, rows, lessonAvg, weakest, tests, scored, classAvg };
  }, [subject, progress, submissions, assignments, students]);

  if (!subject || !view) {
    return (
      <p className="sheet p-8 text-center text-lg font-semibold">
        Hali fan yöq. <Link className="underline" href="/teacher/subjects">Fanlar</Link> bölimidan qöşing.
      </p>
    );
  }

  const isMath = subject.meta.id === "matematika";
  const template = `minmax(150px, 1.2fr) 44px repeat(${view.lessons.length}, minmax(26px, ${view.lessons.length > 10 ? 38 : 72}px))`;
  const lessonTitle = (id: string) => subject.graph.skills.find((s) => s.id === id)?.short ?? id;

  return (
    <div className="flex flex-col gap-5 pt-1">
      <FadeIn className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{classTitle}</h1>
          <p className="text-muted-foreground">
            {students.length} ta öquvçi · {subjects.length} ta fan · natijalar jonli yangilanadi
          </p>
        </div>
        <LiveBadge stale={stale} />
      </FadeIn>

      <div role="tablist" aria-label="Fanlar" className="flex flex-wrap gap-2">
        {subjects.map((s) => {
          const on = s.meta.id === subject.meta.id;
          return (
            <button
              key={s.meta.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActiveId(s.meta.id)}
              className={cn(
                "flex items-center gap-2 rounded-2xl border-2 px-3.5 py-2 text-sm font-semibold transition",
                on ? "border-ink bg-ink text-white" : "border-input bg-card hover:border-ink",
              )}
            >
              <SubjectIcon icon={s.meta.icon} color={s.meta.color} size={26} />
              {s.meta.name}
            </button>
          );
        })}
      </div>

      <section aria-label="Fan körsatkiçlari" className="sheet divide-border grid grid-cols-2 divide-x overflow-hidden md:grid-cols-4">
        <Tile label="Sinf özlaştiriş darajasi">
          <NumberFlow value={pct(view.classAvg)} suffix="%" className="font-display tabular text-[1.75rem] leading-none font-bold" />
        </Tile>
        <Tile label="Yuborilğan testlar">
          <NumberFlow value={view.tests.length} className="font-display tabular text-[1.75rem] leading-none font-bold" />
        </Tile>
        <Tile label="Testlarning örtaça balli">
          {view.scored === null ? (
            <span className="text-ink-soft text-lg font-semibold">Hali yöq</span>
          ) : (
            <NumberFlow value={pct(view.scored)} suffix="%" className="font-display tabular text-[1.75rem] leading-none font-bold" />
          )}
        </Tile>
        <Tile label="Eng zaif dars" className="bg-red-pen/[0.04]">
          {view.weakest ? (
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="font-display truncate text-[1.25rem] leading-tight font-bold">{view.weakest.lesson.short}</span>
              <span className="text-red-pen tabular shrink-0 text-base font-bold">{pct(view.weakest.avg as number)}%</span>
            </span>
          ) : (
            <span className="text-ink-soft text-lg font-semibold">Hali aniqlanmağan</span>
          )}
        </Tile>
      </section>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-label="Sinf xaritasi" className="sheet flex min-w-0 flex-col overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 pt-4 pb-2">
            <h2 className="text-lg font-bold">Sinf xaritasi · {subject.meta.name}</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Legend />
              {isMath && (
                <Link
                  href="/teacher?view=ildiz"
                  className="border-ink hover:bg-ink-wash flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-sm font-semibold transition"
                >
                  <GitBranch className="size-4" aria-hidden /> Ildiz tahlili
                </Link>
              )}
            </div>
          </header>
          <div className="max-h-[560px] overflow-auto px-3 pb-3">
            <div role="table" aria-label="Öquvçilar va darslar" className="min-w-[560px] pr-6">
              <div role="row" className="sticky top-0 z-10 grid items-end gap-x-[3px] bg-white pb-1.5" style={{ gridTemplateColumns: template }}>
                <span role="columnheader" className="text-ink-soft self-end px-2 text-[0.8rem] font-semibold">
                  Öquvçi
                </span>
                <span role="columnheader" className="text-ink-soft self-end text-right text-[0.8rem] font-semibold">
                  Ört.
                </span>
                {view.lessons.map((l) => (
                  <span key={l.id} role="columnheader" title={l.short} className="relative h-[84px]">
                    <span className="text-ink absolute bottom-1 left-1/2 origin-bottom-left -rotate-[58deg] text-[0.78rem] font-semibold whitespace-nowrap">
                      {l.short}
                    </span>
                  </span>
                ))}
              </div>
              {view.rows.map((r) => (
                <Link
                  key={r.student.id}
                  role="row"
                  href={isMath ? `/teacher/student/${r.student.id}` : `/teacher/subjects/${subject.meta.id}`}
                  className="hover:bg-ink-wash/70 grid items-center gap-x-[3px] rounded-lg py-[3px] transition-colors"
                  style={{ gridTemplateColumns: template }}
                >
                  <span role="rowheader" className="truncate px-2 text-[0.95rem] font-semibold">
                    {r.student.name}
                  </span>
                  <span role="cell" className="tabular text-ink-soft pr-1 text-right text-sm font-semibold">
                    {r.avg > 0 ? `${pct(r.avg)}%` : "—"}
                  </span>
                  {view.lessons.map((l) => {
                    const st = r.skills[l.id];
                    const tested = !!st && (st.attempts > 0 || st.inferred);
                    return (
                      <span
                        key={l.id}
                        role="cell"
                        title={`${l.short}: ${tested ? `${levelLabel(levelOf(st))} · ${pct(st.p)}%` : "tekşirilmağan"}`}
                        className="relative h-[26px]"
                      >
                        {tested ? (
                          <span className="absolute inset-0 rounded-[5px]" style={cellStyle(st)} />
                        ) : (
                          <span className="border-input absolute inset-0 rounded-[5px] border border-dashed" />
                        )}
                      </span>
                    );
                  })}
                </Link>
              ))}
              <div
                role="row"
                className="border-border sticky bottom-0 z-10 mt-2 grid items-center gap-x-[3px] border-t bg-white pt-2 pb-1"
                style={{ gridTemplateColumns: template }}
              >
                <span role="rowheader" className="px-2 text-sm font-bold">
                  Sinf örtaçasi
                </span>
                <span />
                {view.lessonAvg.map(({ lesson, avg }) => (
                  <span key={lesson.id} role="cell" className="flex flex-col items-center gap-[3px]">
                    <span className="tabular text-[0.78rem] font-bold">{avg === null ? "—" : pct(avg)}</span>
                    <span
                      className="h-[3px] w-full rounded-full"
                      style={{
                        background:
                          avg === null
                            ? "var(--border)"
                            : levelColor(levelOf({ skillId: lesson.id, p: avg, attempts: 1, correct: 0, inferred: false, misconceptions: {} })),
                      }}
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Testlar" className="sheet flex min-w-0 flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Testlar</h2>
            <Link
              href={`/teacher/subjects/${subject.meta.id}`}
              className="text-ink flex items-center gap-1 text-sm font-semibold hover:underline"
            >
              Fanni oçiş <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          {view.tests.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Bu fan böyiça hali test yuborilmağan. Darsga material yuklab, testni sinfga yuboring.
            </p>
          ) : (
            <ul className="flex max-h-[520px] flex-col gap-2 overflow-y-auto">
              {view.tests.map(({ a, done, audience, score }) => (
                <li key={a.id} className="border-border flex flex-col gap-2 rounded-2xl border p-3">
                  <div className="flex items-start gap-2">
                    <FileText className="text-ink-soft mt-0.5 size-4 shrink-0" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{a.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {lessonTitle(a.lessonId)} · {dayLabel(a.createdAt)}
                      </p>
                    </div>
                    <span className="tabular text-sm font-bold">{score === null ? "—" : `${pct(score)}%`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-ink-wash h-2 flex-1 overflow-hidden rounded-full" aria-hidden>
                      <div
                        className="h-full rounded-full transition-[width] duration-700"
                        style={{ width: `${audience ? Math.min(100, (done / audience) * 100) : 0}%`, background: subject.meta.color }}
                      />
                    </div>
                    <span className="tabular text-ink-soft text-xs font-semibold">
                      {done}/{audience} topşirdi
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Tile({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col justify-center gap-0.5 px-5 py-3", className)}>
      <span className="text-ink-soft text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}

function Legend() {
  const items = [
    { label: levelLabel("mastered"), bg: "var(--mastered)" },
    { label: levelLabel("shaky"), bg: "var(--shaky)" },
    { label: levelLabel("gap"), bg: "var(--gap)" },
    { label: levelLabel("unknown"), bg: "color-mix(in oklab, var(--unknown) 28%, white)" },
  ];
  return (
    <ul className="text-ink-soft flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem] font-medium">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px]" style={{ background: i.bg }} aria-hidden />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
