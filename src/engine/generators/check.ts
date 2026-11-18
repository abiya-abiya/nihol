// Self-check for the generators, run by scripts/validate-content.ts.
// Re-solves every generated question from its stem text and checks the choices.
import type { Question } from "@/lib/types";
import { add, div, eq, gcd, lcm, mul, parseValue, simplify, sub, toMarkup, type Fr } from "./fraction";
import { generators } from "./index";

const TOKEN = /\[\[(?:(\d+) )?(\d+)\/(\d+)\]\]|(\d+)/g;
function tokens(stem: string): Fr[] {
  return [...stem.matchAll(TOKEN)].map((m) =>
    m[4] !== undefined ? { n: Number(m[4]), d: 1 } : { n: Number(m[1] ?? 0) * Number(m[3]) + Number(m[2]), d: Number(m[3]) },
  );
}
const OPS: Record<string, (a: Fr, b: Fr) => Fr> = { "+": add, "−": sub, "·": mul, ":": div };

/** The expected answer: a value to match by equality, or an exact text. */
function solve(q: Question): { value?: Fr; text?: string } {
  const t = tokens(q.stem);
  const whole = (i: number) => t[i].n / t[i].d;
  switch (q.skillId) {
    case "nat-mul":
      return { value: { n: whole(0) * whole(1), d: 1 } };
    case "nat-div":
      return { text: `bölinma ${Math.floor(whole(0) / whole(1))}, qoldiq ${whole(0) % whole(1)}` };
    case "gcd":
      return { value: { n: gcd(whole(0), whole(1)), d: 1 } };
    case "lcm":
      return { value: { n: lcm(whole(0), whole(1)), d: 1 } };
    case "frac-equiv": {
      const D = whole(1);
      return { text: `[[${(t[0].n * D) / t[0].d}/${D}]]` };
    }
    case "frac-simplify":
      return { text: toMarkup(simplify(t[0])) };
    case "frac-common-denom": {
      if (q.stem.includes("umumiy maxraji")) return { value: { n: lcm(t[0].d, t[1].d), d: 1 } };
      const L = whole(1);
      return { text: `[[${(t[0].n * L) / t[0].d}/${L}]]` };
    }
    case "frac-compare": {
      const vals = q.choices.map((c) => parseValue(c.text)!);
      return { value: vals.reduce((m, v) => (v.n * m.d > m.n * v.d ? v : m)) };
    }
    case "mixed-numbers":
      return { value: t[0] };
    default: {
      const op = q.stem.match(/\]\] ([+−·:]) |\d ([+−·:]) /);
      const sym = op?.[1] ?? op?.[2];
      if (!sym) throw new Error("cannot find the operation in the stem");
      return { value: OPS[sym](t[0], t[1]) };
    }
  }
}

const MARKUP_OK = (s: string) =>
  [...s.matchAll(/\[\[([^\[\]]*)\]\]/g)].every((m) => /^(\d+ )?\d+\/[1-9]\d*$/.test(m[1])) &&
  !s.replace(/\[\[[^\[\]]*\]\]/g, "").match(/\[\[|\]\]/) &&
  (s.match(/\*\*/g) ?? []).length % 2 === 0;

export function checkGenerators(misconceptionIds: Set<string>, seeds = 300): string[] {
  const errors: string[] = [];
  for (const [skillId, gen] of Object.entries(generators)) {
    for (let seed = 1; seed <= seeds; seed++) {
      const where = `generator ${skillId} seed ${seed}`;
      let q: Question;
      try {
        q = gen!(seed);
      } catch (e) {
        errors.push(`${where}: threw ${(e as Error).message}`);
        continue;
      }
      const bad = (msg: string) => errors.push(`${where}: ${msg} | ${q.stem} | ${q.choices.map((c) => c.text).join(" ; ")}`);
      if (q.id !== `${skillId}-g-${seed}` || q.skillId !== skillId || q.source !== "generated") bad("wrong id/skillId/source");
      if (q.choices.map((c) => c.id).join("") !== "abcd") bad("choice ids must be a, b, c, d");
      if (new Set(q.choices.map((c) => c.text)).size !== 4) bad("duplicate choice text");
      const vals = q.choices.map((c) => parseValue(c.text));
      vals.forEach((v, i) => {
        if (v && vals.some((w, j) => j < i && w && eq(v, w))) bad("two choices are equal in value");
      });
      for (const c of q.choices) {
        if (c.misconceptionId && !misconceptionIds.has(c.misconceptionId)) bad(`unknown misconception ${c.misconceptionId}`);
        if (c.misconceptionId && c.id === q.correct) bad("correct choice is tagged");
      }
      for (const s of [q.stem, q.explanation, q.hint, ...q.choices.map((c) => c.text)]) if (!MARKUP_OK(s)) bad(`bad markup in "${s}"`);
      let exp: { value?: Fr; text?: string };
      try {
        exp = solve(q);
      } catch (e) {
        bad(`cannot re-solve: ${(e as Error).message}`);
        continue;
      }
      const hits = q.choices.filter((c, i) =>
        exp.text !== undefined ? c.text === exp.text : vals[i] !== null && eq(vals[i]!, exp.value!),
      );
      if (hits.length !== 1) bad(`${hits.length} choices match the re-solved answer`);
      else if (hits[0].id !== q.correct) bad(`marked ${q.correct} but the answer is ${hits[0].id}`);
    }
  }
  return errors;
}
