"use client";

import { ArrowDown, ArrowLeft, Check, CircleDot, FileText, Lock, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { levelColor, levelLabel } from "@/components/brand/levels";
import { MasteryRing } from "@/components/brand/mastery-ring";
import { MathText } from "@/components/brand/math-text";
import { KnowledgeMap } from "@/components/student/knowledge-map";
import { Button } from "@/components/ui/button";
import { levelOf } from "@/engine/bkt";
import { graph, misconceptionsById, questionsBySkill } from "@/lib/content";
import type { Attempt, MisconceptionId, PathStep, SkillId, StudentRecord } from "@/lib/types";
import { pct, skillShort, skillTitle, timeAgo } from "@/lib/teacher/view";
import { normalizeUz } from "@/lib/uz";
import { cn } from "@/lib/utils";

const REFRESH_MS = 5000;

const REASON: Record<PathStep["reason"], string> = {
  "root-gap": "ildiz",
  "on-the-way": "yölda",
  target: "maqsad",
};

function questionText(a: Attempt) {
  const q = (questionsBySkill[a.skillId] ?? []).find((x) => x.id === a.questionId);
  if (!q) return null;
  return { stem: q.stem, chosen: q.choices.find((c) => c.id === a.choiceId)?.text ?? null };
}

export function StudentDetail({
  record,
  className,
  attempts,
  masteryAvg,
  now,
}: {
  record: StudentRecord;
  className: string;
  attempts: Attempt[];
  masteryAvg: number;
  now: string;
}) {
  const router = useRouter();
  const { student, snapshot } = record;
  const [selected, setSelected] = useState<SkillId | null>(null);

  // Live: re-render from the server while the pupil is working.
  useEffect(() => {
    const t = setInterval(() => router.refresh(), REFRESH_MS);
    return () => clearInterval(t);
  }, [router]);

  const name = normalizeUz(student.name);
  const trace = snapshot?.traces[0] ?? null;
  const misCounts = new Map<MisconceptionId, number>();
  for (const s of Object.values(snapshot?.skills ?? {})) {
    for (const [id, n] of Object.entries(s.misconceptions)) misCounts.set(id, (misCounts.get(id) ?? 0) + (n ?? 0));
  }
  const misList = [...misCounts.entries()]
    .filter(([id, n]) => n > 0 && misconceptionsById[id])
    .sort((a, b) => b[1] - a[1]);
  const lastActive = attempts[0]?.ts ?? snapshot?.updatedAt ?? student.createdAt;
  const sel = selected && snapshot ? snapshot.skills[selected] : null;
  const rootIds = snapshot?.rootGaps ?? [];

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-5 py-5 lg:px-8">
      <header className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button asChild variant="ghost" className="h-10 rounded-[14px] px-3 text-sm font-semibold">
          <Link href="/teacher">
            <ArrowLeft aria-hidden />
            {normalizeUz(className)}
          </Link>
        </Button>
        <span className="bg-border hidden h-8 w-px sm:block" aria-hidden />
        <div className="min-w-0">
          <h1 className="text-[1.6rem] leading-tight font-bold">{name}</h1>
          <p className="text-ink-soft text-sm">
            {snapshot?.diagnosticDone ? "Diagnostikadan ötgan" : "Diagnostika jarayonida"} · faollik:{" "}
            {timeAgo(lastActive, now)}
          </p>
        </div>
        {snapshot && (
          <div className="ml-auto flex items-center gap-3">
            <span className="text-ink-soft text-right text-sm leading-tight font-medium">
              Örtaça
              <br />
              özlaştiriş
            </span>
            <MasteryRing p={masteryAvg} size={64} />
          </div>
        )}
      </header>

      {!snapshot ? (
        <section className="sheet grid place-items-center gap-2 p-10 text-center">
          <h2 className="text-xl font-bold">Diagnostika hali tugamagan</h2>
          <p className="text-ink-soft max-w-md">
            {name} hozir savollarga javob bermoqda. Diagnostika tugaşi bilan bilim xaritasi va ildiz sababi şu yerda
            paydo böladi.
          </p>
          {attempts.length > 0 && <AttemptList attempts={attempts} now={now} className="mt-4 w-full max-w-xl text-left" />}
        </section>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <section aria-label="Bilim xaritasi" className="sheet flex flex-col self-start p-4 lg:sticky lg:top-5">
            <div className="flex items-baseline justify-between gap-4 px-1">
              <h2 className="text-lg font-bold">Bilim xaritasi</h2>
              <p className="text-ink-soft text-sm">pastda — asos · könikmani bosing</p>
            </div>
            <KnowledgeMap
              graph={graph}
              snapshot={snapshot}
              mode="static"
              highlightTrace
              selectedSkillId={selected}
              onSkillClick={(id) => setSelected((cur) => (cur === id ? null : id))}
              className="mx-auto w-full max-w-[640px]"
            />
            {sel && selected && (
              <div className="border-border mt-2 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border bg-white p-3">
                <span className="size-3.5 rounded-[4px]" style={{ background: levelColor(levelOf(sel)) }} aria-hidden />
                <div className="min-w-0">
                  <p className="font-semibold">{skillTitle(selected)}</p>
                  <p className="text-ink-soft text-sm">
                    {levelLabel(levelOf(sel))} ·{" "}
                    {sel.inferred ? "taxmin qilingan (söralmagan)" : `${sel.correct} / ${sel.attempts} töğri`}
                  </p>
                </div>
                <span className="font-display tabular text-lg font-bold">{pct(sel.p)}%</span>
              </div>
            )}
          </section>

          <div className="flex flex-col gap-5">
            <section aria-labelledby="cause-title" className="sheet p-5">
              <h2 id="cause-title" className="text-lg font-bold">
                Ildiz sababi
              </h2>
              {trace ? (
                <>
                  <p className="mt-2 text-[1.15rem] leading-relaxed">
                    <span className="font-semibold">{skillTitle(trace.targetSkillId)}</span>dagi xatoning ildizi —{" "}
                    <span className="marker font-bold">{skillTitle(trace.rootSkillId)}</span>.
                  </p>
                  <ol className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2" aria-label="Iz: maqsaddan ildizgaça">
                    {trace.chain.map((id, i) => {
                      const isRoot = id === trace.rootSkillId;
                      return (
                        <li key={id} className="flex items-center gap-1.5">
                          {i > 0 && <ArrowDown className="text-red-pen size-4 -rotate-90" aria-hidden />}
                          <span
                            className={cn(
                              "rounded-full border px-3 py-1 text-sm font-semibold",
                              isRoot ? "border-red-pen bg-red-pen/8 text-red-pen border-2" : "border-border bg-white",
                            )}
                          >
                            {skillShort(id)}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                  {rootIds.length > 1 && (
                    <p className="text-ink-soft mt-3 text-sm">
                      Boşqa ildizlar: {rootIds.filter((r) => r !== trace.rootSkillId).map(skillTitle).join(", ")}
                    </p>
                  )}
                  <Button asChild className="mt-4 h-10 rounded-[14px] px-4 text-sm font-semibold">
                    <Link
                      href={`/teacher/worksheet?skills=${trace.rootSkillId}${
                        trace.chain.length > 1 ? `,${trace.chain[trace.chain.indexOf(trace.rootSkillId) - 1]}` : ""
                      }&group=${trace.rootSkillId}&class=${student.classId}`}
                    >
                      <FileText aria-hidden />
                      Şu ildiz böyiça maşq varaqasi
                    </Link>
                  </Button>
                </>
              ) : (
                <p className="text-ink-soft mt-2 text-[1.05rem]">
                  {rootIds.length
                    ? `Ildiz böşliq: ${rootIds.map(skillTitle).join(", ")}.`
                    : "Ildiz muammo topilmadi: asosiy könikmalar özlaştirilgan. Murakkabroq masalalar bilan davom etiş mumkin."}
                </p>
              )}
            </section>

            <section aria-labelledby="path-title" className="sheet p-5">
              <h2 id="path-title" className="text-lg font-bold">
                Şaxsiy yöl
              </h2>
              <ol className="mt-2 flex flex-col">
                {snapshot.path.map((step) => {
                  const st = snapshot.skills[step.skillId];
                  return (
                    <li
                      key={step.skillId}
                      className="border-border grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t py-2 first:border-t-0"
                    >
                      <span
                        className={cn(
                          "grid size-7 place-items-center rounded-full",
                          step.status === "done" && "bg-mastered/15 text-mastered",
                          step.status === "current" && "bg-ink text-white",
                          step.status === "locked" && "bg-ink-wash text-ink-soft",
                        )}
                        aria-label={step.status === "done" ? "bajarildi" : step.status === "current" ? "hozirgi" : "yopiq"}
                      >
                        {step.status === "done" ? (
                          <Check className="size-4" strokeWidth={3} />
                        ) : step.status === "current" ? (
                          <CircleDot className="size-4" />
                        ) : (
                          <Lock className="size-3.5" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="font-semibold">{skillTitle(step.skillId)}</span>
                        <span
                          className={cn(
                            "ml-2 text-sm font-medium",
                            step.reason === "root-gap" ? "font-hand text-red-pen text-lg font-bold" : "text-ink-soft",
                          )}
                        >
                          {REASON[step.reason]}
                        </span>
                      </span>
                      <span className="tabular text-ink-soft text-sm font-semibold">{st ? `${pct(st.p)}%` : "—"}</span>
                    </li>
                  );
                })}
              </ol>
            </section>

            {misList.length > 0 && (
              <section aria-labelledby="mis-title" className="sheet p-5">
                <h2 id="mis-title" className="text-lg font-bold">
                  Kuzatilgan xato turlari
                </h2>
                <ul className="mt-2 flex flex-col">
                  {misList.map(([id, n]) => {
                    const m = misconceptionsById[id];
                    return (
                      <li key={id} className="border-border border-t py-3 first:border-t-0">
                        <p className="flex items-baseline justify-between gap-3">
                          <span className="font-semibold">{normalizeUz(m.title)}</span>
                          <span className="text-ink-soft tabular shrink-0 text-sm">{n} marta</span>
                        </p>
                        <MathText text={m.example} as="span" fracSize="sm" className="text-red-pen font-semibold" />
                        <MathText text={m.remedy} className="text-ink-soft mt-1 text-[0.95rem] leading-relaxed" fracSize="sm" />
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <section aria-labelledby="att-title" className="sheet p-5">
              <h2 id="att-title" className="text-lg font-bold">
                Oxirgi javoblar
              </h2>
              <AttemptList attempts={attempts} now={now} className="mt-2" />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

function AttemptList({ attempts, now, className }: { attempts: Attempt[]; now: string; className?: string }) {
  if (!attempts.length) return <p className={cn("text-ink-soft", className)}>Hali javoblar yöq.</p>;
  return (
    <ol className={cn("flex flex-col", className)}>
      {attempts.map((a) => {
        const q = questionText(a);
        return (
          <li key={a.id} className="border-border grid grid-cols-[auto_1fr_auto] gap-3 border-t py-2.5 first:border-t-0">
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
            <div className="min-w-0">
              <p className="text-ink-soft text-sm font-semibold">
                {skillShort(a.skillId)} · {a.mode === "diagnostic" ? "diagnostika" : "mashq"}
              </p>
              {q && <MathText text={q.stem} className="text-[0.95rem] leading-relaxed" fracSize="sm" />}
              {q?.chosen && !a.correct && (
                <p className="text-red-pen text-sm font-medium">
                  Javobi: <MathText text={q.chosen} as="span" fracSize="sm" />
                  {a.misconceptionId && misconceptionsById[a.misconceptionId]
                    ? ` — ${normalizeUz(misconceptionsById[a.misconceptionId].title).toLowerCase()}`
                    : ""}
                </p>
              )}
            </div>
            <span className="text-ink-soft tabular pt-0.5 text-xs whitespace-nowrap">{timeAgo(a.ts, now)}</span>
          </li>
        );
      })}
    </ol>
  );
}
