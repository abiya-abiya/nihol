// Owner: C. Deterministic v2 demo data for class 6a: accounts, 10 days of
// assignments and submissions, per-subject mastery and the parents' chart history.
// Matematika mastery comes from the v1 seed (same root gaps the v1 screens show);
// other subjects are built by replaying submissions with the same BKT update the
// store applies to live submissions (src/lib/store.ts addSubmission).
import { PRACTICE_PARAMS, initialSkillState, updateP } from "@/engine/bkt";
import { DEMO_USERS } from "@/lib/auth-demo";
import { buildDemoSeed } from "@/lib/seed/demo-class";
import { lessonQuestions, subjects } from "@/lib/subjects";
import type {
  Assignment,
  DemoV2,
  ProgressPoint,
  Question,
  SkillState,
  SubjectContent,
  SubjectProgress,
  Submission,
  User,
} from "@/lib/types";

const CLASS_ID = "6a";
const TEACHER_ID = "t-dilnoza";
const DAY = 86_400_000;

function rng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Login from a first name: ASCII, lowercase, plus a number ("Şahzoda" -> "shahzoda15"). */
function loginOf(name: string, n: number): string {
  const first = name.split(" ")[0].toLowerCase();
  const ascii = first
    .replace(/ş/g, "sh")
    .replace(/ç/g, "ch")
    .replace(/ö/g, "o")
    .replace(/ğ/g, "g")
    .replace(/[ʼ'ʻ]/g, "")
    .normalize("NFD")
    .replace(/[^a-z]/g, "");
  return `${ascii}${n}`;
}

/** 0..1 ability per v1 profile group (index order of the v1 seed). */
function baseAbility(i: number): number {
  if (i < 7) return 0.62; // root gap EKUK
  if (i < 12) return 0.45; // root gap: fraction concept
  if (i < 16) return 0.68; // mixed numbers
  if (i < 22) return 0.86; // mostly mastered
  return 0.6; // joined late
}

interface Kid {
  id: string;
  name: string;
  ability: number;
}

const lessonsWithQuestions = (s: SubjectContent) =>
  s.graph.skills.filter((l) => lessonQuestions(s.meta.id, l.id).length > 0);

const avgOf = (s: SubjectContent, skills: Record<string, SkillState>) =>
  s.graph.skills.reduce((acc, l) => acc + (skills[l.id]?.p ?? 0), 0) / Math.max(1, s.graph.skills.length);

export function buildDemoV2(now: Date = new Date()): DemoV2 {
  const r = rng(20261118);
  const v1 = buildDemoSeed(now);
  const start = new Date(now.getTime() - 10 * DAY);
  const dayIso = (d: Date) => d.toISOString().slice(0, 10);

  // ---------- accounts ----------
  const jasur = DEMO_USERS.find((u) => u.id === "s-jasur")!;
  const kids: Kid[] = v1.students.map((rec, i) => ({
    id: rec.student.id,
    name: rec.student.name,
    ability: baseAbility(i),
  }));
  kids.push({ id: jasur.id, name: jasur.name, ability: 0.6 });

  const users: User[] = [
    ...DEMO_USERS,
    ...kids
      .filter((k) => k.id !== jasur.id)
      .map((k, i) => ({
        id: k.id,
        login: loginOf(k.name, i + 1),
        password: "parol123",
        role: "student" as const,
        name: k.name,
        classId: CLASS_ID,
      })),
  ];

  // ---------- progress state ----------
  const progress = new Map<string, SubjectProgress>(); // key studentId|subjectId
  const history: ProgressPoint[] = [];
  const key = (sid: string, sub: string) => `${sid}|${sub}`;
  const getProg = (sid: string, subjectId: string): SubjectProgress => {
    const k = key(sid, subjectId);
    let p = progress.get(k);
    if (!p) {
      p = { studentId: sid, subjectId, skills: {}, updatedAt: start.toISOString() };
      progress.set(k, p);
    }
    return p;
  };

  // Matematika: the v1 snapshots (Jasur gets the EKUK-root pupil's map).
  const math = subjects.find((s) => s.meta.id === "matematika");
  if (math) {
    const lcmPupil = v1.students[0].snapshot;
    for (const rec of v1.students) {
      if (!rec.snapshot) continue;
      getProg(rec.student.id, "matematika").skills = structuredClone(rec.snapshot.skills);
    }
    if (lcmPupil) getProg(jasur.id, "matematika").skills = structuredClone(lcmPupil.skills);
  }

  // Other subjects: the first lessons were practised before the 10-day window.
  for (const s of subjects) {
    if (s.meta.id === "matematika") continue;
    const lessons = lessonsWithQuestions(s);
    kids.forEach((k, ki) => {
      const prog = getProg(k.id, s.meta.id);
      const offset = (r() - 0.5) * 0.3;
      lessons.slice(0, 2).forEach((l) => {
        let p = 0.3;
        const n = 5;
        let correct = 0;
        for (let q = 0; q < n; q++) {
          const ok = r() < Math.min(0.95, Math.max(0.1, k.ability + offset));
          correct += ok ? 1 : 0;
          p = updateP(p, ok, PRACTICE_PARAMS);
        }
        prog.skills[l.id] = { ...initialSkillState(l.id), p, attempts: n, correct, practiceAttempts: n, inferred: false };
      });
      void ki;
    });
  }

  // First history point for everyone, 10 days ago.
  for (const p of progress.values()) {
    const s = subjects.find((x) => x.meta.id === p.subjectId);
    if (s) history.push({ studentId: p.studentId, subjectId: p.subjectId, date: dayIso(start), avg: avgOf(s, p.skills) });
  }

  // ---------- 8 past assignments, round-robin over subjects ----------
  const plan: Array<{ subject: SubjectContent; lessonId: string; questions: Question[]; title: string }> = [];
  const cursor = new Map<string, number>();
  for (let i = 0; plan.length < 8 && i < 40; i++) {
    const s = subjects[i % subjects.length];
    const lessons = lessonsWithQuestions(s);
    if (!lessons.length) continue;
    // matematika: assign along the EKUK trace; others: the next lessons after the practised ones
    const mathOrder = ["lcm", "frac-common-denom", "frac-add-diff", "frac-compare"];
    const pool = s.meta.id === "matematika" ? lessons.filter((l) => mathOrder.includes(l.id)) : lessons.slice(2);
    const at = cursor.get(s.meta.id) ?? 0;
    if (at >= pool.length) continue;
    cursor.set(s.meta.id, at + 1);
    const l = pool[at];
    plan.push({ subject: s, lessonId: l.id, questions: lessonQuestions(s.meta.id, l.id).slice(0, 5), title: l.title });
  }

  const assignments: Assignment[] = [];
  const submissions: Submission[] = [];
  const pad = (n: number) => String(n).padStart(2, "0");

  plan.forEach((pl, ai) => {
    const created = new Date(start.getTime() + (ai + 1) * 1.15 * DAY + 9 * 3_600_000);
    const id = `a-v2-${pad(ai + 1)}`;
    assignments.push({
      id,
      subjectId: pl.subject.meta.id,
      lessonId: pl.lessonId,
      classId: CLASS_ID,
      title: pl.title,
      questions: pl.questions,
      materialName: pl.subject.materials.find((m) => m.lessonId === pl.lessonId)?.fileName,
      teacherId: TEACHER_ID,
      createdAt: created.toISOString(),
      dueAt: new Date(created.getTime() + 3 * DAY).toISOString(),
      studentIds: [],
    });

    const isLast = ai === plan.length - 1;
    for (const k of kids) {
      // most pupils finish; the newest assignment is still in progress
      if (r() > (isLast ? 0.6 : 0.92)) continue;
      const prog = getProg(k.id, pl.subject.meta.id);
      const prev = prog.skills[pl.lessonId] ?? { ...initialSkillState(pl.lessonId), p: 0.3 };
      const chance = Math.min(0.95, Math.max(0.1, k.ability + (prev.p - 0.5) * 0.4 + (r() - 0.5) * 0.25));
      const answers = pl.questions.map((q) => {
        const ok = r() < chance;
        const wrong = q.choices.find((c) => c.id !== q.correct && c.misconceptionId) ?? q.choices.find((c) => c.id !== q.correct)!;
        return { questionId: q.id, choiceId: ok ? q.correct : wrong.id, correct: ok };
      });
      const submittedAt = new Date(created.getTime() + (2 + r() * 40) * 3_600_000);
      if (submittedAt > now) continue;
      const score = answers.filter((a) => a.correct).length / Math.max(1, answers.length);
      submissions.push({
        id: `sub-${id}-${k.id}`,
        assignmentId: id,
        studentId: k.id,
        subjectId: pl.subject.meta.id,
        lessonId: pl.lessonId,
        answers,
        score,
        submittedAt: submittedAt.toISOString(),
      });

      // same update as store.addSubmission
      let p = prev.p;
      for (const a of answers) p = updateP(p, a.correct, PRACTICE_PARAMS);
      const correct = answers.filter((a) => a.correct).length;
      prog.skills[pl.lessonId] = {
        ...prev,
        p,
        attempts: prev.attempts + answers.length,
        correct: prev.correct + correct,
        inferred: false,
        practiceAttempts: (prev.practiceAttempts ?? 0) + answers.length,
      };
      prog.updatedAt = submittedAt.toISOString();
      const day = dayIso(submittedAt);
      const avg = avgOf(pl.subject, prog.skills);
      const idx = history.findIndex((h) => h.studentId === k.id && h.subjectId === pl.subject.meta.id && h.date === day);
      if (idx >= 0) history.splice(idx, 1);
      history.push({ studentId: k.id, subjectId: pl.subject.meta.id, date: day, avg });
    }
  });

  history.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { users, assignments, submissions, progress: [...progress.values()], history };
}
