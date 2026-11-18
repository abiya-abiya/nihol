// Validates everything in src/content. Run: npm run validate:content (tsx).
// Exit 1 with a readable list of problems; warnings do not fail.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import * as content from "../src/content/index";
import { subjects } from "../src/content/subjects/index";
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
const TutorExample = z.object({ misconceptionId: id, stem: text, correctText: text, chosenText: text, idealExplanation: text });

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

// ---------- tutor examples ----------
const examples = load("tutor-examples.json", z.array(TutorExample));
for (const t of examples ?? []) {
  const w = `tutor-examples.json ${t.misconceptionId}`;
  if (!miscIds.has(t.misconceptionId)) err(w, `unknown misconceptionId`);
  const words = t.idealExplanation.split(/\s+/).filter((x) => /[\p{L}\d]/u.test(x)).length;
  if (words > 90) err(w, `idealExplanation has ${words} words (max 90)`);
  for (const f of [t.stem, t.correctText, t.chosenText, t.idealExplanation]) checkMarkup(w, f);
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

// ---------- v2 subjects: src/content/subjects/<id>/{subject,questions}.json ----------
const Subject = z.object({
  meta: z.object({ id, name: text, short: text, color: z.string().regex(/^#[0-9a-f]{6}$/i), icon: text, order: z.number(), description: text }),
  graph: Graph,
  materials: z.array(z.object({ lessonId: id, fileName: text, pages: z.number().int().positive(), summary: text })),
});
// old alphabet left in Uzbek text (English subject keeps sh/ch and apostrophes)
const OLD_ALPHABET = /[oOgG]['ʻ‘’`]|sh|ch|Sh|Ch|SH|CH|'/;
const subjectDirs = readdirSync(join(ROOT, "subjects"), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
for (const sid of subjectDirs) {
  const s = load(`subjects/${sid}/subject.json`, Subject);
  const qs = load(`subjects/${sid}/questions.json`, z.array(Question));
  if (!s || !qs) continue;
  const w = `subjects/${sid}`;
  if (s.meta.id !== sid) err(w, `meta.id "${s.meta.id}" does not match folder`);
  const lessons = new Set(s.graph.skills.map((l) => l.id));
  unique(w, [...lessons], "lesson id");
  for (const l of s.graph.skills) {
    if (!new RegExp(`^${sid}-0[1-9]$`).test(l.id)) err(w, `lesson id "${l.id}" must be "${sid}-NN"`);
    if (l.short.length > 18) err(w, `${l.id} short "${l.short}" is ${l.short.length} chars (max 18)`);
    for (const p of l.prerequisites) if (!lessons.has(p)) err(w, `${l.id}: unknown prerequisite "${p}"`);
    // lessons are listed in order, so a prerequisite must come earlier (no cycles)
    for (const p of l.prerequisites) if (p >= l.id) err(w, `${l.id}: prerequisite "${p}" is not an earlier lesson`);
  }
  for (const e of s.graph.entrySkills) if (!lessons.has(e)) err(w, `entrySkills: unknown lesson "${e}"`);
  for (const m of s.materials) if (!lessons.has(m.lessonId)) err(w, `materials: unknown lesson "${m.lessonId}"`);
  unique(w, qs.map((q) => q.id), "question id");
  for (const lid of lessons) {
    const n = qs.filter((q) => q.skillId === lid).length;
    if (n !== 5) err(w, `${lid} has ${n} questions (need 5)`);
  }
  for (const q of qs) {
    const qw = `${w} ${q.id}`;
    if (!lessons.has(q.skillId)) err(qw, `unknown lesson "${q.skillId}"`);
    if (!new RegExp(`^${q.skillId}-\\d{2}$`).test(q.id)) err(qw, `id must be "${q.skillId}-NN"`);
    if (q.choices.map((c) => c.id).join("") !== "abcd") err(qw, `choice ids must be a, b, c, d`);
    if (!q.choices.some((c) => c.id === q.correct)) err(qw, `correct "${q.correct}" is not a choice`);
    unique(qw, q.choices.map((c) => c.text.trim()), "choice text");
  }
  if (sid !== "ingliz-tili") {
    const texts = [s.meta.name, s.meta.description, s.graph.topic, ...s.graph.skills.flatMap((l) => [l.title, l.short, l.description]),
      ...s.materials.flatMap((m) => [m.fileName, m.summary]), ...qs.flatMap((q) => [q.stem, q.explanation, q.hint, ...q.choices.map((c) => c.text)])];
    for (const t of texts) if (OLD_ALPHABET.test(t)) err(w, `old alphabet in "${t}"`);
  }
}
{
  const ids = subjects.map((s) => s.meta.id);
  if (ids[0] !== "matematika") err("subjects/index.ts", `Matematika must be first (got ${ids[0]})`);
  for (const sid of subjectDirs) if (!ids.includes(sid)) err("subjects/index.ts", `subject "${sid}" is not exported`);
}

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
