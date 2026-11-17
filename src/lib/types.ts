/**
 * Shared contracts for Ildiz (SI-tyutor). Source of truth for every role.
 *
 * Owner: A. B and C may ADD new types or new OPTIONAL fields in their own commit
 * tagged [contract]. Nobody renames or removes an existing name without agreeing
 * with the team first (see CLAUDE.md, "Contract changes").
 */

// ---------- Content (written by B in src/content/) ----------

/** kebab-case id, e.g. "frac-add-diff" */
export type SkillId = string;
/** kebab-case id, e.g. "add-num-den" */
export type MisconceptionId = string;

export interface Skill {
  id: SkillId;
  /** Uzbek title, e.g. "Har xil maxrajli kasrlarni qo'shish va ayirish" */
  title: string;
  /** Uzbek label for graph nodes, at most 18 characters, e.g. "Har xil maxraj" */
  short: string;
  grade: 5 | 6;
  /** Direct prerequisites only (not transitive). Must not form a cycle. */
  prerequisites: SkillId[];
  /** 1-2 Uzbek sentences: what a student who mastered this skill can do. */
  description: string;
}

export interface KnowledgeGraph {
  subject: string; // "Matematika"
  topic: string; // "Kasrlar"
  skills: Skill[];
  /** Top-of-graph skills the diagnostic starts from, in the order to ask them. */
  entrySkills: SkillId[];
}

export interface Misconception {
  id: MisconceptionId;
  /** Skills where this misconception shows up. */
  skillIds: SkillId[];
  /** Short Uzbek name of the wrong thinking, e.g. "Suratlarni va maxrajlarni alohida qo'shadi" */
  title: string;
  /** Uzbek example with math markup, e.g. "[[1/2]] + [[1/3]] = [[2/5]]" */
  example: string;
  /** 1-3 Uzbek sentences: how to fix the thinking. */
  remedy: string;
}

export type ChoiceId = "a" | "b" | "c" | "d";

export interface Choice {
  id: ChoiceId;
  /** Uzbek text with math markup. */
  text: string;
  /** Set on a wrong choice that reveals a known misconception. */
  misconceptionId?: MisconceptionId;
}

export interface Question {
  /** "<skillId>-NN" for bank items, e.g. "frac-add-diff-03"; generated items use "<skillId>-g-<seed>" */
  id: string;
  skillId: SkillId;
  difficulty: 1 | 2 | 3;
  /** Uzbek text with math markup. */
  stem: string;
  /** Exactly 4 choices, ids a-d. */
  choices: Choice[];
  correct: ChoiceId;
  /** Uzbek worked solution, 1-4 short sentences. Shown when AI is offline. */
  explanation: string;
  /** One Uzbek nudge that does not reveal the answer. */
  hint: string;
  source: "bank" | "generated" | "ai";
}

/** Uzbek math term -> short definition; injected into AI prompts to keep terminology right. */
export interface GlossaryEntry {
  term: string; // "maxraj"
  definition: string; // "kasr chizig'i ostidagi son; butun nechta teng bo'lakka bo'linganini ko'rsatadi"
}

/** Few-shot example for the AI tutor (B writes src/content/tutor-examples.json, A's prompt uses it). */
export interface TutorExample {
  misconceptionId: MisconceptionId;
  /** Uzbek stem with markup */
  stem: string;
  correctText: string;
  chosenText: string;
  /** the explanation we want the AI to imitate: <= 90 words, "sen", markup only */
  idealExplanation: string;
}

/** Deterministic question generator for one skill (B, src/engine/generators/). */
export type QuestionGenerator = (seed: number) => Question;

// ---------- Learner model (computed by A's engine in src/engine/) ----------

export type MasteryLevel = "mastered" | "shaky" | "gap" | "unknown";

export interface SkillState {
  skillId: SkillId;
  /** BKT posterior P(known), 0..1 */
  p: number;
  attempts: number;
  correct: number;
  /** true when p came from graph inference, not from the student's own answers */
  inferred: boolean;
  /** practice answers only (attempts counts diagnostic + practice) */
  practiceAttempts?: number;
  /** how many times each misconception was observed on this skill */
  misconceptions: Partial<Record<MisconceptionId, number>>;
}

export interface Attempt {
  id: string;
  studentId: string;
  questionId: string;
  skillId: SkillId;
  choiceId: ChoiceId;
  correct: boolean;
  misconceptionId: MisconceptionId | null;
  mode: "diagnostic" | "practice";
  /** ISO timestamp */
  ts: string;
}

export interface RootCauseTrace {
  /** entry skill where the student failed */
  targetSkillId: SkillId;
  /** from target down to the root, e.g. ["frac-word", "frac-add-diff", "frac-common-denom", "lcm"] */
  chain: SkillId[];
  rootSkillId: SkillId;
}

export interface PathStep {
  skillId: SkillId;
  reason: "root-gap" | "on-the-way" | "target";
  misconceptionIds: MisconceptionId[];
  status: "locked" | "current" | "done";
}

export interface StudentSnapshot {
  studentId: string;
  skills: Record<SkillId, SkillState>;
  rootGaps: SkillId[];
  traces: RootCauseTrace[];
  path: PathStep[];
  diagnosticDone: boolean;
  /** ISO timestamp */
  updatedAt: string;
}

// ---------- People and storage ----------

export interface Student {
  id: string;
  name: string;
  classId: string;
  createdAt: string;
}

export interface ClassRoom {
  id: string; // "6a"
  name: string; // "6-A sinf"
  teacherName: string;
  grade: 5 | 6;
}

export interface StudentRecord {
  student: Student;
  snapshot: StudentSnapshot | null;
}

/** Storage interface. A implements it (memory + Postgres); C's teacher code only reads through it. */
export interface Repo {
  getClass(id: string): Promise<ClassRoom | null>;
  createStudent(input: { name: string; classId: string }): Promise<Student>;
  getStudent(id: string): Promise<StudentRecord | null>;
  saveProgress(studentId: string, attempts: Attempt[], snapshot: StudentSnapshot): Promise<void>;
  listClassStudents(classId: string): Promise<StudentRecord[]>;
  /** newest first */
  listAttempts(filter: { classId?: string; studentId?: string; since?: string; limit?: number }): Promise<Attempt[]>;
  /** wipe the class and load seed data (demo reset) */
  seedClass(data: SeedData): Promise<void>;
}

export interface SeedData {
  classRoom: ClassRoom;
  students: StudentRecord[];
  attempts: Attempt[];
}

// ---------- Teacher (computed by C in src/lib/teacher/) ----------

export interface ClassReport {
  classRoom: ClassRoom;
  students: Array<StudentRecord & { lastActive: string | null; masteryAvg: number }>;
  skillStats: Array<{ skillId: SkillId; avgP: number; gapCount: number; shakyCount: number; masteredCount: number }>;
  topRootGaps: Array<{ skillId: SkillId; studentIds: string[] }>;
  topMisconceptions: Array<{ misconceptionId: MisconceptionId; count: number; studentIds: string[] }>;
  recentAttempts: Array<Attempt & { studentName: string }>;
  generatedAt: string;
}

export interface Worksheet {
  title: string;
  intro: string;
  items: Array<{ stem: string; answer: string; skillId: SkillId; source: "generated" | "ai" }>;
  teacherNotes: string;
}

// ---------- HTTP API (request/response bodies) ----------

export interface CreateStudentRequest { name: string; classId: string }
export interface CreateStudentResponse { student: Student }

export interface SaveProgressRequest { attempts: Attempt[]; snapshot: StudentSnapshot }
export interface SaveProgressResponse { ok: true }

/** POST /api/tutor/explain -> streamed text/plain (Uzbek, may contain math markup) */
export interface ExplainRequest {
  question: Question;
  choiceId: ChoiceId;
  studentName?: string;
}

/** POST /api/tutor/chat -> streamed text/plain */
export interface ChatRequest {
  skillId: SkillId;
  /** current practice question, if any; the tutor must not just give its answer */
  question?: Question;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

/** POST /api/teacher/worksheet -> Worksheet JSON */
export interface WorksheetRequest {
  classId: string;
  skillIds: SkillId[];
  misconceptionIds: MisconceptionId[];
  count?: number; // default 8
}
