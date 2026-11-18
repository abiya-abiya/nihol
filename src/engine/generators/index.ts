// Deterministic question generators: same (skillId, seed) -> same question.
// Correct answers come from fraction.ts; wrong choices apply a misconception rule to the same numbers.
import type { ChoiceId, MisconceptionId, Question, QuestionGenerator, SkillId } from "@/lib/types";
import { add, div, eq, gcd, lcm, mul, simplify, sub, toMarkup as M, type Fr } from "./fraction";
import { int, mulberry32, pick, shuffle, type Rng } from "./rng";

interface Cand {
  text: string;
  /** numeric value, used to keep choices distinct in value; omit for text answers */
  value?: Fr;
  misconceptionId?: MisconceptionId;
}

const fr = (n: number, d = 1): Fr => ({ n, d });
const num = (n: number, misconceptionId?: MisconceptionId): Cand => ({ text: String(n), value: fr(n), misconceptionId });
/** fraction shown as written (not simplified) */
const frac = (n: number, d: number, misconceptionId?: MisconceptionId): Cand => ({
  text: M(fr(n, d)),
  value: fr(n, d),
  misconceptionId,
});
const val = (f: Fr, misconceptionId?: MisconceptionId, mixed = false): Cand => ({
  text: M(simplify(f), { mixed }),
  value: f,
  misconceptionId,
});

/** Keeps the first 3 wrong candidates that differ from the answer and each other (by text and by value). */
function build(
  skillId: SkillId,
  seed: number,
  rng: Rng,
  stem: string,
  correct: Cand,
  wrong: Cand[],
  explanation: string,
  hint: string,
): Question {
  const chosen: Cand[] = [correct];
  // untagged near-miss values as a last resort, so small numbers never run out of distinct choices
  const v = correct.value;
  const nearby = v
    ? [1, 2, 3, 4, 5]
        .flatMap((k) => [v.n + k, v.n - k])
        .filter((n) => n > 0)
        .map((n) => frac(n, v.d))
    : [];
  for (const w of [...wrong, ...nearby]) {
    if (chosen.length === 4) break;
    if (w.value && (w.value.n <= 0 || w.value.d <= 0)) continue;
    const clash = chosen.some(
      (c) => c.text === w.text || (c.value && w.value && eq(c.value, w.value)),
    );
    if (!clash) chosen.push(w);
  }
  if (chosen.length < 4) throw new Error(`${skillId} seed ${seed}: not enough distinct choices`);
  const ids: ChoiceId[] = ["a", "b", "c", "d"];
  const order = shuffle(rng, chosen);
  const choices = order.map((c, i) => ({
    id: ids[i],
    text: c.text,
    ...(c.misconceptionId ? { misconceptionId: c.misconceptionId } : {}),
  }));
  return {
    id: `${skillId}-g-${seed}`,
    skillId,
    difficulty: 2,
    stem,
    choices,
    correct: ids[order.indexOf(correct)],
    explanation,
    hint,
    source: "generated",
  };
}

const divisors = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((k) => n % k === 0);
/** two distinct numbers from [lo, hi] with gcd 1 */
function coprimePair(rng: Rng, lo: number, hi: number): [number, number] {
  for (;;) {
    const x = int(rng, lo, hi);
    const y = int(rng, lo, hi);
    if (x !== y && gcd(x, y) === 1) return [x, y];
  }
}
/** proper fraction n/d in lowest terms */
function proper(rng: Rng, dLo: number, dHi: number): Fr {
  for (;;) {
    const d = int(rng, dLo, dHi);
    const n = int(rng, 1, d - 1);
    if (gcd(n, d) === 1) return fr(n, d);
  }
}
const F = (f: Fr) => M(f);

// ---------- generators ----------

const natMul = (seed: number): Question => {
  const rng = mulberry32(seed);
  let a = int(rng, 12, 49);
  if (a % 10 === 0) a += 1;
  const b = int(rng, 3, 9);
  const c = a * b;
  const units = (a % 10) * b;
  const tens = Math.floor(a / 10) * b;
  return build(
    "nat-mul",
    seed,
    rng,
    `Hisobla: ${a} · ${b}`,
    num(c),
    [
      num(tens * 10 + (units % 10), "carry-forgot"),
      num(c + 10, "times-table"),
      num(a + b),
      num(c - 10, "times-table"),
      num(c + 1),
    ],
    `Birliklar: ${a % 10} · ${b} = ${units}. Önliklar: ${Math.floor(a / 10)} · ${b} = ${tens}, yaʼni ${tens * 10}. Qöşamiz: ${tens * 10} + ${units} = ${c}.`,
    `${a} ni önliklar va birliklarga ajrat: ${a - (a % 10)} + ${a % 10}.`,
  );
};

const natDiv = (seed: number): Question => {
  const rng = mulberry32(seed);
  const b = int(rng, 3, 9);
  const q = int(rng, 3, 12);
  const r = int(rng, 1, b - 1);
  const n = b * q + r;
  const t = (qq: number, rr: number, m?: MisconceptionId): Cand => ({
    text: `bölinma ${qq}, qoldiq ${rr}`,
    misconceptionId: m,
  });
  return build(
    "nat-div",
    seed,
    rng,
    `${n} ni ${b} ga qoldiqli böl. Bölinma va qoldiq neçaga teng?`,
    t(q, r),
    [
      t(q - 1, r + b, "remainder-error"),
      t(q + 1, r, "remainder-error"),
      t(q, r + 1, "remainder-error"),
      t(q, r - 1, "remainder-error"),
      t(q - 1, r, "remainder-error"),
    ],
    `${b} · ${q} = ${b * q}, bu ${n} dan oşmaydi. ${b} · ${q + 1} = ${b * (q + 1)} esa oşib ketadi. Qoldiq: ${n} − ${b * q} = ${r}. Tekşiruv: ${b} · ${q} + ${r} = ${n}.`,
    `Qoldiq doim böluvçidan, yaʼni ${b} dan kiçik bölişi kerak.`,
  );
};

const gcdGen = (seed: number): Question => {
  const rng = mulberry32(seed);
  const g = int(rng, 2, 6);
  const [x, y] = coprimePair(rng, 2, 7);
  const a = g * x;
  const b = g * y;
  const smaller = divisors(g).filter((k) => k > 1 && k < g);
  return build(
    "gcd",
    seed,
    rng,
    `EKUB(${a}; ${b}) ni top.`,
    num(g),
    [
      num(lcm(a, b), "lcm-gcd-swap"),
      num(Math.min(a, b)),
      num(smaller.length ? smaller[smaller.length - 1] : 1),
      num(g + 1),
      num(a + b),
    ],
    `${a} ning böluvçilari: ${divisors(a).join(", ")}. ${b} ning böluvçilari: ${divisors(b).join(", ")}. Umumiylarining eng kattasi ${g}. Demak, EKUB(${a}; ${b}) = ${g}.`,
    `Ikkala sonning böluvçilarini yoz va umumiylarining eng kattasini tanla.`,
  );
};

const lcmGen = (seed: number): Question => {
  const rng = mulberry32(seed);
  const g = int(rng, 2, 4);
  const [x, y] = coprimePair(rng, 2, 5);
  const a = g * x;
  const b = g * y;
  const L = lcm(a, b);
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  const multiples = Array.from({ length: L / big }, (_, i) => big * (i + 1));
  return build(
    "lcm",
    seed,
    rng,
    `EKUK(${a}; ${b}) ni top.`,
    num(L),
    [num(gcd(a, b), "lcm-gcd-swap"), num(a * b, "lcm-is-product"), num(a + b), num(big), num(2 * L)],
    `${big} ning karralilari: ${multiples.join(", ")}. ${L} soni ${small} ga ham bölinadi: ${L} : ${small} = ${L / small}. Demak, EKUK(${a}; ${b}) = ${L}.`,
    `${big} ning karralilarini ketma-ket yoz va ulardan qaysi biri ${small} ga bölinişini tekşir.`,
  );
};

const fracEquiv = (seed: number): Question => {
  const rng = mulberry32(seed);
  const { n, d } = proper(rng, 2, 6);
  const k = int(rng, 2, 4);
  const D = d * k;
  return build(
    "frac-equiv",
    seed,
    rng,
    `[[${n}/${d}]] ga teng, maxraji ${D} bölgan kasrni top.`,
    frac(n * k, D),
    [
      frac(n, D, "equiv-one-side"),
      frac(n + D - d, D),
      frac(n * k + 1, D),
      frac(n * k - 1, D),
      frac(n * k + 2, D),
    ],
    `${D} : ${d} = ${k}, demak maxraj ${k} marta oşdi. Suratni ham ${k} ga köpaytiramiz: ${n} · ${k} = ${n * k}. Javob: [[${n * k}/${D}]].`,
    `Maxraj neça marta oşganini top, suratni ham şunça marta oşir.`,
  );
};

const fracSimplify = (seed: number): Question => {
  const rng = mulberry32(seed);
  const { n: p, d: q } = proper(rng, 3, 9);
  const k = int(rng, 2, 5);
  const [x, y] = [p * k, q * k];
  return build(
    "frac-simplify",
    seed,
    rng,
    `[[${x}/${y}]] kasrini qisqarmas kasr körinişida yoz.`,
    frac(p, q),
    [
      frac(x - 1, y - 1, "simplify-subtract"),
      frac(p, y, "equiv-one-side"),
      frac(1, y - x + 1, "simplify-subtract"),
      frac(p + 1, q),
      frac(p, q + 1),
    ],
    `EKUB(${x}; ${y}) = ${k}. Surat va maxrajni ${k} ga bölamiz: ${x} : ${k} = ${p}, ${y} : ${k} = ${q}. Javob: [[${p}/${q}]].`,
    `Surat va maxrajni bir xil songa böl, ayirma.`,
  );
};

/** two denominators in 2..12 sharing a factor, EKUK <= 24 */
function denomPair(rng: Rng): [number, number] {
  for (;;) {
    const b = int(rng, 2, 12);
    const d = int(rng, 2, 12);
    if (b !== d && gcd(b, d) > 1 && lcm(b, d) <= 24) return [b, d];
  }
}

const fracCommonDenom = (seed: number): Question => {
  const rng = mulberry32(seed);
  const [b, d] = denomPair(rng);
  const L = lcm(b, d);
  const a = proper(rng, b, b).n;
  const c = proper(rng, d, d).n;
  if (rng() < 0.5) {
    return build(
      "frac-common-denom",
      seed,
      rng,
      `[[${a}/${b}]] va [[${c}/${d}]] kasrlarining eng kiçik umumiy maxraji neçaga teng?`,
      num(L),
      [num(b * d, "lcm-is-product"), num(gcd(b, d), "lcm-gcd-swap"), num(b + d), num(2 * L), num(Math.max(b, d) + 1)],
      `Eng kiçik umumiy maxraj maxrajlarning EKUKi. ${L} soni ${b} ga ham, ${d} ga ham bölinadi va undan kiçik bunday son yöq. Demak, EKUK(${b}; ${d}) = ${L}.`,
      `Şunday eng kiçik sonni top: u ${b} ga ham, ${d} ga ham bölinsin.`,
    );
  }
  // convert the fraction whose denominator is smaller than L
  const [n0, d0] = L !== b ? [a, b] : [c, d];
  const f = L / d0;
  return build(
    "frac-common-denom",
    seed,
    rng,
    `[[${n0}/${d0}]] kasrini maxraji ${L} bölgan kasr körinişida yoz.`,
    frac(n0 * f, L),
    [
      frac(n0, L, "common-denom-keep-num"),
      frac(n0 + L - d0, L),
      frac(f, L),
      frac(n0 * f + 1, L),
      frac(n0 * f - 1, L),
    ],
    `${L} : ${d0} = ${f}, demak qöşimça köpaytuvçi ${f}. Suratni ham ${f} ga köpaytiramiz: ${n0} · ${f} = ${n0 * f}. Javob: [[${n0 * f}/${L}]].`,
    `Avval qöşimça köpaytuvçini top: ${L} ni ${d0} ga böl.`,
  );
};

const COMPARE_DENOMS = [
  [2, 3, 4, 6, 12],
  [2, 4, 8],
  [2, 5, 10],
  [3, 6, 9],
  [2, 3, 6],
];
const fracCompare = (seed: number): Question => {
  const rng = mulberry32(seed);
  const set = pick(rng, COMPARE_DENOMS);
  const fs: Fr[] = [];
  while (fs.length < 4) {
    const d = pick(rng, set);
    const n = int(rng, 1, d - 1);
    const f = fr(n, d);
    if (gcd(n, d) === 1 && !fs.some((x) => eq(x, f))) fs.push(f);
  }
  const L = fs.reduce((acc, f) => lcm(acc, f.d), 1);
  const best = fs.reduce((m, f) => (f.n * m.d > m.n * f.d ? f : m));
  const maxDen = Math.max(...fs.map((f) => f.d));
  const wrong = fs.filter((f) => f !== best);
  const tagged = wrong.find((f) => f.d === maxDen);
  return build(
    "frac-compare",
    seed,
    rng,
    `Qaysi kasr eng katta?`,
    frac(best.n, best.d),
    wrong.map((f) => frac(f.n, f.d, f === tagged ? "bigger-den-bigger" : undefined)),
    `Umumiy maxraj ${L}: ${fs.map((f) => `[[${f.n}/${f.d}]] = [[${(f.n * L) / f.d}/${L}]]`).join(", ")}. Eng katta surat ${(best.n * L) / best.d}, demak eng katta kasr [[${best.n}/${best.d}]].`,
    `Kasrlarni umumiy maxrajga keltir, keyin suratlarni soliştir.`,
  );
};

const fracAddSame = (seed: number): Question => {
  const rng = mulberry32(seed);
  const d = int(rng, 5, 12);
  const a = int(rng, 1, d - 1);
  let b = int(rng, 1, d - 1);
  if (b === a) b = a === 1 ? 2 : a - 1;
  return build(
    "frac-add-same",
    seed,
    rng,
    `Hisobla: [[${a}/${d}]] + [[${b}/${d}]]`,
    frac(a + b, d),
    [
      frac(a + b, 2 * d, "add-num-den"),
      frac(a * b, d),
      frac(Math.abs(a - b), d),
      frac(a + b + 1, d),
      frac(a + b, d + 1),
    ],
    `Maxrajlar bir xil, şuning uçun suratlarni qöşamiz: ${a} + ${b} = ${a + b}. Maxraj özgarmaydi: [[${a + b}/${d}]].`,
    `Maxrajlar teng bölsa, faqat suratlar bilan amal bajariladi.`,
  );
};

const fracAddDiff = (seed: number): Question => {
  const rng = mulberry32(seed);
  const [b, d] = denomPair(rng);
  const L = lcm(b, d);
  const a = proper(rng, b, b).n;
  const c = proper(rng, d, d).n;
  const [fa, fc] = [L / b, L / d];
  const S = a * fa + c * fc;
  const sum = add(fr(a, b), fr(c, d));
  const simplified = sum.n !== S || sum.d !== L ? ` = ${F(sum)}` : "";
  return build(
    "frac-add-diff",
    seed,
    rng,
    `Hisobla: [[${a}/${b}]] + [[${c}/${d}]]`,
    val(sum),
    [
      frac(a + c, b + d, "add-num-den"),
      frac(a + c, L, "common-denom-keep-num"),
      frac(S, b * d),
      frac(S + 1, L),
      frac(S - 1, L),
    ],
    `EKUK(${b}; ${d}) = ${L}. [[${a}/${b}]] = [[${a * fa}/${L}]], [[${c}/${d}]] = [[${c * fc}/${L}]]. Suratlarni qöşamiz: [[${a * fa}/${L}]] + [[${c * fc}/${L}]] = [[${S}/${L}]]${simplified}.`,
    `Maxrajlarni qöşib bölmaydi. Avval ikkala kasrni bir xil maxrajga keltir.`,
  );
};

const mixedNumbers = (seed: number): Question => {
  const rng = mulberry32(seed);
  const w = int(rng, 1, 3);
  const { n, d } = proper(rng, 2, 9);
  return build(
    "mixed-numbers",
    seed,
    rng,
    `[[${w} ${n}/${d}]] ni notöğri kasrga aylantir.`,
    frac(w * d + n, d),
    [
      frac(w + n, d, "mixed-convert"),
      frac(w * 10 + n, d, "mixed-convert"),
      frac(w * d, d),
      frac(w * n + d, d),
      frac(w * d + n + 1, d),
    ],
    `Butun qismni maxrajga köpaytiramiz va suratni qöşamiz: ${w} · ${d} + ${n} = ${w * d + n}. Maxraj özgarmaydi: [[${w} ${n}/${d}]] = [[${w * d + n}/${d}]].`,
    `${w} butunda neçta [[1/${d}]] bor? Unga yana ${n} tasini qöş.`,
  );
};

const mixedAdd = (seed: number): Question => {
  const rng = mulberry32(seed);
  const d = int(rng, 3, 9);
  const n1 = int(rng, 1, d - 2);
  const n2 = int(rng, n1 + 1, d - 1);
  const w1 = int(rng, 2, 3);
  const w2 = int(rng, 1, w1 - 1);
  const A = fr(w1 * d + n1, d);
  const B = fr(w2 * d + n2, d);
  const diff = sub(A, B);
  const wr = w1 - 1 - w2;
  const raw = wr > 0 ? `[[${wr} ${d + n1 - n2}/${d}]]` : `[[${d + n1 - n2}/${d}]]`;
  const rawText = M(simplify(diff), { mixed: true });
  return build(
    "mixed-add",
    seed,
    rng,
    `Hisobla: [[${w1} ${n1}/${d}]] − [[${w2} ${n2}/${d}]]`,
    val(diff, undefined, true),
    [
      { text: `[[${w1 - w2} ${n2 - n1}/${d}]]`, value: fr((w1 - w2) * d + n2 - n1, d), misconceptionId: "mixed-borrow" },
      val(add(A, B), undefined, true),
      val(add(diff, fr(1)), undefined, true),
      val(add(diff, fr(1, d)), undefined, true),
    ],
    `[[${n1}/${d}]] dan [[${n2}/${d}]] ni ayirib bölmaydi. Butun qismdan bittasini olamiz: [[${w1} ${n1}/${d}]] = [[${w1 - 1} ${d + n1}/${d}]]. Endi ayiramiz: [[${w1 - 1} ${d + n1}/${d}]] − [[${w2} ${n2}/${d}]] = ${raw}${raw === rawText ? "" : ` = ${rawText}`}.`,
    `Kasr qism yetmasa, butun qismdan bitta butunni kasrga aylantir.`,
  );
};

const fracMul = (seed: number): Question => {
  const rng = mulberry32(seed);
  if (rng() < 0.5) {
    const k = int(rng, 2, 4);
    const { n: a, d: b } = proper(rng, 3, 9);
    return build(
      "frac-mul",
      seed,
      rng,
      `Hisobla: ${k} · [[${a}/${b}]]`,
      frac(k * a, b),
      [frac(k * a, k * b, "whole-times-both"), frac(a, k * b), frac(a + k, b), frac(k * a + 1, b), frac(k * a, b + 1)],
      `Natural songa köpaytirganda faqat surat köpaytiriladi: ${k} · ${a} = ${k * a}, maxraj ${b} qoladi. Javob: [[${k * a}/${b}]].`,
      `${k} · [[${a}/${b}]] bu [[${a}/${b}]] ni ${k} marta qöşiş demak.`,
    );
  }
  const b = int(rng, 3, 6);
  const a = int(rng, 1, b - 1);
  const c = int(rng, 1, b - 1);
  return build(
    "frac-mul",
    seed,
    rng,
    `Hisobla: [[${a}/${b}]] · [[${c}/${b}]]`,
    frac(a * c, b * b),
    [
      frac(a * c, b, "mul-common-denom"),
      frac(a + c, 2 * b),
      frac(a * c, 2 * b),
      frac(a * c + 1, b * b),
      frac(a + c, b * b),
    ],
    `Suratlar: ${a} · ${c} = ${a * c}. Maxrajlar: ${b} · ${b} = ${b * b}. Javob: [[${a * c}/${b * b}]]. Köpaytirişda maxrajlar bir xil bölsa ham köpaytiriladi.`,
    `Suratni suratga, maxrajni maxrajga köpaytir.`,
  );
};

const fracDiv = (seed: number): Question => {
  const rng = mulberry32(seed);
  let a: Fr, b: Fr, q: Fr;
  do {
    a = proper(rng, 2, 9);
    b = proper(rng, 2, 9);
    q = div(a, b);
  } while (eq(a, b) || q.n > 3 * q.d);
  const raw = fr(a.n * b.d, a.d * b.n);
  const tail = raw.n !== q.n || raw.d !== q.d ? ` = ${F(q)}` : "";
  return build(
    "frac-div",
    seed,
    rng,
    `Hisobla: [[${a.n}/${a.d}]] : [[${b.n}/${b.d}]]`,
    val(q),
    [
      val(mul(a, b), "div-no-flip"),
      val(mul(fr(a.d, a.n), b), "div-flip-first"),
      val(fr(q.d, q.n)),
      val(add(q, fr(1, q.d))),
      val(mul(q, fr(2))),
    ],
    `[[${b.n}/${b.d}]] ga teskari kasr [[${b.d}/${b.n}]]. Köpaytiramiz: [[${a.n}/${a.d}]] · [[${b.d}/${b.n}]] = ${F(raw)}${tail}.`,
    `Bölişni köpaytirişga almaştir: ikkinçi kasrni ağdar.`,
  );
};

export const generators: Partial<Record<SkillId, QuestionGenerator>> = {
  "nat-mul": natMul,
  "nat-div": natDiv,
  gcd: gcdGen,
  lcm: lcmGen,
  "frac-equiv": fracEquiv,
  "frac-simplify": fracSimplify,
  "frac-common-denom": fracCommonDenom,
  "frac-compare": fracCompare,
  "frac-add-same": fracAddSame,
  "frac-add-diff": fracAddDiff,
  "mixed-numbers": mixedNumbers,
  "mixed-add": mixedAdd,
  "frac-mul": fracMul,
  "frac-div": fracDiv,
};

export function generateQuestion(skillId: SkillId, seed: number): Question | null {
  return generators[skillId]?.(seed) ?? null;
}
