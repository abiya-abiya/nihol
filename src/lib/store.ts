import "server-only";
import { PRACTICE_PARAMS, initialSkillState, updateP } from "@/engine/bkt";
import { DEMO_USERS } from "@/lib/auth-demo";
import { getDoc, setDoc } from "@/lib/db/kv";
import { buildDemoV2 } from "@/lib/seed/demo-v2";
import { subjects as defaultSubjects } from "@/lib/subjects";
import type {
  Assignment,
  ClassGroup,
  ProgressPoint,
  Question,
  Skill,
  SubjectContent,
  SubjectMeta,
  SubjectProgress,
  Submission,
  User,
} from "@/lib/types";

/** v2 application store on top of the kv document store. Small data, whole-collection reads. */

const K = {
  users: "users",
  custom: "customSubjects",
  assignments: "assignments",
  submissions: "submissions",
  progress: "progress",
  history: "history",
  classes: "classes",
} as const;

interface CustomSubject {
  meta: SubjectMeta;
  lessons: Skill[];
  questions: Question[];
}

const g = globalThis as unknown as { __ildizSeed?: Promise<void> };

export function ensureSeeded(): Promise<void> {
  g.__ildizSeed ??= (async () => {
    const users = await getDoc<User[]>(K.users);
    if (users && users.length) {
      // demo accounts must always exist
      const missing = DEMO_USERS.filter((d) => !users.some((u) => u.login === d.login));
      if (missing.length) await setDoc(K.users, [...users, ...missing]);
      return;
    }
    const demo = buildDemoV2();
    const merged = [...DEMO_USERS, ...demo.users.filter((u) => !DEMO_USERS.some((d) => d.login === u.login || d.id === u.id))];
    await setDoc(K.users, merged);
    await setDoc(K.assignments, demo.assignments);
    await setDoc(K.submissions, demo.submissions);
    await setDoc(K.progress, demo.progress);
    await setDoc(K.history, demo.history);
    await setDoc(K.custom, []);
  })().catch((e) => {
    g.__ildizSeed = undefined;
    throw e;
  });
  return g.__ildizSeed;
}

/** Wipe and re-seed v2 data (demo reset). */
export async function resetV2(): Promise<void> {
  g.__ildizSeed = undefined;
  await setDoc(K.users, []);
  await ensureSeeded();
}

const list = async <T>(key: string) => (await getDoc<T[]>(key)) ?? [];

// ---------- users ----------
export async function getUsers(): Promise<User[]> {
  await ensureSeeded();
  return list<User>(K.users);
}
export async function findUser(login: string): Promise<User | null> {
  return (await getUsers()).find((u) => u.login.toLowerCase() === login.trim().toLowerCase()) ?? null;
}
export async function getUser(id: string): Promise<User | null> {
  return (await getUsers()).find((u) => u.id === id) ?? null;
}
export async function addUsers(users: User[]): Promise<void> {
  const all = await getUsers();
  await setDoc(K.users, [...all, ...users]);
}

export async function setUserClass(userId: string, classId: string | undefined): Promise<void> {
  const all = await getUsers();
  await setDoc(
    K.users,
    all.map((u) => (u.id === userId ? { ...u, classId } : u)),
  );
}

// ---------- classes ----------
/** The demo class every seed user belongs to. It can be renamed but not deleted. */
export const DEFAULT_CLASS: ClassGroup = { id: "6a", name: "6-A sinf", grade: 6, createdAt: "2026-11-01T00:00:00.000Z" };

const classSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/ö/g, "o")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "sh")
    .replace(/ç/g, "ch")
    .replace(/[ʼʻ'’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24) || "sinf";

/** All classes; created lazily with the demo class so older databases keep working. */
export async function listClasses(): Promise<ClassGroup[]> {
  await ensureSeeded();
  const c = await getDoc<ClassGroup[]>(K.classes);
  if (c) return c;
  await setDoc(K.classes, [DEFAULT_CLASS]);
  return [DEFAULT_CLASS];
}
export async function getClassGroup(id: string | undefined): Promise<ClassGroup | null> {
  if (!id) return null;
  return (await listClasses()).find((c) => c.id === id) ?? null;
}
/** The given class id if it still exists, else the first class. */
export async function resolveClassId(id: string | undefined): Promise<string | undefined> {
  const all = await listClasses();
  return all.find((c) => c.id === id)?.id ?? all[0]?.id;
}
export async function addClass(input: { name: string; grade?: number }): Promise<ClassGroup> {
  const all = await listClasses();
  const base = classSlug(input.name);
  let id = base;
  for (let i = 2; all.some((c) => c.id === id); i++) id = `${base}-${i}`;
  const c: ClassGroup = { id, name: input.name, grade: input.grade, createdAt: new Date().toISOString() };
  await setDoc(K.classes, [...all, c]);
  return c;
}
export async function updateClass(id: string, patch: { name?: string; grade?: number | null }): Promise<ClassGroup | null> {
  const all = await listClasses();
  const cur = all.find((c) => c.id === id);
  if (!cur) return null;
  const next: ClassGroup = {
    ...cur,
    ...(patch.name !== undefined && { name: patch.name }),
    ...(patch.grade !== undefined && { grade: patch.grade ?? undefined }),
  };
  await setDoc(
    K.classes,
    all.map((c) => (c.id === id ? next : c)),
  );
  return next;
}
export interface ClassStats {
  students: number;
  parents: number;
  tests: number;
}
export function classStats(classId: string, users: User[], assignments: Assignment[]): ClassStats {
  return {
    students: users.filter((u) => u.role === "student" && u.classId === classId).length,
    parents: users.filter((u) => u.role === "parent" && u.classId === classId).length,
    tests: assignments.filter((a) => a.classId === classId).length,
  };
}
/** Delete a class with its student and parent accounts, tests and the students' results. */
export async function deleteClass(id: string): Promise<ClassStats | null> {
  const all = await listClasses();
  if (!all.some((c) => c.id === id)) return null;
  const users = await getUsers();
  const assignments = await list<Assignment>(K.assignments);
  const stats = classStats(id, users, assignments);
  const studentIds = new Set(users.filter((u) => u.role === "student" && u.classId === id).map((u) => u.id));
  const gone = (u: User) => u.role !== "teacher" && (u.classId === id || (!!u.childId && studentIds.has(u.childId)));
  const keep = <T extends { studentId: string }>(xs: T[]) => xs.filter((x) => !studentIds.has(x.studentId));
  await setDoc(
    K.classes,
    all.filter((c) => c.id !== id),
  );
  await setDoc(
    K.users,
    users.filter((u) => !gone(u)),
  );
  await setDoc(
    K.assignments,
    assignments.filter((a) => a.classId !== id),
  );
  await setDoc(K.submissions, keep(await list<Submission>(K.submissions)));
  await setDoc(K.progress, keep(await list<SubjectProgress>(K.progress)));
  await setDoc(K.history, keep(await list<ProgressPoint>(K.history)));
  return stats;
}

// ---------- subjects ----------
async function customSubjects(): Promise<CustomSubject[]> {
  await ensureSeeded();
  return list<CustomSubject>(K.custom);
}

function toContent(c: CustomSubject): SubjectContent {
  return {
    meta: c.meta,
    graph: {
      subject: c.meta.name,
      topic: c.meta.name,
      skills: c.lessons,
      entrySkills: c.lessons.length ? [c.lessons[c.lessons.length - 1].id] : [],
    },
    questions: c.questions,
    materials: [],
  };
}

export async function listSubjects(): Promise<SubjectContent[]> {
  const custom = (await customSubjects()).map(toContent);
  // a teacher may add lessons to a default subject: stored as a custom doc with the same id
  const defaults = defaultSubjects.map((d) => {
    const extra = custom.find((c) => c.meta.id === d.meta.id);
    return extra
      ? { ...d, graph: { ...d.graph, skills: [...d.graph.skills, ...extra.graph.skills] }, questions: [...d.questions, ...extra.questions] }
      : d;
  });
  const own = custom.filter((c) => !defaultSubjects.some((d) => d.meta.id === c.meta.id));
  return [...defaults, ...own].sort((a, b) => a.meta.order - b.meta.order);
}

export async function getSubject(id: string): Promise<SubjectContent | null> {
  return (await listSubjects()).find((s) => s.meta.id === id) ?? null;
}

export async function addSubject(meta: SubjectMeta): Promise<void> {
  const all = await customSubjects();
  await setDoc(K.custom, [...all, { meta, lessons: [], questions: [] }]);
}

export async function addLesson(subjectId: string, lesson: Skill, questions: Question[] = []): Promise<void> {
  const all = await customSubjects();
  const existing = all.find((c) => c.meta.id === subjectId);
  const base = defaultSubjects.find((d) => d.meta.id === subjectId);
  if (existing) {
    existing.lessons.push(lesson);
    existing.questions.push(...questions);
    await setDoc(K.custom, all);
  } else if (base) {
    await setDoc(K.custom, [...all, { meta: base.meta, lessons: [lesson], questions }]);
  }
}

// ---------- assignments ----------
export async function listAssignments(f: { classId?: string; studentId?: string }): Promise<Assignment[]> {
  await ensureSeeded();
  let a = await list<Assignment>(K.assignments);
  if (f.classId) a = a.filter((x) => x.classId === f.classId);
  if (f.studentId) a = a.filter((x) => x.studentIds.length === 0 || x.studentIds.includes(f.studentId!));
  return a.sort((x, y) => (x.createdAt < y.createdAt ? 1 : -1));
}
export async function getAssignment(id: string): Promise<Assignment | null> {
  return (await list<Assignment>(K.assignments)).find((a) => a.id === id) ?? null;
}
export async function addAssignment(a: Assignment): Promise<void> {
  await ensureSeeded();
  await setDoc(K.assignments, [...(await list<Assignment>(K.assignments)), a]);
}

// ---------- submissions + progress ----------
export async function listSubmissions(f: { studentIds?: string[] }): Promise<Submission[]> {
  await ensureSeeded();
  const s = await list<Submission>(K.submissions);
  return f.studentIds ? s.filter((x) => f.studentIds!.includes(x.studentId)) : s;
}

export async function listProgress(studentIds: string[]): Promise<{ progress: SubjectProgress[]; history: ProgressPoint[] }> {
  await ensureSeeded();
  const progress = (await list<SubjectProgress>(K.progress)).filter((p) => studentIds.includes(p.studentId));
  const history = (await list<ProgressPoint>(K.history)).filter((p) => studentIds.includes(p.studentId));
  return { progress, history };
}

/** Store a submission, update the lesson's BKT mastery and today's history point. */
export async function addSubmission(sub: Submission): Promise<SubjectProgress> {
  await ensureSeeded();
  await setDoc(K.submissions, [...(await list<Submission>(K.submissions)), sub]);

  const all = await list<SubjectProgress>(K.progress);
  let prog = all.find((p) => p.studentId === sub.studentId && p.subjectId === sub.subjectId);
  if (!prog) {
    prog = { studentId: sub.studentId, subjectId: sub.subjectId, skills: {}, updatedAt: sub.submittedAt };
    all.push(prog);
  }
  const prev = prog.skills[sub.lessonId] ?? { ...initialSkillState(sub.lessonId), p: 0.3 };
  let p = prev.p;
  for (const a of sub.answers) p = updateP(p, a.correct, PRACTICE_PARAMS);
  const correct = sub.answers.filter((a) => a.correct).length;
  prog.skills[sub.lessonId] = {
    ...prev,
    p,
    attempts: prev.attempts + sub.answers.length,
    correct: prev.correct + correct,
    inferred: false,
    practiceAttempts: (prev.practiceAttempts ?? 0) + sub.answers.length,
  };
  prog.updatedAt = sub.submittedAt;
  await setDoc(K.progress, all);

  const subject = await getSubject(sub.subjectId);
  const lessons = subject?.graph.skills.map((s) => s.id) ?? Object.keys(prog.skills);
  const avg = lessons.reduce((acc, id) => acc + (prog!.skills[id]?.p ?? 0), 0) / Math.max(1, lessons.length);
  const day = sub.submittedAt.slice(0, 10);
  const hist = (await list<ProgressPoint>(K.history)).filter(
    (h) => !(h.studentId === sub.studentId && h.subjectId === sub.subjectId && h.date === day),
  );
  hist.push({ studentId: sub.studentId, subjectId: sub.subjectId, date: day, avg });
  await setDoc(K.history, hist);
  return prog;
}
