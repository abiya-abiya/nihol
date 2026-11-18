"use client";

import { Check, FileText, Loader2, Plus, Send, Sparkles, Trash2, UploadCloud } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { celebrate } from "@/components/brand/confetti";
import { EASE_OUT_EXPO } from "@/components/brand/motion";
import { SubjectIcon } from "@/components/brand/subject-icon";
import { Button } from "@/components/ui/button";
import type { ChoiceId, MaterialSample, Question, Skill, SubjectMeta } from "@/lib/types";
import { normalizeUz } from "@/lib/uz";
import { cn } from "@/lib/utils";

type Step = "drop" | "analyze" | "edit" | "sent";
interface FileInfo {
  name: string;
  sizeKb: number;
  pages: number;
}

const STAGES = ["Fayl öqilmoqda", "Matn sahifalarga ajratilmoqda", "Asosiy tuşunçalar topilmoqda", "Savollar tuzilmoqda", "Javoblar tekşirilmoqda"];
const STAGE_MS = 1350;
const IDS: ChoiceId[] = ["a", "b", "c", "d"];

function templateQuestions(lesson: Skill): Question[] {
  const t = normalizeUz(lesson.title);
  const mk = (n: number, stem: string, choices: string[]): Question => ({
    id: `${lesson.id}-t${n}`,
    skillId: lesson.id,
    difficulty: n < 2 ? 1 : n < 4 ? 2 : 3,
    stem,
    choices: choices.map((text, i) => ({ id: IDS[i], text })),
    correct: "a",
    explanation: "",
    hint: "",
    source: "ai",
  });
  return [
    mk(1, `«${t}» mavzusidagi asosiy tuşunça qaysi?`, ["Darsda berilgan asosiy taʼrif", "Boşqa fanga oid tuşunça", "Faqat misol", "Hammasi notöğri"]),
    mk(2, `«${t}» qayerda qöllaniladi?`, ["Kundalik hayotda va keyingi darslarda", "Heç qayerda", "Faqat imtihonda", "Bilmayman"]),
    mk(3, `Quyidagilardan qaysi biri «${t}» mavzusiga misol böla oladi?`, ["Darsdagi 1-misol", "Mavzuga aloqasiz gap", "Tasodifiy son", "Bölim sarlavhasi"]),
    mk(4, `«${t}» bilan bevosita boğliq oldingi mavzu qaysi?`, ["Oldingi dars", "Keyingi çorak mavzusi", "Boşqa sinf mavzusi", "Heç biri"]),
    mk(5, `«${t}» böyiça eng muhim xulosa qaysi?`, ["Darsning yakuniy xulosasi", "Darsning birinçi gapi", "Uy vazifasi", "Sahifa raqami"]),
  ];
}

function keyTerms(lesson: Skill, material?: MaterialSample): string[] {
  const words = `${lesson.title} ${lesson.description} ${material?.summary ?? ""}`
    .replace(/[^\p{L}\s-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4);
  return [...new Set(words.map((w) => w.toLowerCase()))].slice(0, 7);
}

export function UploadWizard({
  subject,
  lesson,
  bank,
  material,
}: {
  subject: SubjectMeta;
  lesson: Skill;
  bank: Question[];
  material?: MaterialSample;
}) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>("drop");
  const [file, setFile] = useState<FileInfo | null>(null);
  const [stage, setStage] = useState(0);
  const [drag, setDrag] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState(`${normalizeUz(lesson.title)} — test`);
  const [sending, setSending] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const terms = useMemo(() => keyTerms(lesson, material), [lesson, material]);

  function start(info: FileInfo) {
    setFile(info);
    setStage(0);
    setStep("analyze");
  }

  function onFile(f: File | undefined) {
    if (!f) return;
    if (!/\.(pdf|docx?|pptx?|txt)$/i.test(f.name)) {
      toast.error("PDF yoki Word fayl yuklang");
      return;
    }
    start({ name: f.name, sizeKb: Math.max(1, Math.round(f.size / 1024)), pages: Math.max(1, Math.min(24, Math.round(f.size / 45000) || 3)) });
  }

  // The staged "analysis": no API call; the prepared questions appear at the end.
  useEffect(() => {
    if (step !== "analyze") return;
    if (stage >= STAGES.length) {
      const prepared = (bank.length ? bank.slice(0, 5) : templateQuestions(lesson)).map((q) => ({
        ...q,
        choices: q.choices.map((c) => ({ ...c })),
      }));
      setQuestions(prepared);
      const t = window.setTimeout(() => setStep("edit"), 500);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setStage((s) => s + 1), reduce ? 200 : STAGE_MS);
    return () => window.clearTimeout(t);
  }, [step, stage, bank, lesson, reduce]);

  function update(i: number, patch: Partial<Question>) {
    setQuestions((qs) => qs.map((q, k) => (k === i ? { ...q, ...patch } : q)));
  }

  async function send() {
    setSending(true);
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subjectId: subject.id, lessonId: lesson.id, title, questions, materialName: file?.name }),
    });
    const body = await res.json();
    setSending(false);
    if (!res.ok) return toast.error(body.error ?? "Yuborilmadi");
    setStep("sent");
    celebrate("big");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <SubjectIcon icon={subject.icon} color={subject.color} size={48} />
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm">{subject.name}</p>
          <h1 className="truncate text-2xl leading-tight font-bold">{normalizeUz(lesson.title)}</h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "drop" && (
          <motion.div key="drop" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-3">
            <button
              type="button"
              onClick={() => input.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                onFile(e.dataTransfer.files[0]);
              }}
              className={cn(
                "sheet group flex w-full flex-col items-center gap-3 border-2 border-dashed p-10 text-center transition",
                drag ? "border-ink bg-ink-wash scale-[1.01]" : "border-input hover:border-ink",
              )}
            >
              <motion.span
                animate={reduce ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="bg-ink grid size-16 place-items-center rounded-2xl text-white"
              >
                <UploadCloud className="size-8" />
              </motion.span>
              <span className="font-display text-xl font-bold">Dars materialini yuklang</span>
              <span className="text-muted-foreground max-w-sm">PDF yoki Word faylni şu yerga tortib keling yoki bosing. SI uni öqib, 5 ta test savolini tuzib beradi.</span>
            </button>
            <input ref={input} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" hidden onChange={(e) => onFile(e.target.files?.[0])} />
            {material && (
              <button
                type="button"
                onClick={() => start({ name: material.fileName, sizeKb: 180 + material.pages * 37, pages: material.pages })}
                className="text-ink-soft hover:text-ink mx-auto flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
              >
                <FileText className="size-4" /> Namuna fayl bilan sinab köriş: {material.fileName}
              </button>
            )}
          </motion.div>
        )}

        {step === "analyze" && file && (
          <motion.div
            key="analyze"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className="grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
          >
            <div className="sheet relative overflow-hidden p-5">
              <div className="mb-4 flex items-center gap-3">
                <FileText className="text-red-pen-strong size-8" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{file.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {file.pages} sahifa · {file.sizeKb} KB
                  </p>
                </div>
              </div>
              <div className="space-y-2.5">
                {Array.from({ length: 11 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="bg-ink-wash h-2.5 rounded-full"
                    style={{ width: `${55 + ((i * 37) % 42)}%` }}
                    animate={stage >= 1 ? { backgroundColor: i % 4 === 1 && stage >= 2 ? "#ffe45c" : "#eaeef8" } : undefined}
                    transition={{ delay: i * 0.08 }}
                  />
                ))}
              </div>
              {!reduce && stage < STAGES.length && (
                <motion.div
                  className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-[rgb(47_158_91/0.18)] to-transparent"
                  initial={{ top: "-15%" }}
                  animate={{ top: ["-15%", "100%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>

            <div className="sheet space-y-4 p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="text-ink size-5" />
                <p className="font-display font-bold">SI materialni tahlil qilmoqda</p>
              </div>
              <div className="bg-ink-wash h-2 overflow-hidden rounded-full">
                <motion.div className="bg-ink h-full rounded-full" animate={{ width: `${(stage / STAGES.length) * 100}%` }} transition={{ duration: 0.5 }} />
              </div>
              <ul className="space-y-2.5">
                {STAGES.map((label, i) => (
                  <li key={label} className={cn("flex items-center gap-3 transition", i > stage && "opacity-40")}>
                    <span className={cn("grid size-6 place-items-center rounded-full", i < stage ? "bg-mastered text-white" : "bg-ink-wash")}>
                      {i < stage ? <Check className="size-4" strokeWidth={3} /> : i === stage ? <Loader2 className="size-4 animate-spin" /> : null}
                    </span>
                    <span className="text-sm font-medium">
                      {label}
                      {i === 3 && stage === 3 && "…"}
                      {i === 1 && stage > 1 && ` — ${file.pages} sahifa`}
                    </span>
                  </li>
                ))}
              </ul>
              {stage >= 2 && (
                <div className="flex flex-wrap gap-1.5">
                  {terms.map((t, i) => (
                    <motion.span
                      key={t}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.12, type: "spring", stiffness: 300, damping: 18 }}
                      className="bg-highlight/70 text-ink rounded-full px-2.5 py-1 text-xs font-semibold"
                    >
                      {t}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === "edit" && (
          <motion.div key="edit" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="sheet flex flex-wrap items-center gap-3 p-4">
              <span className="bg-mastered/15 text-mastered grid size-10 place-items-center rounded-xl">
                <Sparkles className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">SI {questions.length} ta savol tuzdi</p>
                <p className="text-muted-foreground truncate text-sm">Manba: {file?.name}. Savollarni tekşirib, kerak bölsa özgartiring.</p>
              </div>
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">Test nomi</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-input focus-visible:border-ink h-11 w-full rounded-xl border-2 bg-card px-3 outline-none"
              />
            </label>
            <motion.ol initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="grid gap-3">
              {questions.map((q, i) => (
                <motion.li
                  key={q.id}
                  variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                  className="sheet space-y-3 p-4"
                >
                  <div className="flex items-start gap-2">
                    <span className="font-display bg-ink grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white">{i + 1}</span>
                    <textarea
                      value={q.stem}
                      onChange={(e) => update(i, { stem: e.target.value })}
                      rows={2}
                      className="border-input focus-visible:border-ink min-w-0 flex-1 rounded-xl border-2 bg-card px-3 py-2 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuestions((qs) => qs.filter((_, k) => k !== i))}
                      aria-label="Savolni öçiriş"
                      className="text-muted-foreground hover:text-red-pen-strong p-2"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.choices.map((c, ci) => (
                      <label key={c.id} className={cn("flex items-center gap-2 rounded-xl border-2 px-2 py-1.5", q.correct === c.id ? "border-mastered bg-mastered/5" : "border-input")}>
                        <input type="radio" name={`c-${q.id}`} checked={q.correct === c.id} onChange={() => update(i, { correct: c.id })} className="accent-[var(--mastered)]" />
                        <input
                          value={c.text}
                          onChange={(e) => update(i, { choices: q.choices.map((x, k) => (k === ci ? { ...x, text: e.target.value } : x)) })}
                          className="min-w-0 flex-1 bg-transparent outline-none"
                          aria-label={`Variant ${c.id.toUpperCase()}`}
                        />
                      </label>
                    ))}
                  </div>
                </motion.li>
              ))}
            </motion.ol>
            <Button
              variant="outline"
              onClick={() => setQuestions((qs) => [...qs, { ...templateQuestions(lesson)[0], id: `${lesson.id}-n${Date.now().toString(36)}`, stem: "Yangi savol" }])}
              className="h-11 rounded-xl"
            >
              <Plus className="size-4" /> Savol qöşiş
            </Button>
            <div className="sticky bottom-4 z-10">
              <Button onClick={send} disabled={sending || !questions.length} className="h-14 w-full rounded-2xl text-lg font-semibold shadow-[var(--shadow-lift)]">
                {sending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />} Öquvçilarga yuboriş
              </Button>
            </div>
          </motion.div>
        )}

        {step === "sent" && (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            className="sheet flex flex-col items-center gap-4 p-10 text-center"
          >
            <span className="bg-mastered grid size-16 place-items-center rounded-full text-white">
              <Check className="size-9" strokeWidth={3} />
            </span>
            <h2 className="text-2xl font-bold">Test 6-A sinfga yuborildi</h2>
            <p className="text-muted-foreground">Öquvçilar uni hozir öz sahifasida köradi. Natijalar sinf panelida jonli çiqadi.</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild className="h-11 rounded-xl">
                <Link href="/teacher">Sinf paneliga</Link>
              </Button>
              <Button variant="outline" className="h-11 rounded-xl" onClick={() => setStep("drop")}>
                Yana material yuklaş
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
