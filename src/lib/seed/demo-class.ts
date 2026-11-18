// Owner: C. Deterministic synthetic demo class "6-A sinf" (24 pupils).
//
// Pupils are not hand-written snapshots: each has a hidden "weak skills" profile
// and we replay A's real diagnostic engine against it (and a little practice),
// so every snapshot is exactly what the app would produce for those answers.
import { answerDiagnostic, answerPractice, buildSnapshot, nextDiagnosticQuestion, pickPracticeQuestion, startDiagnostic } from "@/engine";
import { graph, questionsBySkill } from "@/lib/content";
import type { Attempt, ChoiceId, MisconceptionId, Question, SeedData, SkillId, StudentRecord, StudentSnapshot } from "@/lib/types";

interface Profile {
  name: string;
  /** skills this pupil gets wrong */
  weak: SkillId[];
  /** misconceptions this pupil tends to show, in order of preference */
  prefers?: MisconceptionId[];
  /** practice answers after the diagnostic (true = correct), on the current path step */
  practice?: boolean[];
  /** hours ago the pupil started (spread over the last 2 days) */
  hoursAgo: number;
  /** joined but has not finished the diagnostic yet */
  noSnapshot?: boolean;
}

const LCM_CHAIN = ["lcm", "frac-common-denom", "frac-add-diff", "frac-word", "mixed-add", "frac-compare"];
const CONCEPT_CHAIN = [
  "frac-concept",
  "frac-add-same",
  "frac-add-diff",
  "frac-equiv",
  "frac-common-denom",
  "frac-compare",
  "frac-simplify",
  "frac-mul",
  "frac-div",
  "frac-word",
  "mixed-numbers",
  "mixed-add",
];
const MIXED_CHAIN = ["mixed-numbers", "mixed-add"];

const PROFILES: Profile[] = [
  // 7 pupils: root gap EKUK (lcm), traced through common denominator and adding.
  { name: "Aziza Karimova", weak: LCM_CHAIN, prefers: ["lcm-is-product", "add-num-den"], practice: [false, true], hoursAgo: 46 },
  { name: "Bekzod Toşmatov", weak: LCM_CHAIN, prefers: ["lcm-gcd-swap", "add-num-den"], hoursAgo: 44 },
  { name: "Dilşod Rahimov", weak: LCM_CHAIN, prefers: ["lcm-is-product", "common-denom-keep-num"], practice: [true, false, true], hoursAgo: 40 },
  { name: "Gulnoza Saidova", weak: LCM_CHAIN, prefers: ["lcm-gcd-swap", "bigger-den-bigger"], hoursAgo: 27 },
  { name: "Laziz Bakirov", weak: [...LCM_CHAIN, "frac-div"], prefers: ["lcm-is-product", "div-no-flip"], hoursAgo: 22 },
  { name: "Rayhona Davletova", weak: LCM_CHAIN, prefers: ["lcm-is-product", "add-num-den"], practice: [false], hoursAgo: 5 },
  { name: "Temur Ğaniyev", weak: LCM_CHAIN, prefers: ["lcm-gcd-swap", "common-denom-keep-num"], hoursAgo: 1.2 },

  // 5 pupils: root gap "Kasr tushunchasi" (everything above it is shaky too).
  { name: "Husan Mirzayev", weak: CONCEPT_CHAIN, prefers: ["part-of-rest", "add-num-den"], hoursAgo: 45 },
  { name: "Iroda Nazarova", weak: CONCEPT_CHAIN, prefers: ["add-num-den", "equiv-one-side"], practice: [false, false, true], hoursAgo: 30 },
  { name: "Nodir Ergaşev", weak: CONCEPT_CHAIN, prefers: ["add-num-den", "mul-common-denom"], hoursAgo: 26 },
  { name: "Umida Fayzullayeva", weak: CONCEPT_CHAIN, prefers: ["equiv-one-side", "add-num-den"], hoursAgo: 8 },
  { name: "Zafar Valiyev", weak: CONCEPT_CHAIN, prefers: ["add-num-den", "part-of-rest"], hoursAgo: 3 },

  // 4 pupils: mixed numbers, misconception "mixed-convert".
  { name: "Kamola Yusupova", weak: MIXED_CHAIN, prefers: ["mixed-convert", "add-num-den"], practice: [false, true], hoursAgo: 43 },
  { name: "Otabek Jurayev", weak: MIXED_CHAIN, prefers: ["mixed-convert", "common-denom-keep-num"], hoursAgo: 29 },
  { name: "Şahzoda Olimova", weak: MIXED_CHAIN, prefers: ["mixed-convert"], hoursAgo: 20 },
  { name: "Xurşid Latipov", weak: MIXED_CHAIN, prefers: ["mixed-convert", "add-num-den"], hoursAgo: 2.4 },

  // 6 pupils: mostly mastered (two with a single local slip).
  { name: "Feruza Abdullayeva", weak: [], hoursAgo: 47 },
  { name: "Madina Xolmatova", weak: [], hoursAgo: 41 },
  { name: "Oydin Qodirova", weak: ["frac-div"], prefers: ["div-no-flip"], practice: [true, true, true], hoursAgo: 25 },
  { name: "Sardor Ismoilov", weak: [], hoursAgo: 23 },
  { name: "Yulduz Zokirova", weak: ["frac-compare"], prefers: ["bigger-den-bigger"], hoursAgo: 6 },
  { name: "Sanjar Pölatov", weak: [], hoursAgo: 0.6 },

  // 2 pupils: joined, diagnostic not finished.
  { name: "Muslima Hamidova", weak: ["frac-word"], hoursAgo: 0.3, noSnapshot: true },
  { name: "Javohir Usmonov", weak: [], hoursAgo: 0.15, noSnapshot: true },
];

/** Pick the answer this pupil would give: correct unless the skill is weak. */
function chooseAnswer(q: Question, p: Profile, salt: number): ChoiceId {
  if (!p.weak.includes(q.skillId)) return q.correct;
  const wrong = q.choices.filter((c) => c.id !== q.correct);
  for (const m of p.prefers ?? []) {
    const hit = wrong.find((c) => c.misconceptionId === m);
    if (hit) return hit.id;
  }
  const tagged = wrong.filter((c) => c.misconceptionId);
  const pool = tagged.length ? tagged : wrong;
  return pool[salt % pool.length].id;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Profile names in order (ids seed-<class>-01…), reused by the v2 seed. */
export const DEMO_STUDENT_NAMES = PROFILES.map((p) => p.name);

export function buildDemoSeed(now: Date = new Date()): SeedData {
  const classId = process.env.DEMO_CLASS_ID || "6a";
  const students: StudentRecord[] = [];
  const attempts: Attempt[] = [];

  PROFILES.forEach((p, i) => {
    const id = `seed-${classId}-${pad(i + 1)}`;
    const start = now.getTime() - p.hoursAgo * 3_600_000;
    const student = { id, name: p.name, classId, createdAt: new Date(start).toISOString() };
    let n = 0;
    // 25–55 s per answer, deterministic per pupil.
    const tsOf = (k: number) => {
      let t = start + 20_000;
      for (let j = 1; j <= k; j++) t += 25_000 + ((i * 7 + j * 13) % 30) * 1000;
      return new Date(t).toISOString();
    };
    const record = (q: Question, choiceId: ChoiceId, mode: Attempt["mode"]) => {
      const choice = q.choices.find((c) => c.id === choiceId);
      attempts.push({
        id: `${id}-a${pad(n + 1)}`,
        studentId: id,
        questionId: q.id,
        skillId: q.skillId,
        choiceId,
        correct: choiceId === q.correct,
        misconceptionId: choiceId === q.correct ? null : (choice?.misconceptionId ?? null),
        mode,
        ts: tsOf(n),
      });
      n += 1;
    };

    let state = startDiagnostic(graph);
    for (let q = nextDiagnosticQuestion(state, questionsBySkill); q; q = nextDiagnosticQuestion(state, questionsBySkill)) {
      const choiceId = chooseAnswer(q, p, i + n);
      record(q, choiceId, "diagnostic");
      state = answerDiagnostic(state, graph, q, choiceId);
      if (state.done || (p.noSnapshot && n >= 3 - (i % 2))) break;
    }
    if (p.noSnapshot) {
      students.push({ student, snapshot: null });
      return;
    }
    let snapshot: StudentSnapshot = buildSnapshot(id, graph, state.skills, true, new Date(tsOf(n - 1)));

    const asked: string[] = [];
    for (const ok of p.practice ?? []) {
      const step = snapshot.path.find((s) => s.status === "current");
      if (!step) break;
      const q = pickPracticeQuestion(step.skillId, asked, questionsBySkill, undefined, i * 100 + n);
      asked.push(q.id);
      const choiceId = ok ? q.correct : chooseAnswer(q, { ...p, weak: [q.skillId] }, i + n);
      record(q, choiceId, "practice");
      snapshot = answerPractice(snapshot, graph, q, choiceId, new Date(tsOf(n - 1)));
    }

    students.push({ student, snapshot });
  });

  return {
    classRoom: { id: classId, name: "6-A sinf", teacherName: "Dilnoza Karimova", grade: 6 },
    students,
    attempts,
  };
}
