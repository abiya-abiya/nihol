"use client";

import { ArrowRight, ChevronLeft, Lightbulb } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { celebrate } from "@/components/brand/confetti";
import { MasteryRing } from "@/components/brand/mastery-ring";
import { MathText } from "@/components/brand/math-text";
import { EASE_OUT_EXPO } from "@/components/brand/motion";
import type { ChoiceState } from "@/components/student/choice-button";
import { LessonCard } from "@/components/student/lesson-card";
import { QuestionCard } from "@/components/student/question-card";
import { SkillComplete } from "@/components/student/skill-complete";
import { TutorChat } from "@/components/student/tutor-chat";
import { TutorPanel } from "@/components/student/tutor-panel";
import { fallbackExplanation } from "@/lib/ai/fallback";
import { useTextStream } from "@/components/student/use-text-stream";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PRACTICE_DONE_P, answerPractice, pickPracticeQuestion, topMisconceptions } from "@/engine";
import { generateQuestion, graph, misconceptionsById, questionsBySkill, skillsById } from "@/lib/content";
import {
  getLocalStudent,
  loadPracticeAsked,
  loadSnapshot,
  makeAttempt,
  queueProgress,
  savePracticeAsked,
  saveSnapshot,
} from "@/lib/student-store";
import type { ChoiceId, Question, Student, StudentSnapshot } from "@/lib/types";
import { normalizeUz } from "@/lib/uz";

export default function LearnPage() {
  const { skillId } = useParams<{ skillId: string }>();
  const router = useRouter();
  const reduce = useReducedMotion();
  const skill = skillsById[skillId];

  const [student, setStudent] = useState<Student | null>(null);
  const [snap, setSnap] = useState<StudentSnapshot | null>(null);
  const [phase, setPhase] = useState<"lesson" | "practice">("lesson");
  const [asked, setAsked] = useState<string[]>([]);
  const [q, setQ] = useState<Question | null>(null);
  const [picked, setPicked] = useState<ChoiceId | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [complete, setComplete] = useState(false);
  const explain = useTextStream();

  useEffect(() => {
    const s = getLocalStudent();
    const sn = loadSnapshot();
    if (!s || !sn?.diagnosticDone || !skill) {
      router.replace(!s ? "/start" : "/path");
      return;
    }
    setStudent(s);
    setSnap(sn);
    setAsked(loadPracticeAsked());
  }, [router, skill]);

  const state = snap?.skills[skillId];
  const misconception = useMemo(() => {
    const id = topMisconceptions(state)[0] ?? snap?.path.find((p) => p.skillId === skillId)?.misconceptionIds[0];
    return id ? (misconceptionsById[id] ?? null) : null;
  }, [state, snap, skillId]);
  const example = useMemo(() => {
    const bank = questionsBySkill[skillId] ?? [];
    return bank.find((x) => x.difficulty === 1) ?? bank[0] ?? null;
  }, [skillId]);

  const nextQuestion = useCallback(() => {
    explain.stop();
    explain.setText("");
    setPicked(null);
    setShowHint(false);
    setQ(pickPracticeQuestion(skillId, asked, questionsBySkill, generateQuestion, Date.now() % 100000));
  }, [asked, skillId, explain]);

  function startPractice() {
    setPhase("practice");
    nextQuestion();
  }

  function answer(choiceId: ChoiceId) {
    if (!q || !snap || !student || picked) return;
    const correct = choiceId === q.correct;
    const wasDone = snap.path.find((p) => p.skillId === skillId)?.status === "done";
    const next = answerPractice(snap, graph, q, choiceId);
    const attempt = makeAttempt(student.id, q, choiceId, "practice");
    const nextAsked = [...asked, q.id];
    setPicked(choiceId);
    setSnap(next);
    setAsked(nextAsked);
    saveSnapshot(next);
    savePracticeAsked(nextAsked);
    queueProgress(student.id, [attempt], next);
    if (correct) celebrate("small");
    else void explain.start("/api/tutor/explain", { question: q, choiceId, studentName: student.name });
    const nowDone = next.path.find((p) => p.skillId === skillId)?.status === "done";
    if (nowDone && !wasDone) window.setTimeout(() => setComplete(true), correct ? 900 : 2500);
  }

  // Keyboard: 1-4 / a-d answer, Enter goes to the next question.
  useEffect(() => {
    if (phase !== "practice") return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea, [role=dialog]")) return;
      const map: Record<string, ChoiceId> = { "1": "a", "2": "b", "3": "c", "4": "d", a: "a", b: "b", c: "c", d: "d" };
      if (!picked && map[e.key.toLowerCase()]) answer(map[e.key.toLowerCase()]);
      else if (picked && e.key === "Enter" && !complete) nextQuestion();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!snap || !student || !skill) {
    return (
      <div className="space-y-4 pt-10">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    );
  }

  const stateOf = (id: ChoiceId): ChoiceState => {
    if (!picked || !q) return "idle";
    if (id === q.correct) return "correct";
    if (id === picked) return "wrong";
    return "dimmed";
  };
  const p = state?.p ?? 0;
  const nextStep = snap.path.find((s) => s.status === "current");

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5">
      <header className="flex items-center gap-2 pt-1">
        <Button asChild variant="ghost" size="icon" className="size-10 rounded-xl" aria-label="Yoʻlga qaytish">
          <Link href="/path">
            <ChevronLeft className="size-6" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{normalizeUz(skill.short)}</p>
          <p className="text-muted-foreground text-xs">Maqsad: {Math.round(PRACTICE_DONE_P * 100)}% va kamida 3 ta mashq</p>
        </div>
        <MasteryRing p={p} size={48} showValue />
      </header>

      {phase === "lesson" ? (
        <LessonCard skill={skill} misconception={misconception} example={example} onStart={startPractice} />
      ) : (
        q && (
          <>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${q.id}-${asked.length - (picked ? 1 : 0)}`}
                initial={reduce ? false : { opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: -32 }}
                transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
              >
                <QuestionCard question={q} stateOf={stateOf} disabled={!!picked} onSelect={answer} />
              </motion.div>
            </AnimatePresence>

            {!picked && (
              <div className="flex justify-center">
                {showHint ? (
                  <div className="bg-highlight/40 w-full rounded-2xl p-4">
                    <MathText text={`**Maslahat:** ${q.hint}`} />
                  </div>
                ) : (
                  <Button variant="ghost" onClick={() => setShowHint(true)} className="text-ink-soft">
                    <Lightbulb /> Maslahat kerak
                  </Button>
                )}
              </div>
            )}

            {picked && picked !== q.correct && (
              <TutorPanel
                text={explain.error && !explain.text ? fallbackExplanation(q, picked) : explain.text}
                loading={explain.loading}
                onAsk={() => setChatOpen(true)}
              />
            )}

            {picked && picked === q.correct && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-hand text-mastered text-center text-3xl -rotate-1"
              >
                toʻgʻri!
              </motion.p>
            )}

            {picked && (
              <div className="sticky bottom-4 z-10 mt-auto">
                <Button onClick={nextQuestion} className="h-14 w-full rounded-2xl text-lg font-semibold shadow-[var(--shadow-lift)]">
                  Keyingi savol <ArrowRight className="size-5" />
                </Button>
              </div>
            )}
          </>
        )
      )}

      <TutorChat open={chatOpen} onOpenChange={setChatOpen} skillId={skillId} question={q ?? undefined} />

      {complete && (
        <SkillComplete
          title={skill.title}
          p={p}
          nextTitle={nextStep ? skillsById[nextStep.skillId]?.title : undefined}
          onNext={() => {
            setComplete(false);
            if (nextStep) {
              setPhase("lesson");
              router.push(`/learn/${nextStep.skillId}`);
            }
          }}
          onPath={() => router.push("/path")}
        />
      )}
    </div>
  );
}
