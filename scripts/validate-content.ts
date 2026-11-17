// Validates everything in src/content. Run: npm run validate:content (tsx).
// Exit 1 with a readable list of problems; warnings do not fail.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import * as content from "../src/content/index";
import { checkGenerators } from "../src/engine/generators/check";

const ROOT = join(process.cwd(), "src", "content"); // npm runs scripts from the repo root
const errors: string[] = [];
const warnings: string[] = [];
const err = (where: string, msg: string) => errors.push(`${where}: ${msg}`);

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be kebab-case");
const text = z.string().min(1);
const choiceId = z.enum(["a", "b", "c", "d"]);

const Skill = z.object({
  id,
  title: text,
  short: text,
  grade: z.union([z.literal(5), z.literal(6)]),
  prerequisites: z.array(id),
  description: text,
});
const Graph = z.object({ subject: text, topic: text, skills: z.array(Skill), entrySkills: z.array(id) });
const Misconception = z.object({ id, skillIds: z.array(id).min(1), title: text, example: text, remedy: text });
const Choice = z.object({ id: choiceId, text, misconceptionId: id.optional() });
const Question = z.object({
  id: text,
  skillId: id,
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  stem: text,
  choices: z.array(Choice).length(4),
  correct: choiceId,
  explanation: text,
  hint: text,
  source: z.enum(["bank", "generated", "ai"]),
});
const Glossary = z.object({ term: text, definition: text });

function load<T>(file: string, schema: z.ZodType<T>): T | null {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(join(ROOT, file), "utf8"));
  } catch (e) {
    err(file, `cannot read JSON (${(e as Error).message})`);
    return null;
  }
  const res = schema.safeParse(raw);
  if (!res.success) {
    for (const i of res.error.issues) err(file, `${i.path.join(".") || "(root)"}: ${i.message}`);
    return null;
  }
  return res.data;
}

function unique(where: string, ids: string[], what: string) {
  const seen = new Set<string>();
  for (const x of ids) {
    if (seen.has(x)) err(where, `duplicate ${what} "${x}"`);
    seen.add(x);
  }
}

// Markup: only [[n/d]] / [[w n/d]] inside brackets, balanced [[ ]] and **.
function checkMarkup(where: string, s: string) {
  const inner = /\[\[([^\[\]]*)\]\]/g;
  for (const m of s.matchAll(inner)) {
    if (!/^(\d+ )?\d+\/[1-9]\d*$/.test(m[1])) err(where, `bad fraction markup "[[${m[1]}]]"`);
  }
  const rest = s.replace(inner, "");
  if (rest.includes("[[") || rest.includes("]]")) err(where, `unbalanced [[ ]] in "${s}"`);
  if ((s.match(/\*\*/g) ?? []).length % 2) err(where, `unbalanced ** in "${s}"`);
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
// Value signature of a choice made only of numbers/fractions joined by "va" or ","; null otherwise.
function valueSig(s: string): string | null {
  const parts: string[] = [];
  const rest = s
    .replace(/\[\[(?:(\d+) )?(\d+)\/(\d+)\]\]|\b\d+\b/g, (tok, w, n, d) => {
      let num: number, den: number;
      if (d === undefined) [num, den] = [Number(tok), 1];
      else [num, den] = [Number(w ?? 0) * Number(d) + Number(n), Number(d)];
      const g = gcd(num, den) || 1;
      parts.push(`${num / g}/${den / g}`);
      return "";
    })
    .replace(/\bva\b|,/g, "")
    .trim();
  return rest === "" && parts.length ? parts.join("|") : null;
}

// ---------- graph ----------
const graph = load("graph.json", Graph);
const skillIds = new Set(graph?.skills.map((s) => s.id) ?? []);
if (graph) {
  unique("graph.json", graph.skills.map((s) => s.id), "skill id");
  for (const s of graph.skills) {
    const w = `graph.json ${s.id}`;
    if (s.short.length > 18) err(w, `short "${s.short}" is ${s.short.length} chars (max 18)`);
    for (const p of s.prerequisites) if (!skillIds.has(p)) err(w, `unknown prerequisite "${p}"`);
    for (const f of [s.title, s.short, s.description]) checkMarkup(w, f);
  }
  for (const e of graph.entrySkills) if (!skillIds.has(e)) err("graph.json entrySkills", `unknown skill "${e}"`);
  // acyclic: DFS with colours
  const byId = new Map(graph.skills.map((s) => [s.id, s]));
  const state = new Map<string, 1 | 2>();
  const visit = (sid: string, path: string[]) => {
    if (state.get(sid) === 2) return;
    if (state.get(sid) === 1) return err("graph.json", `cycle: ${[...path, sid].join(" -> ")}`);
    state.set(sid, 1);
    for (const p of byId.get(sid)?.prerequisites ?? []) visit(p, [...path, sid]);
    state.set(sid, 2);
  };
  for (const s of graph.skills) visit(s.id, []);
}

// ---------- misconceptions ----------
const miscs = load("misconceptions.json", z.array(Misconception));
const miscIds = new Set(miscs?.map((m) => m.id) ?? []);
if (miscs) {
  unique("misconceptions.json", miscs.map((m) => m.id), "misconception id");
  for (const m of miscs) {
    const w = `misconceptions.json ${m.id}`;
    for (const s of m.skillIds) if (!skillIds.has(s)) err(w, `unknown skillId "${s}"`);
    for (const f of [m.title, m.example, m.remedy]) checkMarkup(w, f);
  }
}

// ---------- glossary ----------
const glossary = load("glossary.json", z.array(Glossary));
if (glossary) {
  unique("glossary.json", glossary.map((g) => g.term), "term");
  for (const g of glossary) checkMarkup(`glossary.json ${g.term}`, g.definition);
}

// ---------- questions ----------
const qFiles = readdirSync(join(ROOT, "questions")).filter((f) => f.endsWith(".json"));
const allQuestions: { file: string; q: z.infer<typeof Question> }[] = [];
for (const file of qFiles) {
  const raw = load(`questions/${file}`, z.array(z.unknown())) ?? [];
  const fileSkill = file.replace(/\.json$/, "");
  if (!skillIds.has(fileSkill)) err(`questions/${file}`, `file name is not a skill id`);
  for (const [i, item] of raw.entries()) {
    // parse one question at a time so one bad item does not hide the others' problems
    const res = Question.safeParse(item);
    if (!res.success) {
      for (const is of res.error.issues) err(`questions/${file} [${i}]`, `${is.path.join(".")}: ${is.message}`);
      continue;
    }
    const q = res.data;
    allQuestions.push({ file, q });
    const w = `questions/${file} ${q.id}`;
    if (q.skillId !== fileSkill) err(w, `skillId "${q.skillId}" does not match file name`);
    if (!new RegExp(`^${q.skillId}-(\\d{2}|g-\\d+)$`).test(q.id)) err(w, `id must be "${q.skillId}-NN"`);
    const ids = q.choices.map((c) => c.id).sort().join("");
    if (ids !== "abcd") err(w, `choice ids must be a, b, c, d (got ${ids})`);
    if (!q.choices.some((c) => c.id === q.correct)) err(w, `correct "${q.correct}" is not a choice`);
    unique(w, q.choices.map((c) => c.text.trim()), "choice text");
    const sigs = q.choices.map((c) => valueSig(c.text));
    sigs.forEach((s, i) => {
      const j = sigs.indexOf(s);
      if (s && j < i) err(w, `choices ${q.choices[j].id} and ${q.choices[i].id} are equal in value`);
    });
    for (const c of q.choices) {
      if (c.misconceptionId && !miscIds.has(c.misconceptionId))
        err(w, `choice ${c.id}: unknown misconceptionId "${c.misconceptionId}"`);
      if (c.misconceptionId && c.id === q.correct) err(w, `correct choice ${c.id} has a misconceptionId`);
    }
    for (const f of [q.stem, q.explanation, q.hint, ...q.choices.map((c) => c.text)]) checkMarkup(w, f);
  }
}
unique("questions", allQuestions.map((x) => x.q.id), "question id");
for (const sid of skillIds) {
  const qs = allQuestions.filter((x) => x.q.skillId === sid).map((x) => x.q);
  if (qs.length < 4) warnings.push(`${sid}: only ${qs.length} question(s)`);
  else if (!qs.some((q) => q.difficulty === 2)) warnings.push(`${sid}: no difficulty-2 question`);
}

// ---------- generators: seeds 1..300 per skill, re-solved from the stem ----------
for (const e of checkGenerators(miscIds)) errors.push(e);

// ---------- loader (src/content/index.ts) imports every file ----------
if (content.questions.length !== allQuestions.length)
  err("src/content/index.ts", `exports ${content.questions.length} questions, files on disk have ${allQuestions.length} (missing import?)`);

// ---------- report ----------
for (const w of warnings) console.warn(`warn  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error ${e}`);
  console.error(`\ncontent: ${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(1);
}
console.log(
  `content ok: ${skillIds.size} skills, ${miscIds.size} misconceptions, ${allQuestions.length} questions, ` +
    `${glossary?.length ?? 0} glossary terms, generators ok (${warnings.length} warning(s))`,
);
