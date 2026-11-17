"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { celebrate } from "@/components/brand/confetti";
import { LEVELS, levelColor, levelLabel } from "@/components/brand/levels";
import { LogoMark } from "@/components/brand/logo";
import { MathText } from "@/components/brand/math-text";
import { EASE_OUT_EXPO } from "@/components/brand/motion";
import { KnowledgeMap } from "@/components/student/knowledge-map";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { graph, misconceptionsById, skillsById } from "@/lib/content";
import { getLocalStudent, loadSnapshot } from "@/lib/student-store";
import type { Misconception, Student, StudentSnapshot } from "@/lib/types";
import { normalizeUz } from "@/lib/uz";

/** Most frequent misconception seen along the trace (falls back to any skill). */
function topMisconception(snap: StudentSnapshot): Misconception | null {
  const chain = new Set(snap.traces.flatMap((t) => t.chain));
  const counts = new Map<string, number>();
  for (const [skillId, s] of Object.entries(snap.skills)) {
    const weight = chain.has(skillId) ? 2 : 1;
    for (const [id, n] of Object.entries(s.misconceptions)) counts.set(id, (counts.get(id) ?? 0) + (n ?? 0) * weight);
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return best ? (misconceptionsById[best[0]] ?? null) : null;
}

const title = (id: string) => normalizeUz(skillsById[id]?.title ?? id);
const short = (id: string) => normalizeUz(skillsById[id]?.short ?? id);

export default function ResultPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [snap, setSnap] = useState<StudentSnapshot | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const s = getLocalStudent();
    const sn = loadSnapshot();
    if (!s || !sn) {
      router.replace("/start");
      return;
    }
    setStudent(s);
    setSnap(sn);
  }, [router]);

  const trace = snap?.traces[0] ?? null;
  const allGood = !!snap && snap.traces.length === 0 && snap.rootGaps.length === 0;
  const misconception = useMemo(() => (snap ? topMisconception(snap) : null), [snap]);

  const onRevealDone = useCallback(() => {
    setRevealed(true);
    if (allGood) celebrate("big");
  }, [allGood]);

  if (!snap || !student) {
    return (
      <div className="space-y-4 pt-10">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 lg:grid lg:max-w-none lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:content-start lg:items-start lg:gap-x-8">
      <header className="flex items-center gap-3 pt-1 lg:col-span-2">
        <LogoMark size={30} />
        <div className="min-w-0">
          <h1 className="text-xl leading-tight font-bold">{student.name}ning bilim xaritasi</h1>
          <p className="text-muted-foreground text-sm">Pastda — asos, yuqorida — murakkab mavzular</p>
        </div>
      </header>

      <div className="space-y-3">
      <div className="sheet relative overflow-hidden px-1 pt-2 pb-1 lg:px-4 lg:pt-4">
        <KnowledgeMap graph={graph} snapshot={snap} mode="reveal" onRevealDone={onRevealDone} className="lg:mx-auto lg:h-[min(74dvh,820px)] lg:w-auto lg:max-w-full" />
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 px-1 text-xs" aria-label="Belgilar">
        {LEVELS.map((l) => (
          <li key={l} className="text-muted-foreground flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: levelColor(l) }} />
            {levelLabel(l)}
          </li>
        ))}
      </ul>
      </div>

      <div className="lg:sticky lg:top-6">
      {!revealed && (
        <div className="text-muted-foreground hidden h-64 place-items-center rounded-3xl border-2 border-dashed border-grid text-center lg:grid">
          Xarita chizilmoqda…
        </div>
      )}
      <AnimatePresence>
        {revealed && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
            className="sheet space-y-4 p-5"
            aria-live="polite"
          >
            {trace ? (
              <>
                <h2 className="text-[1.45rem] leading-snug font-bold">
                  Muammo {title(trace.targetSkillId).toLowerCase()}da emas — ildizi{" "}
                  <span className="text-red-pen">{title(trace.rootSkillId)}</span>da.
                </h2>
                <ol className="flex flex-wrap items-center gap-1.5 text-sm" aria-label="Xatoning izi">
                  {trace.chain.map((id, i) => (
                    <li key={id} className="flex items-center gap-1.5">
                      <span
                        className={
                          i === trace.chain.length - 1
                            ? "bg-red-pen rounded-full px-2.5 py-1 font-semibold text-white"
                            : "bg-ink-wash rounded-full px-2.5 py-1 font-medium"
                        }
                      >
                        {short(id)}
                      </span>
                      {i < trace.chain.length - 1 && <ArrowRight className="text-ink-soft size-3.5" aria-hidden />}
                    </li>
                  ))}
                </ol>
                {misconception && (
                  <div className="bg-paper space-y-1.5 rounded-2xl border border-dashed border-red-pen/40 p-4">
                    <p className="text-sm font-semibold">Sen shunday oʻylagan boʻlishing mumkin:</p>
                    <p className="font-medium">{normalizeUz(misconception.title)}</p>
                    <MathText text={misconception.example} className="text-red-pen font-semibold" />
                  </div>
                )}
                <p className="text-muted-foreground">
                  Yoʻlingni aynan shu yerdan — <span className="marker text-ink font-semibold">{title(trace.rootSkillId)}</span>
                  dan boshlaymiz. Har bir qadam keyingisini osonlashtiradi.
                </p>
              </>
            ) : allGood ? (
              <>
                <h2 className="text-[1.45rem] leading-snug font-bold">Ajoyib! Kasrlarni yaxshi bilasan.</h2>
                <p className="text-muted-foreground">Xaritangda boʻshliq topilmadi. Endi murakkabroq mashqlar bilan mustahkamlaymiz.</p>
              </>
            ) : (
              <>
                <h2 className="text-[1.45rem] leading-snug font-bold">Bir nechta mavzuni mustahkamlash kerak</h2>
                <p className="text-muted-foreground">Yoʻlingni eng asosiy mavzudan boshlaymiz.</p>
              </>
            )}
            <Button asChild className="h-14 w-full rounded-2xl text-lg font-semibold">
              <Link href="/path">
                {allGood ? (
                  <>
                    Murakkabroq mashqlar <Sparkles className="size-5" />
                  </>
                ) : (
                  <>
                    Shaxsiy yoʻlimni koʻrish <ArrowRight className="size-5" />
                  </>
                )}
              </Link>
            </Button>
          </motion.section>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
