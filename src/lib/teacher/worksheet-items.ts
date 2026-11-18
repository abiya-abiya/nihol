// Owner: C. Worksheet tasks: B's generators (B3) where they fit print, plus
// our own for skills B has none for or whose stems need the four choices.
// Every answer is computed here, never by the AI. Deterministic per seed.
import { generators as bGenerators } from "@/engine/generators";
import { generateWorksheetItems } from "@/engine/generators/worksheet";
import type { SkillId } from "@/lib/types";

export interface WorksheetTask {
  stem: string;
  answer: string;
  skillId: SkillId;
  /** bare computation for the AI to wrap into a story, e.g. "[[1/4]] + [[1/6]]" (optional) */
  expr?: string;
}

// ---------- math ----------
export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;

/** Markup for n/d in lowest terms: whole number, proper fraction or mixed number. */
export function fmt(n: number, d: number): string {
  const g = gcd(n, d);
  const nn = n / g;
  const dd = d / g;
  if (dd === 1) return String(nn);
  if (nn > dd) {
    const w = Math.floor(nn / dd);
    return `[[${w} ${nn - w * dd}/${dd}]]`;
  }
  return `[[${nn}/${dd}]]`;
}

/** "[[6/12]] = [[1/2]]" when the raw result simplifies, else just the simplest form. */
function fmtEq(n: number, d: number): string {
  const simple = fmt(n, d);
  const raw = `[[${n}/${d}]]`;
  return gcd(n, d) === 1 && n < d ? raw : `${raw} = ${simple}`;
}

// ---------- seeded randomness ----------
function rng(seed: number) {
  let a = seed >>> 0 || 1;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1));
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(next() * xs.length)];
  return { next, int, pick };
}
type R = ReturnType<typeof rng>;

/** proper fraction n/d in lowest terms with the given denominator */
function properOver(r: R, d: number): number {
  const options = Array.from({ length: d - 1 }, (_, i) => i + 1).filter((n) => gcd(n, d) === 1);
  return r.pick(options);
}

const DEN_PAIRS = [
  [4, 6],
  [6, 8],
  [6, 9],
  [4, 10],
  [8, 12],
  [9, 12],
  [10, 15],
  [6, 10],
  [3, 4],
  [2, 3],
  [4, 6],
  [5, 10],
] as const;
const LCM_PAIRS = [
  [4, 6],
  [6, 8],
  [6, 9],
  [8, 12],
  [10, 15],
  [9, 12],
  [6, 10],
  [12, 18],
  [4, 10],
  [8, 10],
  [12, 16],
  [14, 21],
] as const;
const COPRIME = [
  [2, 3],
  [3, 4],
  [2, 5],
  [3, 5],
  [4, 5],
  [5, 6],
  [3, 7],
  [2, 7],
  [4, 7],
  [5, 7],
] as const;

type Gen = (r: R) => Omit<WorksheetTask, "skillId">;

const GENERATORS: Record<SkillId, Gen> = {
  "nat-mul": (r) => {
    const a = r.int(12, 48);
    const b = r.int(3, 9);
    return { stem: `Hisobla: ${a} · ${b}`, answer: String(a * b) };
  },
  "nat-div": (r) => {
    const b = r.int(3, 9);
    const q = r.int(6, 14);
    const rem = r.int(1, b - 1);
    return { stem: `${b * q + rem} ni ${b} ga qoldiqli böl.`, answer: `${q}, qoldiq ${rem}` };
  },
  divisibility: (r) => {
    const d = r.pick([2, 3, 5, 9] as const);
    const yes: number[] = [];
    const no: number[] = [];
    while (yes.length < 2 || no.length < 3) {
      const x = r.int(102, 989);
      if ([...yes, ...no].includes(x)) continue;
      if (x % d === 0 && yes.length < 2) yes.push(x);
      else if (x % d !== 0 && no.length < 3) no.push(x);
    }
    const all = [...yes, ...no].sort(() => r.next() - 0.5);
    return {
      stem: `Qaysi sonlar ${d} ga qoldiqsiz bölinadi? ${all.join("; ")}`,
      answer: all.filter((x) => x % d === 0).join("; "),
    };
  },
  gcd: (r) => {
    const g = r.int(2, 9);
    const [m, n] = r.pick(COPRIME);
    return { stem: `EKUB(${g * m}, ${g * n}) ni top.`, answer: String(g), expr: `EKUB(${g * m}, ${g * n})` };
  },
  lcm: (r) => {
    const [a, b] = r.pick(LCM_PAIRS);
    return { stem: `EKUK(${a}, ${b}) ni top.`, answer: String(lcm(a, b)), expr: `EKUK(${a}, ${b})` };
  },
  "frac-concept": (r) => {
    const n = r.int(5, 12);
    const k = r.int(1, n - 1);
    if (r.next() < 0.5) {
      return {
        stem: `Tort ${n} ta teng bölakka bölindi. ${k} ta bölagi yeyildi. Tortning qanday qismi yeyildi?`,
        answer: fmtEq(k, n),
      };
    }
    return {
      stem: `Tasma ${n} ta teng bölakka bölindi. ${k} ta bölagi işlatildi. Tasmaning qanday qismi qoldi?`,
      answer: fmtEq(n - k, n),
    };
  },
  "frac-equiv": (r) => {
    const b = r.int(3, 9);
    const a = properOver(r, b);
    const k = r.int(2, 5);
    return {
      stem: `[[${a}/${b}]] kasrni maxraji ${b * k} bölgan kasrga keltir.`,
      answer: `[[${a * k}/${b * k}]]`,
    };
  },
  "frac-simplify": (r) => {
    const b = r.int(3, 9);
    const a = properOver(r, b);
    const g = r.int(2, 6);
    return { stem: `[[${a * g}/${b * g}]] kasrni qisqartir.`, answer: `[[${a}/${b}]]` };
  },
  "frac-common-denom": (r) => {
    const [b, d] = r.pick(DEN_PAIRS);
    const a = properOver(r, b);
    const c = properOver(r, d);
    const L = lcm(b, d);
    return {
      stem: `[[${a}/${b}]] va [[${c}/${d}]] kasrlarni eng kiçik umumiy maxrajga keltir.`,
      answer: `[[${a * (L / b)}/${L}]] va [[${c * (L / d)}/${L}]]`,
    };
  },
  "frac-compare": (r) => {
    for (;;) {
      const [b, d] = r.pick(DEN_PAIRS);
      const a = properOver(r, b);
      const c = properOver(r, d);
      if (a * d === c * b) continue;
      const sign = a * d > c * b ? ">" : "<";
      return { stem: `Taqqosla: [[${a}/${b}]] va [[${c}/${d}]]`, answer: `[[${a}/${b}]] ${sign} [[${c}/${d}]]` };
    }
  },
  "frac-add-same": (r) => {
    const n = r.int(5, 13);
    const a = r.int(1, n - 2);
    const b = r.int(1, n - 1 - a);
    if (r.next() < 0.5 && a !== b) {
      const [x, y] = a > b ? [a, b] : [b, a];
      return { stem: `Hisobla: [[${x}/${n}]] − [[${y}/${n}]]`, answer: fmtEq(x - y, n), expr: `[[${x}/${n}]] − [[${y}/${n}]]` };
    }
    return { stem: `Hisobla: [[${a}/${n}]] + [[${b}/${n}]]`, answer: fmtEq(a + b, n), expr: `[[${a}/${n}]] + [[${b}/${n}]]` };
  },
  "frac-add-diff": (r) => {
    for (;;) {
      const [b, d] = r.pick(DEN_PAIRS);
      const a = properOver(r, b);
      const c = properOver(r, d);
      const L = lcm(b, d);
      const x = a * (L / b);
      const y = c * (L / d);
      if (r.next() < 0.6) {
        const expr = `[[${a}/${b}]] + [[${c}/${d}]]`;
        return { stem: `Hisobla: ${expr}`, answer: fmt(x + y, L), expr };
      }
      if (x === y) continue;
      const [p, q] = x > y ? [`[[${a}/${b}]]`, `[[${c}/${d}]]`] : [`[[${c}/${d}]]`, `[[${a}/${b}]]`];
      const expr = `${p} − ${q}`;
      return { stem: `Hisobla: ${expr}`, answer: fmt(Math.abs(x - y), L), expr };
    }
  },
  "mixed-numbers": (r) => {
    const w = r.int(1, 5);
    const d = r.int(2, 9);
    const n = properOver(r, d);
    return { stem: `[[${w} ${n}/${d}]] ni notöğri kasrga aylantir.`, answer: `[[${w * d + n}/${d}]]` };
  },
  "mixed-add": (r) => {
    for (;;) {
      const [b, d] = r.pick(DEN_PAIRS);
      const a = properOver(r, b);
      const c = properOver(r, d);
      const w1 = r.int(1, 4);
      const w2 = r.int(1, 4);
      const L = lcm(b, d);
      const X = w1 * L + a * (L / b);
      const Y = w2 * L + c * (L / d);
      const m1 = `[[${w1} ${a}/${b}]]`;
      const m2 = `[[${w2} ${c}/${d}]]`;
      if (r.next() < 0.55) return { stem: `Hisobla: ${m1} + ${m2}`, answer: fmt(X + Y, L), expr: `${m1} + ${m2}` };
      if (X === Y) continue;
      const expr = X > Y ? `${m1} − ${m2}` : `${m2} − ${m1}`;
      return { stem: `Hisobla: ${expr}`, answer: fmt(Math.abs(X - Y), L), expr };
    }
  },
  "frac-mul": (r) => {
    const b = r.int(2, 9);
    const d = r.int(2, 9);
    const a = properOver(r, b);
    const c = properOver(r, d);
    const expr = `[[${a}/${b}]] · [[${c}/${d}]]`;
    return { stem: `Hisobla: ${expr}`, answer: fmt(a * c, b * d), expr };
  },
  "frac-div": (r) => {
    const b = r.int(2, 9);
    const d = r.int(2, 9);
    const a = properOver(r, b);
    const c = properOver(r, d);
    const expr = `[[${a}/${b}]] : [[${c}/${d}]]`;
    return { stem: `Hisobla: ${expr}`, answer: fmt(a * d, b * c), expr };
  },
  "frac-word": (r) => {
    const v = r.int(0, 2);
    if (v === 0) {
      const b = r.pick([3, 4, 5, 6] as const);
      const a = properOver(r, b);
      const N = b * r.int(4, Math.floor(36 / b));
      return {
        stem: `Sinfda ${N} öquvçi bor. Ularning [[${a}/${b}]] qismi qizlar. Sinfda neçta öğil bola bor?`,
        answer: String(N - (N / b) * a),
      };
    }
    if (v === 1) {
      for (;;) {
        const [b, d] = r.pick(DEN_PAIRS);
        const a = properOver(r, b);
        const c = properOver(r, d);
        const L = lcm(b, d);
        const s = a * (L / b) + c * (L / d);
        if (s >= L) continue;
        return {
          stem: `Kitobning [[${a}/${b}]] qismi birinçi kuni, [[${c}/${d}]] qismi ikkinçi kuni öqildi. Ikki kunda kitobning qanday qismi öqildi?`,
          answer: fmt(s, L),
        };
      }
    }
    const b = r.pick([3, 4, 5, 6, 8] as const);
    const a = properOver(r, b);
    const len = b * r.int(2, 6);
    return {
      stem: `Arqonning uzunligi ${len} m. Uning [[${a}/${b}]] qismi kesib olindi. Neça metr arqon qoldi?`,
      answer: `${len - (len / b) * a} m`,
    };
  },
};

export const supportedSkill = (id: SkillId) => id in GENERATORS;

/**
 * `count` tasks for the given skills: the first skill (the root gap) gets ~60%,
 * the rest share the remainder; easy-to-hard order follows the skill order.
 */
export function generateWorksheetTasks(skillIds: SkillId[], count = 8, seed = 1): WorksheetTask[] {
  const skills = skillIds.filter(supportedSkill);
  if (!skills.length) return [];
  const r = rng(seed);
  const share = skills.length === 1 ? [count] : [Math.ceil(count * 0.6)];
  for (let i = 1; i < skills.length; i++) {
    const left = count - share.reduce((a, b) => a + b, 0);
    share.push(i === skills.length - 1 ? left : Math.max(1, Math.round(left / (skills.length - i))));
  }
  const out: WorksheetTask[] = [];
  const seen = new Set<string>();
  skills.forEach((skillId, i) => {
    let made = 0;
    let guard = 0;
    while (made < share[i] && guard++ < 200) {
      const t = GENERATORS[skillId](r);
      // word problems: one per story template; drills: unique stems
      const key = skillId === "frac-word" ? t.stem.split(" ")[0] : t.stem;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...t, skillId });
      made++;
    }
  });
  return out;
}

/** Computations with a clean expression for the AI to turn into word problems. */
export function wordProblemSeeds(skillIds: SkillId[], seed: number, n = 2): WorksheetTask[] {
  const r = rng(seed * 7 + 3);
  const pool = [...skillIds, "frac-add-diff", "frac-mul"].filter(supportedSkill);
  const out: WorksheetTask[] = [];
  for (let guard = 0; out.length < n && guard < 60; guard++) {
    const skillId = pool[guard % pool.length];
    const t = GENERATORS[skillId](r);
    if (t.expr && !out.some((o) => o.expr === t.expr)) out.push({ ...t, skillId });
  }
  return out;
}

// ---------- B's generators (B3) where they fit a printed worksheet ----------

/** B's stems that only make sense next to the four choices, or answers not in simplest form. */
const B_NOT_FOR_PRINT = new Set<SkillId>(["frac-compare", "frac-mul"]);

/**
 * Worksheet drills: B's generator where it fits print, ours otherwise.
 * Same split as generateWorksheetTasks: the root (first skill) gets ~60%.
 */
export function buildWorksheetTasks(skillIds: SkillId[], count = 8, seed = 1): WorksheetTask[] {
  const skills = skillIds.filter((id) => (bGenerators[id] && !B_NOT_FOR_PRINT.has(id)) || supportedSkill(id));
  if (!skills.length) return [];
  const share = skills.length === 1 ? [count] : [Math.ceil(count * 0.6)];
  for (let i = 1; i < skills.length; i++) {
    const left = count - share.reduce((a, b) => a + b, 0);
    share.push(i === skills.length - 1 ? left : Math.max(1, Math.round(left / (skills.length - i))));
  }
  return skills.flatMap((id, i) => {
    if (bGenerators[id] && !B_NOT_FOR_PRINT.has(id)) {
      const seen = new Set<string>();
      return generateWorksheetItems([id], share[i] * 2, seed + i * 31)
        .filter((it) => !seen.has(it.stem) && seen.add(it.stem))
        .slice(0, share[i])
        .map((it) => ({ stem: it.stem, answer: it.answer, skillId: id }));
    }
    return generateWorksheetTasks([id], share[i], seed + i * 31);
  });
}
