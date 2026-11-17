"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { EASE_OUT_EXPO } from "@/components/brand/motion";
import { Analyzing } from "@/components/student/analyzing";
import { QuestionCard } from "@/components/student/question-card";
import { Skeleton } from "@/components/ui/skeleton";
import { graph, questionsBySkill, skillsById } from "@/lib/content";
import {
  answerDiagnostic,
  buildSnapshot,
  MAX_DIAGNOSTIC_QUESTIONS,
  nextDiagnosticQuestion,
  startDiagnostic,
  type DiagnosticState,
} from "@/engine";
import {
  getLocalStudent,
  loadDiagnostic,
  makeAttempt,
  queueProgress,
  saveDiagnostic,
  saveSnapshot,
} from "@/lib/student-store";
import type { ChoiceId, Student } from "@/lib/types";

const CHEERS = [
  "Shoshilma, oʻylab javob ber",
  "Zoʻr, davom etamiz",
  "Bilim xaritang chizilmoqda",
  "Har bir javob xaritaga nuqta qoʻshadi",
  "Yana bir nechta savol qoldi",
];

export default function DiagnosticPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [student, setStudent] = useState<Student | null>(null);
  const [state, setState] = useState<DiagnosticState | null>(null);
  const [picked, setPicked] = useState<ChoiceId | null>(null);
  const [finishing, setFinishing] = useState(false);
  const lock = useRef(false);

  useEffect(() => {
    const s = getLocalStudent();
    if (!s) {
      router.replace("/start");
      return;
    }
    setStudent(s);
    setState(loadDiagnostic() ?? startDiagnostic(graph));
    // Warm the next screens so the flow survives losing the network mid-test.
    router.prefetch("/result");
    router.prefetch("/path");
  }, [router]);

  const question = useMemo(() => (state ? nextDiagnosticQuestion(state, questionsBySkill) : null), [state]);

  const finish = useCallback(
    (final: DiagnosticState, who: Student) => {
      setFinishing(true);
      const snap = buildSnapshot(who.id, graph, final.skills, true);
      saveSnapshot(snap);
      saveDiagnostic({ ...final, done: true });
      queueProgress(who.id, [], snap);
      window.setTimeout(() => router.push("/result"), reduce ? 200 : 1900);
    },
    [router, reduce],
  );

  // Resume after reload: nothing left to ask means the diagnostic is over.
  useEffect(() => {
    if (state && student && !question && !finishing) finish(state, student);
  }, [state, student, question, finishing, finish]);

  const answer = useCallback(
    (choiceId: ChoiceId) => {
      if (!state || !student || !question || lock.current) return;
      lock.current = true;
      setPicked(choiceId);
      window.setTimeout(
        () => {
          const next = answerDiagnostic(state, graph, question, choiceId);
          const attempt = makeAttempt(student.id, question, choiceId, "diagnostic");
          const snap = buildSnapshot(student.id, graph, next.skills, false);
          saveDiagnostic(next);
          saveSnapshot(snap);
          queueProgress(student.id, [attempt], snap);
          setPicked(null);
          setState(next);
          lock.current = false;
        },
        reduce ? 120 : 380,
      );
    },
    [state, student, question, reduce],
  );

  // Keyboard: 1-4 or a-d.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, ChoiceId> = { "1": "a", "2": "b", "3": "c", "4": "d", a: "a", b: "b", c: "c", d: "d" };
      const id = map[e.key.toLowerCase()];
      if (id) answer(id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer]);

  if (finishing) return <Analyzing />;

  if (!state || !question) {
    return (
      <div className="space-y-4 pt-16">
        <Skeleton className="h-36 w-full rounded-3xl" />
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const remaining = Math.max(1, state.queue.filter((id) => state.skills[id]?.attempts === 0 && !state.skills[id]?.inferred).length);
  const progress = Math.min(0.96, state.count / Math.min(MAX_DIAGNOSTIC_QUESTIONS, state.count + remaining + 1));

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6">
      <header className="flex items-center gap-3 pt-1">
        <LogoMark size={30} />
        <div className="flex-1 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-sm font-semibold">Savol {state.count + 1}</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={state.count}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-muted-foreground text-xs"
              >
                {CHEERS[state.count % CHEERS.length]}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="bg-ink-wash h-2 overflow-hidden rounded-full">
            <motion.div
              className="bg-ink h-full rounded-full"
              initial={false}
              animate={{ width: `${Math.max(4, progress * 100)}%` }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            />
          </div>
        </div>
        <span className="sr-only">{student?.name}</span>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={question.id}
          initial={reduce ? false : { opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -36 }}
          transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
        >
          <QuestionCard
            question={question}
            topic={skillsById[question.skillId]?.title}
            stateOf={(id) => (picked === id ? "selected" : picked ? "dimmed" : "idle")}
            disabled={!!picked}
            onSelect={answer}
          />
        </motion.div>
      </AnimatePresence>

      <p className="text-muted-foreground mt-auto text-center text-sm">
        Javoblaring toʻgʻri-notoʻgʻriligini oxirida, xaritada koʻrasan.
      </p>
    </div>
  );
}
