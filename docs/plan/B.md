# Role B — content, generators, math and Uzbek quality (20%)

> **For agentic workers:** execute task by task with superpowers:executing-plans
> (inline). Tick `- [ ]` boxes as you go and commit them with the work.

**Goal:** everything the student sees that is *math or Uzbek*: the skill
graph, misconceptions, the question bank, the glossary, deterministic
question generators, AI tutor examples, and the final content QA.

**Read first:** `CLAUDE.md`, `docs/plan/00-overview.md` §1, §5, §6
(content format, fixed skill and misconception ids, learner model),
`src/lib/types.ts`.

**Global constraints**
- Math must be 100% correct. Compute every answer twice (by hand and with
  the fraction utils / a quick script). One wrong fraction on stage costs the demo.
- Uzbek: Latin script, school terminology (surat, maxraj, EKUK, EKUB,
  qisqartirish, aralash son, to'g'ri/noto'g'ri kasr…), "sen" for the
  student. Short sentences. No Russian calques. Write `o'`, `g'` and the
  tutuq belgisi as `'` — the app normalises them.
- Markup only: `[[n/d]]`, `[[w n/d]]`, `**bold**`, `·` for ×, `:` for ÷.
- Every wrong choice should be *tempting for a reason*: tag it with the
  misconception it reveals. Untagged wrong choices only when no listed
  misconception fits.
- Ids are fixed (overview §5). You may add misconceptions; never rename ids.

**Review focus**
1. Two choices that are equal in value (e.g. [[2/4]] and [[1/2]]) — never allowed unless the question asks for simplest form and says so.
2. Stems that only make sense with a picture — rewrite as text.
3. Choices of very different lengths that give away the answer.
4. Difficulty-2 question of each entry and chain skill must work as the
   *single* diagnostic probe for that skill (the diagnostic asks only one).
5. Explanations that skip a step an 11-year-old needs.

---

### B1. Content skeleton + validator — target T+2h
**Needs:** nothing (JSON can be written before A1; run the validator once A1 lands).

**Files:** `src/content/graph.json`, `src/content/misconceptions.json`,
`src/content/glossary.json`, `src/content/questions/{lcm,frac-common-denom,frac-add-diff}.json`,
`src/content/index.ts`, `scripts/validate-content.ts`

**Interfaces (produces) — `src/content/index.ts`:**
```ts
export const graph: KnowledgeGraph
export const skillsById: Record<SkillId, Skill>
export const misconceptions: Misconception[]
export const misconceptionsById: Record<MisconceptionId, Misconception>
export const questions: Question[]
export const questionsBySkill: Record<SkillId, Question[]>
export const glossary: GlossaryEntry[]
export const tutorExamples: TutorExample[]   // [] until B4
```
Import each JSON file statically (one import per questions file) and cast to the types.

- [x] `graph.json`: all 17 skills from the overview table with real Uzbek
  `title`, `short` (≤ 18 chars), `grade`, `prerequisites` exactly as listed, `description`; `entrySkills` as listed.
- [x] `misconceptions.json`: all ids from the overview with `skillIds`, `title`, `example`, `remedy`.
- [x] `glossary.json`: ~25 terms used in 5–6 grade fractions (check terminology against the current
  Uzbek school textbooks; search the web: "6-sinf matematika darslik kasrlar", uzedu.uz / eduportal materials).
- [x] Questions for the demo chain skills `lcm`, `frac-common-denom`,
  `frac-add-diff` (5 each: difficulty 1, 2, 2, 3, 3), `source: "bank"`.
- [x] `scripts/validate-content.ts` (run with `tsx`): zod-validate every
  file against the types; exit 1 with a readable list of problems. Checks:
  unique ids; question id prefix = skillId; exactly 4 choices with ids
  a–d; `correct` exists; choice texts unique; every `skillId`,
  prerequisite, `entrySkills` item and `misconceptionId` exists; graph is
  acyclic; `short` ≤ 18 chars; markup balanced (`[[` / `]]`, `**`);
  warn (not fail) when a skill has < 4 questions or no difficulty-2 question.
- [ ] `npm run validate:content` passes. (Content validated with `npx tsx scripts/validate-content.ts`; tick after A1 adds the npm script.) Commit `content: skeleton + validator`, push.
  Tell the user: "B1 tayyor — A diagnostikani haqiqiy kontent bilan qura oladi."

### B2. Full question bank — target T+6h
**Needs:** B1.

- [x] 5 questions for every remaining skill (14 files), difficulties 1, 2, 2, 3, 3.
- [x] Word problems (`frac-word`) use everyday Uzbek contexts (non, paxta
  daladagi ish, kitob sahifalari, yo'l masofasi, sinfdagi o'quvchilar), and
  include at least two `part-of-rest` traps.
- [x] Every question: `explanation` (worked steps with the real numbers)
  and `hint` (nudge only).
- [x] Self-check pass: recompute every answer with a throwaway script or by
  hand; read every stem aloud for natural Uzbek. Validator green. Commit, push.

### B3. Deterministic generators — target T+10h
**Needs:** A1.

**Files:** `src/engine/generators/{fraction,rng,index,worksheet}.ts`, `src/engine/generators/check.ts` (run by the validator)

**Interfaces (produces):**
```ts
// fraction.ts
export interface Fr { n: number; d: number }               // always normalised: d > 0
export function gcd(a: number, b: number): number
export function lcm(a: number, b: number): number
export function simplify(f: Fr): Fr
export function add(a: Fr, b: Fr): Fr; export function sub(a: Fr, b: Fr): Fr
export function mul(a: Fr, b: Fr): Fr; export function div(a: Fr, b: Fr): Fr
export function eq(a: Fr, b: Fr): boolean                   // value equality
export function toMarkup(f: Fr, opts?: { mixed?: boolean }): string  // "[[3/4]]" / "[[2 1/3]]"
// rng.ts
export function mulberry32(seed: number): () => number
// index.ts
export const generators: Partial<Record<SkillId, QuestionGenerator>>
export function generateQuestion(skillId: SkillId, seed: number): Question | null
// worksheet.ts
export function generateWorksheetItems(skillIds: SkillId[], count: number, seed: number): Worksheet["items"]
```
Generators for: `nat-mul`, `nat-div`, `gcd`, `lcm`, `frac-equiv`,
`frac-simplify`, `frac-common-denom`, `frac-compare`, `frac-add-same`,
`frac-add-diff`, `mixed-numbers`, `mixed-add`, `frac-mul`, `frac-div`.
Each generated question: id `<skillId>-g-<seed>`, `source: "generated"`,
the correct choice computed with `fraction.ts`, distractors produced by
applying misconception rules to the same numbers (tagged), choices
shuffled with the seeded rng, distinct values, an `explanation` with the
real numbers, a `hint`. Keep numbers child-friendly (denominators ≤ 12,
results ≤ 3 wholes).

- [ ] `check.ts`: for each generator, seeds 1..300 → no duplicate choice values, exactly one choice equals the recomputed answer, markup valid. Called from `validate-content.ts`.
- [ ] Validator green, commit, push. Tell A and C: "B3 tayyor — `generateQuestion` va `generateWorksheetItems` ishlatsa bo'ladi."

### B4. AI tutor quality — target T+14h
**Needs:** A8.

**Files:** `src/content/tutor-examples.json`, issues for A.

- [ ] Write 5 `TutorExample`s (one per key misconception: `add-num-den`,
  `lcm-gcd-swap`, `mixed-convert`, `div-no-flip`, `part-of-rest`) with ideal ≤ 90-word explanations.
- [ ] Run ~20 `/api/tutor/explain` requests across skills and misconceptions
  (curl or the UI). Score each: math right? Uzbek natural? names the wrong
  thinking? ≤ 90 words? Put the table in `docs/plan/b-ai-review.md`.
- [ ] Open `[for-A]` issues with exact prompt changes for systematic problems; fix examples/glossary yourself. Commit, push.

### B5. Scripted demo student — target T+18h
**Needs:** B2, A5.

- [ ] Define persona "Jasur" for the stage demo: the exact answer (choice
  letter) for each diagnostic question so that the result is: target
  `frac-word` ✗ → `frac-add-diff` ✗ (`add-num-den`) → `frac-common-denom`
  ✗ → `lcm` ✗ (`lcm-gcd-swap`), `divisibility` ✓ ⇒ root gap **EKUK**;
  other entry skills mostly ✓. At most 12 questions (the diagnostic cap); fewer is better.
- [ ] Verify on the running app that it produces exactly that map. Write the
  table to `docs/pitch/demo-answers.md` (C uses it). Commit, push.

### B6. Content QA on the real UI — after M3, target T+32h
- [ ] Walk every question on a phone (390 px): wrapping, fraction rendering,
  length, typos. Fix content; file `[for-A]` issues for rendering bugs.
- [ ] Re-run validator, commit, push.

---

## If blocked or done (B's own backlog, in priority order)
1. More bank questions: 8 per skill for the demo-chain and entry skills.
2. `src/content/word-problems.json`: 12 hand-checked word problems that the worksheet uses when AI is off (tell C).
3. Second topic "O'nli kasrlar" (`src/content/topics/decimals/…`): graph + 2 questions per skill — proves "a new topic in one day" for the pitch (tell A and C).
4. Parent-friendly one-sentence descriptions per skill (`parentText` optional field, `[contract]` commit) for C's parent report.
5. Proofread all UI copy in A's and C's screens; send fixes as issues.
