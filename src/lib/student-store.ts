"use client";

import type { DiagnosticState } from "@/engine";
import type { Attempt, ChoiceId, Question, SaveProgressRequest, Student, StudentSnapshot } from "@/lib/types";

// Browser-side persistence + offline-friendly sync. All reads/writes are guarded:
// private mode or blocked storage must never break the flow.

const KEYS = {
  student: "ildiz:student",
  diagnostic: "ildiz:diagnostic",
  snapshot: "ildiz:snapshot",
  queue: "ildiz:queue",
  practiceAsked: "ildiz:practice-asked",
} as const;

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: keep going in memory */
  }
}

export const getLocalStudent = () => read<Student>(KEYS.student);
export const saveLocalStudent = (s: Student) => write(KEYS.student, s);
export const loadDiagnostic = () => read<DiagnosticState>(KEYS.diagnostic);
export const saveDiagnostic = (s: DiagnosticState | null) => write(KEYS.diagnostic, s);
export const loadSnapshot = () => read<StudentSnapshot>(KEYS.snapshot);
export const saveSnapshot = (s: StudentSnapshot) => write(KEYS.snapshot, s);
export const loadPracticeAsked = () => read<string[]>(KEYS.practiceAsked) ?? [];
export const savePracticeAsked = (ids: string[]) => write(KEYS.practiceAsked, ids.slice(-200));

/** "Qaytadan boshlash": forget this device's student and progress. */
export function clearLocal() {
  for (const k of Object.values(KEYS)) write(k, null);
}

export function makeAttempt(
  studentId: string,
  q: Question,
  choiceId: ChoiceId,
  mode: Attempt["mode"],
  now: Date = new Date(),
): Attempt {
  return {
    id: crypto.randomUUID(),
    studentId,
    questionId: q.id,
    skillId: q.skillId,
    choiceId,
    correct: choiceId === q.correct,
    misconceptionId: q.choices.find((c) => c.id === choiceId)?.misconceptionId ?? null,
    mode,
    ts: now.toISOString(),
  };
}

/** Create the student on the server; offline -> local id, synced later with the first progress call. */
export async function createStudent(name: string, classId: string): Promise<Student> {
  try {
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, classId }),
    });
    if (!res.ok) throw new Error(String(res.status));
    const { student } = (await res.json()) as { student: Student };
    saveLocalStudent(student);
    return student;
  } catch {
    const student: Student = { id: crypto.randomUUID(), name, classId, createdAt: new Date().toISOString() };
    saveLocalStudent(student);
    return student;
  }
}

interface Pending {
  studentId: string;
  attempts: Attempt[];
  snapshot: StudentSnapshot;
}

let flushing = false;
let listenersInstalled = false;

/** Queue attempts + latest snapshot and try to send them now; retries on `online` and every 10 s. */
export function queueProgress(studentId: string, attempts: Attempt[], snapshot: StudentSnapshot) {
  const prev = read<Pending>(KEYS.queue);
  const merged: Pending =
    prev && prev.studentId === studentId
      ? { studentId, attempts: [...prev.attempts, ...attempts], snapshot }
      : { studentId, attempts, snapshot };
  write(KEYS.queue, merged);
  installListeners();
  void flushProgress();
}

export async function flushProgress(): Promise<boolean> {
  if (flushing) return false;
  const pending = read<Pending>(KEYS.queue);
  if (!pending) return true;
  flushing = true;
  try {
    const body: SaveProgressRequest = {
      attempts: pending.attempts.slice(0, 200),
      snapshot: pending.snapshot,
      student: getLocalStudent() ?? undefined,
    };
    const res = await fetch(`/api/students/${pending.studentId}/progress`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return false;
    const now = read<Pending>(KEYS.queue);
    const sentIds = new Set(body.attempts.map((a) => a.id));
    const rest = now ? now.attempts.filter((a) => !sentIds.has(a.id)) : [];
    write(KEYS.queue, rest.length && now ? { ...now, attempts: rest } : null);
    return true;
  } catch {
    return false;
  } finally {
    flushing = false;
  }
}

function installListeners() {
  if (listenersInstalled || typeof window === "undefined") return;
  listenersInstalled = true;
  window.addEventListener("online", () => void flushProgress());
  window.setInterval(() => void flushProgress(), 10_000);
}
