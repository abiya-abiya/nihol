"use client";

import { ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { levelColor, levelLabel } from "@/components/brand/levels";
import { levelOf } from "@/engine/bkt";
import type { ClassReport, SkillId, SkillState } from "@/lib/types";
import { type ReportStudent, type StudentGroup, misconceptionTitle, pct, skillShort, skillTitle } from "@/lib/teacher/view";
import { normalizeUz } from "@/lib/uz";

const NAME_COL = "minmax(180px, 1fr)";
const PCT_COL = "44px";
const cols = (n: number) => `${NAME_COL} ${PCT_COL} repeat(${n}, minmax(20px, 34px))`;

interface Hover {
  student: ReportStudent;
  skillId: SkillId;
  x: number;
  y: number;
}

function cellStyle(state: SkillState | undefined): React.CSSProperties {
  const level = levelOf(state);
  if (level === "unknown") return { background: "color-mix(in oklab, var(--unknown) 28%, white)" };
  // Inferred (not asked) skills are lighter: "probably known".
  const mix = state?.inferred ? 42 : 100;
  return { background: `color-mix(in oklab, ${levelColor(level)} ${mix}%, white)` };
}

function Legend() {
  const items: Array<{ label: string; style: React.CSSProperties }> = [
    { label: levelLabel("mastered"), style: { background: "var(--mastered)" } },
    { label: "Taxminan biladi", style: { background: "color-mix(in oklab, var(--mastered) 42%, white)" } },
    { label: levelLabel("shaky"), style: { background: "var(--shaky)" } },
    { label: levelLabel("gap"), style: { background: "var(--gap)" } },
    { label: levelLabel("unknown"), style: { background: "color-mix(in oklab, var(--unknown) 28%, white)" } },
  ];
  return (
    <ul className="text-ink-soft flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8rem] font-medium">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px]" style={i.style} aria-hidden />
          {i.label}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="outline-red-pen size-3 -rotate-6 rounded-[4px] outline-2 outline-offset-1" aria-hidden />
        Ildiz
      </li>
    </ul>
  );
}

export function Heatmap({
  report,
  groups,
  changed,
  version,
}: {
  report: ClassReport;
  groups: StudentGroup[];
  changed: Set<string>;
  version: number;
}) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<Hover | null>(null);
  const skills = report.skillStats.map((s) => s.skillId);
  const template = cols(skills.length);

  return (
    <section aria-label="Sinf issiqlik xaritasi" className="sheet flex min-h-0 flex-col overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 px-5 pt-3.5 pb-1">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-bold">Sinf xaritasi</h2>
          <p className="text-ink-soft hidden text-sm xl:block">chapda — asos, oʻngda — murakkab</p>
        </div>
        <Legend />
      </header>

      <div className="min-h-0 flex-1 overflow-auto px-3" onMouseLeave={() => setHover(null)}>
        <div role="table" aria-label="Oʻquvchilar va koʻnikmalar" className="min-w-[640px] pr-12">
          {/* column labels */}
          <div
            role="row"
            className="sticky top-0 z-20 grid items-end gap-x-[3px] bg-white pb-1.5"
            style={{ gridTemplateColumns: template }}
          >
            <span role="columnheader" className="text-ink-soft self-end px-2 text-[0.8rem] font-semibold">
              Oʻquvchi
            </span>
            <span role="columnheader" className="text-ink-soft self-end text-right text-[0.8rem] font-semibold">
              Oʻrt.
            </span>
            {skills.map((id) => (
              <span key={id} role="columnheader" title={skillTitle(id)} className="relative h-[84px]">
                <span className="text-ink absolute bottom-1 left-1/2 origin-bottom-left -rotate-[58deg] text-[0.78rem] font-semibold whitespace-nowrap">
                  {skillShort(id)}
                </span>
              </span>
            ))}
          </div>

          {groups.map((g) => (
            <div key={g.key} role="rowgroup" className="mt-2 first-of-type:mt-0">
              <div role="row" className="flex items-baseline gap-2 px-2 pt-2 pb-1">
                {g.kind === "root" ? (
                  <>
                    <span className="font-hand text-red-pen text-[1.35rem] leading-none font-bold">
                      ildiz: {g.label}
                    </span>
                    <span className="text-ink-soft text-sm font-medium">· {g.students.length} oʻquvchi</span>
                  </>
                ) : (
                  <span className="text-ink-soft text-sm font-semibold">
                    {g.label} · {g.students.length}
                  </span>
                )}
              </div>
              <AnimatePresence initial={false}>
                {g.students.map((s) => {
                  const snap = s.snapshot;
                  const roots = new Set(snap?.rootGaps ?? []);
                  const isNew = changed.has(`row:${s.student.id}`);
                  return (
                    <motion.div
                      key={s.student.id}
                      layout={reduce ? false : "position"}
                      initial={isNew && !reduce ? { opacity: 0, x: -16, backgroundColor: "rgba(255,228,92,0.55)" } : false}
                      animate={{ opacity: 1, x: 0, backgroundColor: "rgba(255,228,92,0)" }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-lg"
                    >
                      <Link
                        role="row"
                        href={`/teacher/student/${s.student.id}`}
                        className="group hover:bg-ink-wash/70 focus-visible:bg-ink-wash grid items-center gap-x-[3px] rounded-lg py-[3px] transition-colors"
                        style={{ gridTemplateColumns: template }}
                      >
                        <span role="rowheader" className="flex min-w-0 items-center gap-1.5 px-2">
                          <span className="truncate text-[0.95rem] font-semibold">{normalizeUz(s.student.name)}</span>
                          <ChevronRight
                            className="text-ink-soft size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                            aria-hidden
                          />
                        </span>
                        <span role="cell" className="tabular text-ink-soft pr-1 text-right text-sm font-semibold">
                          {snap ? `${pct(s.masteryAvg)}%` : "—"}
                        </span>
                        {skills.map((id) => {
                          const st = snap?.skills[id];
                          const tested = !!st && (st.attempts > 0 || st.inferred);
                          const key = `${s.student.id}:${id}`;
                          const flash = changed.has(key) && !reduce;
                          return (
                            <span
                              key={id}
                              role="cell"
                              aria-label={`${skillTitle(id)}: ${tested ? levelLabel(levelOf(st)) : "tekshirilmagan"}`}
                              className="relative h-[26px]"
                              onMouseEnter={(e) => {
                                const r = e.currentTarget.getBoundingClientRect();
                                setHover({ student: s, skillId: id, x: r.left + r.width / 2, y: r.top });
                              }}
                            >
                              {snap && tested ? (
                                <motion.span
                                  key={flash ? `${key}-${version}` : key}
                                  className="absolute inset-0 rounded-[5px]"
                                  style={cellStyle(st)}
                                  initial={flash ? { scale: 1.45, boxShadow: "0 0 0 4px rgba(255,228,92,0.9)" } : false}
                                  animate={{ scale: 1, boxShadow: "0 0 0 0px rgba(255,228,92,0)" }}
                                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                                />
                              ) : (
                                <span className="border-input absolute inset-0 rounded-[5px] border border-dashed" />
                              )}
                              {roots.has(id) && (
                                <span
                                  aria-hidden
                                  className="outline-red-pen pointer-events-none absolute -inset-[3px] -rotate-6 rounded-[7px] outline-2"
                                />
                              )}
                            </span>
                          );
                        })}
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ))}

          {/* class averages */}
          <div
            role="row"
            className="border-border sticky bottom-0 z-10 mt-2 grid items-center gap-x-[3px] border-t bg-white pt-2 pb-1"
            style={{ gridTemplateColumns: template }}
          >
            <span role="rowheader" className="px-2 text-sm font-bold">
              Sinf oʻrtachasi
            </span>
            <span />
            {report.skillStats.map((st) => {
              const level = levelOf({ skillId: st.skillId, p: st.avgP, attempts: 1, correct: 0, inferred: false, misconceptions: {} });
              return (
                <span key={st.skillId} role="cell" className="flex flex-col items-center gap-[3px]">
                  <span className="tabular text-[0.78rem] font-bold">{pct(st.avgP)}</span>
                  <span className="h-[3px] w-full rounded-full" style={{ background: levelColor(level) }} />
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {hover && <CellCard hover={hover} />}
    </section>
  );
}

function CellCard({ hover }: { hover: Hover }) {
  const st = hover.student.snapshot?.skills[hover.skillId];
  const level = levelOf(st);
  const mis = Object.entries(st?.misconceptions ?? {}).filter(([, n]) => (n ?? 0) > 0);
  const isRoot = hover.student.snapshot?.rootGaps.includes(hover.skillId);
  return (
    <div
      role="tooltip"
      className="sheet pointer-events-none fixed z-50 w-[280px] -translate-x-1/2 -translate-y-full p-3.5 text-sm shadow-[var(--shadow-lift)]"
      style={{ left: Math.min(Math.max(hover.x, 150), window.innerWidth - 150), top: hover.y - 8 }}
    >
      <p className="font-semibold">{normalizeUz(hover.student.student.name)}</p>
      <p className="text-ink-soft">{skillTitle(hover.skillId)}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="size-3 rounded-[3px]" style={cellStyle(st)} aria-hidden />
        <span className="font-semibold">{st && (st.attempts > 0 || st.inferred) ? levelLabel(level) : "Tekshirilmagan"}</span>
        {st && (st.attempts > 0 || st.inferred) && (
          <span className="tabular text-ink-soft ml-auto font-semibold">p = {pct(st.p)}%</span>
        )}
      </div>
      {st && (
        <p className="text-ink-soft mt-1">
          {st.inferred
            ? "Soʻralmagan: yuqoriroq koʻnikma toʻgʻri yechilgani uchun taxmin qilindi"
            : `${st.correct} / ${st.attempts} toʻgʻri javob`}
        </p>
      )}
      {isRoot && <p className="font-hand text-red-pen mt-1.5 text-lg leading-tight font-bold">ildiz shu yerda!</p>}
      {mis.length > 0 && (
        <ul className="border-border mt-2 space-y-0.5 border-t pt-2">
          {mis.map(([id, n]) => (
            <li key={id} className="flex gap-2">
              <X className="text-red-pen mt-[3px] size-3.5 shrink-0" strokeWidth={3} aria-hidden />
              <span>
                {misconceptionTitle(id)}
                {(n ?? 0) > 1 ? ` (${n})` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
