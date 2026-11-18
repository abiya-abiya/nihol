"use client";

import { ArrowRight, Check, ChevronLeft, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { SubjectBackdrop } from "@/components/brand/subject-backdrop";
import { celebrate } from "@/components/brand/confetti";
import { MasteryRing } from "@/components/brand/mastery-ring";
import { MathText } from "@/components/brand/math-text";
import { EASE_OUT_EXPO, Stagger, StaggerItem } from "@/components/brand/motion";
import { QuestionCard } from "@/components/student/question-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Assignment, ChoiceId, Submission } from "@/lib/types";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function TestPage() {
  const { id } = useParams<{ id: string }>();
  const reduce = useReducedMotion();
  const { data } = useSWR<Assignment[]>("/api/assignments", fetcher);
  const a = data?.find((x) => x.id === id);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ChoiceId>>({});
  const [picked, setPicked] = useState<ChoiceId | null>(null);
  const [result, setResult] = useState<Submission | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (result && result.score >= 0.6) celebrate("big");
  }, [result]);

  if (!data) {
    return (
      <div className="space-y-4 pt-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    );
  }
  if (!a) {
    return (
      <div className="sheet mt-6 space-y-3 p-6">
        <p className="font-semibold">Test topilmadi</p>
        <Link href="/student" className="underline">
          Boş sahifaga qaytiş
        </Link>
      </div>
    );
  }

  const q = a.questions[i];

  async function choose(choiceId: ChoiceId) {
    if (picked || !a) return;
    setPicked(choiceId);
    const next = { ...answers, [q.id]: choiceId };
    setAnswers(next);
    window.setTimeout(async () => {
      if (i + 1 < a.questions.length) {
        setI(i + 1);
        setPicked(null);
        return;
      }
      setSending(true);
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assignmentId: a.id, answers: Object.entries(next).map(([questionId, c]) => ({ questionId, choiceId: c })) }),
      });
      const body = await res.json();
      setResult(body.submission as Submission);
      setSending(false);
    }, reduce ? 100 : 380);
  }

  if (result) {
    const correct = result.answers.filter((x) => x.correct).length;
    return (
      <div className="space-y-6 pt-4">
        <SubjectBackdrop subjectId={a.subjectId} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          className="sheet flex flex-col items-center gap-3 p-7 text-center"
        >
          <MasteryRing p={result.score} size={120} showValue />
          <p className="font-hand text-mastered text-3xl -rotate-1">{result.score >= 0.8 ? "ajoyib!" : result.score >= 0.6 ? "barakalla!" : "yana urinib köramiz"}</p>
          <h1 className="text-2xl font-bold">
            {correct} / {result.answers.length} töğri javob
          </h1>
          <p className="text-muted-foreground">{a.title} — natija öqituvçingizga va ota-onangizga yuborildi.</p>
        </motion.div>
        <Stagger className="grid gap-3" delay={0.2}>
          {a.questions.map((qq, k) => {
            const ans = result.answers.find((x) => x.questionId === qq.id);
            const ok = ans?.correct;
            const right = qq.choices.find((c) => c.id === qq.correct)?.text ?? "";
            return (
              <StaggerItem key={qq.id}>
                <div className="sheet space-y-2 p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-full text-white ${ok ? "bg-mastered" : "bg-red-pen-strong"}`}
                    >
                      {ok ? <Check className="size-4" strokeWidth={3} /> : <X className="size-4" strokeWidth={3} />}
                    </span>
                    <MathText text={`${k + 1}. ${qq.stem}`} className="font-medium" />
                  </div>
                  {!ok && (
                    <div className="text-muted-foreground pl-10 text-sm">
                      <MathText text={`Töğri javob: **${right}**`} />
                      {qq.explanation && <MathText text={qq.explanation} />}
                    </div>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
        <Button asChild className="h-14 w-full rounded-2xl text-lg font-semibold">
          <Link href="/student">
            Boş sahifaga <ArrowRight className="size-5" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-2">
      <SubjectBackdrop subjectId={a.subjectId} />
      <div className="flex items-center gap-3">
        <Link href="/student" aria-label="Orqaga" className="text-muted-foreground hover:text-ink">
          <ChevronLeft className="size-6" />
        </Link>
        <div className="flex-1 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">{a.title}</span>
            <span className="text-muted-foreground tabular">
              {i + 1} / {a.questions.length}
            </span>
          </div>
          <div className="bg-ink-wash h-2 overflow-hidden rounded-full">
            <motion.div
              className="bg-ink h-full rounded-full"
              initial={false}
              animate={{ width: `${((i + (picked ? 1 : 0)) / a.questions.length) * 100}%` }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            />
          </div>
        </div>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={q.id}
          initial={reduce ? false : { opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -36 }}
          transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
        >
          <QuestionCard
            question={q}
            stateOf={(c) => (picked === c ? "selected" : picked ? "dimmed" : "idle")}
            disabled={!!picked || sending}
            onSelect={choose}
          />
        </motion.div>
      </AnimatePresence>
      {sending && <p className="text-muted-foreground text-center">Natija hisoblanmoqda…</p>}
    </div>
  );
}
