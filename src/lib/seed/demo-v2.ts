// Owner: C. Deterministic v2 demo data: 4 classes with accounts, a quarter (90 days) of
// assignments and submissions, per-subject mastery and the history behind the charts and stats.
// Matematika mastery comes from the v1 seed (same root gaps the v1 screens show);
// other subjects are built by replaying submissions with the same BKT update the
// store applies to live submissions (src/lib/store.ts addSubmission).
import { PRACTICE_PARAMS, initialSkillState, updateP } from "@/engine/bkt";
import { DEMO_USERS } from "@/lib/auth-demo";
import { buildDemoSeed } from "@/lib/seed/demo-class";
import { lessonQuestions, subjects } from "@/lib/subjects";
import type {
  Assignment,
  ClassGroup,
  DemoV2,
  ProgressPoint,
  Question,
  SkillState,
  SubjectContent,
  SubjectProgress,
  Submission,
  User,
} from "@/lib/types";

const TEACHER_ID = "t-dilnoza";
const DEFAULT_CLASS_ID = "6a";
const DEFAULT_CLASS: ClassGroup = { id: DEFAULT_CLASS_ID, name: "6-A sinf", grade: 6, createdAt: "2026-09-02T00:00:00.000Z" };
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

const WINDOW_DAYS = 90;

/** Extra demo classes besides 6a (whose pupils come from the v1 seed). */
const EXTRA_CLASSES: Array<{ group: ClassGroup; size: number; ability: number }> = [
  { group: { id: "6b", name: "6-B sinf", grade: 6, createdAt: "2026-09-02T00:00:00.000Z" }, size: 14, ability: 0.66 },
  { group: { id: "5a", name: "5-A sinf", grade: 5, createdAt: "2026-09-02T00:00:00.000Z" }, size: 13, ability: 0.58 },
  { group: { id: "7a", name: "7-A sinf", grade: 7, createdAt: "2026-09-02T00:00:00.000Z" }, size: 15, ability: 0.72 },
];

const FIRST = ["Aziz", "Malika", "Sardor", "Madina", "Bekzod", "Nilufar", "Javohir", "Şahzoda", "Otabek", "Dilnoza", "Uluğbek", "Gulnoza", "Sanjar", "Zarina", "Doniyor", "Kamola", "Asadbek", "Sevara", "Jahongir", "Muxlisa", "Behruz", "Çarosxon", "Islom", "Feruza"];
const LAST = ["Aliyev", "Karimov", "Rahimov", "Yusupov", "Toşpulatov", "Ergaşev", "Nazarov", "Qodirov", "Saidov", "Xolmatov", "Mirzayev", "Umarov"];
const FEMALE = new Set(["Malika", "Madina", "Nilufar", "Şahzoda", "Dilnoza", "Gulnoza", "Zarina", "Kamola", "Sevara", "Muxlisa", "Çarosxon", "Feruza"]);

export function buildDemoV2(now: Date = new Date()): DemoV2 {
  const r = rng(20261118);
  const v1 = buildDemoSeed(now);
  const start = new Date(now.getTime() - WINDOW_DAYS * DAY);
  const dayIso = (d: Date) => d.toISOString().slice(0, 10);
  const jasur = DEMO_USERS.find((u) => u.id === "s-jasur")!;

  const users: User[] = [...DEMO_USERS];
  const assignments: Assignment[] = [];
  const submissions: Submission[] = [];
  const progress = new Map<string, SubjectProgress>(); // key studentId|subjectId
  const history: ProgressPoint[] = [];
  let loginNo = 0; // one counter for all classes keeps logins unique
  const pad = (n: number) => String(n).padStart(2, "0");

  const getProg = (sid: string, subjectId: string): SubjectProgress => {
    const k = `${sid}|${subjectId}`;
    let p = progress.get(k);
    if (!p) {
      p = { studentId: sid, subjectId, skills: {}, updatedAt: start.toISOString() };
      progress.set(k, p);
    }
    return p;
  };

  function seedClass(classId: string, kids: Kid[], withV1Math: boolean, idPrefix: string) {
    for (const k of kids) {
      if (k.id === jasur.id) continue;
      users.push({ id: k.id, login: loginOf(k.name, ++loginNo), password: "parol123", role: "student", name: k.name, classId });
    }

    // Matematika in 6a: the v1 snapshots (Jasur gets the EKUK-root pupil's map).
    if (withV1Math) {
      const lcmPupil = v1.students[0].snapshot;
      for (const rec of v1.students) if (rec.snapshot) getProg(rec.student.id, "matematika").skills = structuredClone(rec.snapshot.skills);
      if (lcmPupil) getProg(jasur.id, "matematika").skills = structuredClone(lcmPupil.skills);
    }

    // The first lessons were practised before the window (math too, outside 6a).
    for (const s of subjects) {
      if (withV1Math && s.meta.id === "matematika") continue;
      for (const k of kids) {
        const prog = getProg(k.id, s.meta.id);
        const offset = (r() - 0.5) * 0.3;
        for (const l of lessonsWithQuestions(s).slice(0, 2)) {
          let p = 0.3;
          let correct = 0;
          for (let q = 0; q < 5; q++) {
            const ok = r() < Math.min(0.95, Math.max(0.1, k.ability + offset));
            correct += ok ? 1 : 0;
            p = updateP(p, ok, PRACTICE_PARAMS);
          }
          prog.skills[l.id] = { ...initialSkillState(l.id), p, attempts: 5, correct, practiceAttempts: 5, inferred: false };
        }
      }
    }

    // First history point for everyone at the start of the window.
    for (const k of kids)
      for (const s of subjects) {
        const p = progress.get(`${k.id}|${s.meta.id}`);
        if (p) history.push({ studentId: k.id, subjectId: s.meta.id, date: dayIso(start), avg: avgOf(s, p.skills) });
      }

    // Past assignments, round-robin over subjects, spread over the window.
    const plan: Array<{ subject: SubjectContent; lessonId: string; questions: Question[]; title: string }> = [];
    const cursor = new Map<string, number>();
    const mathOrder = ["lcm", "frac-common-denom", "frac-add-diff", "frac-compare"];
    for (let i = 0; i < subjects.length * 8; i++) {
      const s = subjects[i % subjects.length];
      const lessons = lessonsWithQuestions(s);
      const pool = s.meta.id === "matematika" ? lessons.filter((l) => mathOrder.includes(l.id)) : lessons.slice(2);
      const at = cursor.get(s.meta.id) ?? 0;
      if (at >= pool.length) continue;
      cursor.set(s.meta.id, at + 1);
      const l = pool[at];
      plan.push({ subject: s, lessonId: l.id, questions: lessonQuestions(s.meta.id, l.id).slice(0, 5), title: l.title });
    }

    const step = (WINDOW_DAYS - 1) / plan.length;
    plan.forEach((pl, ai) => {
      const created = new Date(start.getTime() + (ai + 1) * step * DAY - 6 * 3_600_000);
      const id = `${idPrefix}${pad(ai + 1)}`;
      assignments.push({
        id,
        subjectId: pl.subject.meta.id,
        lessonId: pl.lessonId,
        classId,
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
        // most pupils finish; the newest assignment is still in progress (Jasur keeps an open test)
        if (isLast && k.id === jasur.id) continue;
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
        const correct = answers.filter((a) => a.correct).length;
        submissions.push({
          id: `sub-${id}-${k.id}`,
          assignmentId: id,
          studentId: k.id,
          subjectId: pl.subject.meta.id,
          lessonId: pl.lessonId,
          answers,
          score: correct / Math.max(1, answers.length),
          submittedAt: submittedAt.toISOString(),
        });

        // same update as store.addSubmission
        let p = prev.p;
        for (const a of answers) p = updateP(p, a.correct, PRACTICE_PARAMS);
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
        const idx = history.findIndex((h) => h.studentId === k.id && h.subjectId === pl.subject.meta.id && h.date === day);
        if (idx >= 0) history.splice(idx, 1);
        history.push({ studentId: k.id, subjectId: pl.subject.meta.id, date: day, avg: avgOf(pl.subject, prog.skills) });
      }
    });
  }

  // 6a: the v1 pupils plus Jasur; ids stay "a-v2-NN" for the demo script.
  const kids6a: Kid[] = v1.students.map((rec, i) => ({ id: rec.student.id, name: rec.student.name, ability: baseAbility(i) }));
  kids6a.push({ id: jasur.id, name: jasur.name, ability: 0.6 });
  seedClass(DEFAULT_CLASS_ID, kids6a, true, "a-v2-");

  for (const { group, size, ability } of EXTRA_CLASSES) {
    const offset = Math.floor(r() * FIRST.length);
    const kids: Kid[] = Array.from({ length: size }, (_, i) => {
      const first = FIRST[(offset + i * 7) % FIRST.length]; // step 7 is coprime with 24: no repeats in a class
      const last = LAST[Math.floor(r() * LAST.length)];
      return {
        id: `s-${group.id}-${pad(i + 1)}`,
        name: `${first} ${FEMALE.has(first) ? `${last}a` : last}`,
        ability: Math.min(0.92, Math.max(0.3, ability + (r() - 0.5) * 0.4)),
      };
    });
    seedClass(group.id, kids, false, `a-v2-${group.id}-`);
  }

  history.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return {
    classes: [DEFAULT_CLASS, ...EXTRA_CLASSES.map((c) => c.group)],
    users,
    assignments,
    submissions,
    progress: [...progress.values()],
    history,
  };
}
