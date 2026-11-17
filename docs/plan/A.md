# Role A — app, engine, AI, infra (60%)

> **For agentic workers:** execute task by task with superpowers:executing-plans
> (inline; no subagents unless the user asks). Tick `- [ ]` boxes as you go,
> commit them with the code. Tests: only what a task names (user decision).

**Goal:** the student app (start → diagnostic → knowledge map → path →
learn), the learner engine, the Claude tutor routes, storage, design system.

**Read first:** `CLAUDE.md`, `docs/plan/00-overview.md` (spec, contracts,
ownership), `PRODUCT.md`, `DESIGN.md`, `src/lib/types.ts`.

**Global constraints**
- Phone first: every student screen designed at 390×844, then checked at 1440.
- All visible text Uzbek Latin through `normalizeUz()`; student addressed as "sen".
- No wrong math on screen: correct answers come from B's content or generators, never from the LLM.
- `prefers-reduced-motion` → skip to final states, no confetti.
- Diagnostic must be deterministic for the same answers (demo is scripted).

**Review focus (things a judge will hit that tests do not cover)**
1. Reloading the page mid-diagnostic → resumes at the same question (state in localStorage).
2. Network off (airplane mode) during diagnostic/practice → app keeps working, progress queues and syncs later.
3. Very long Uzbek words in choices on a 360 px phone → text wraps, buttons stay ≥ 56 px tall, no overflow.
4. Answering everything correctly → result screen celebrates mastery (no empty trace, no crash) and the path offers "challenge" practice on entry skills.
5. AI route slow or failing → fallback explanation appears within 3 s, no spinner forever.

---

### A1. Scaffold, dependencies, tooling — target T+1.5h
**Needs:** nothing. **Unblocks:** everyone's code.

- [x] Scaffold in a temp dir (the repo root is not empty), then move in:
  `npx create-next-app@latest .tmp-next --ts --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*" --use-npm --yes`,
  move everything except `.git` and `README.md` into the root, delete `.tmp-next`.
  Keep existing `src/lib/types.ts`, `CLAUDE.md`, `docs/`, `.claude/`, `.mcp.json`, `scripts/`.
- [x] `npx shadcn@latest init` (base colour neutral, CSS variables). Add:
  `button card badge progress dialog sheet drawer tabs tooltip avatar table sonner skeleton separator scroll-area input label toggle-group dropdown-menu chart hover-card`.
- [x] `npm i motion canvas-confetti @number-flow/react @xyflow/react @dagrejs/dagre swr zod qrcode.react @anthropic-ai/sdk drizzle-orm @neondatabase/serverless`
  and `npm i -D vitest tsx drizzle-kit @types/canvas-confetti`.
- [x] `vitest.config.mts` with the `@` alias → `src`. `package.json` scripts:
  `"test": "vitest run"`, `"typecheck": "tsc --noEmit"`,
  `"validate:content": "tsx scripts/validate-content.ts"`,
  `"check": "npm run typecheck && npm run validate:content && npm run test"`,
  `"db:push": "drizzle-kit push"`.
  If `scripts/validate-content.ts` does not exist yet, create a stub that prints
  `content validator not written yet` and exits 0 (B owns and replaces it).
- [x] `.env.example` exactly as overview §3; `.gitignore` ignores `.env*` but not `.env.example`, and `.tmp-next/`.
- [x] `src/lib/uz.ts`: `normalizeUz(s: string): string` — `o'`/`g'`/`O'`/`G'`
  (with `'`, `‘`, `’`, `` ` ``) → `oʻ gʻ Oʻ Gʻ` (U+02BB); any other
  apostrophe between letters → `ʼ` (U+02BC). Leave `[[...]]` markup intact.
- [x] Placeholder `src/app/page.tsx` saying "Ildiz" (C replaces it in C8).
- [x] `npm run check` and `npm run build` pass. Commit `chore: scaffold next app` and push. Tell the user: "A1 tayyor — B va C kod yozishni boshlashi mumkin."

### A2. Design system and brand components — target T+4h
**Needs:** A1. **Unblocks:** C's visual work (C can start before with shadcn defaults).

**Files:** `src/app/globals.css`, `src/app/layout.tsx`, `src/components/brand/{logo,math-text,frac,mastery-ring,levels,motion,confetti}.tsx|ts`, `src/app/dev/kit/page.tsx`

**Interfaces (produces):**
- `MathText({ text, className }: { text: string; className?: string })`
- `Frac({ n, d, whole, size }: { n: number; d: number; whole?: number; size?: "sm"|"md"|"lg" })`
- `MasteryRing({ p, size, level }: { p: number; size?: number; level?: MasteryLevel })`
- `levelColor(level: MasteryLevel): string` (CSS var name), `levelLabel(level: MasteryLevel): string`
- `FadeIn`, `Stagger`, `PageTransition` motion wrappers; `celebrate(kind: "small"|"big"): void` (confetti, respects reduced motion)
- `Logo({ size }: { size?: number })` — sprout with roots, inline SVG

- [x] Run impeccable `shape` then `craft` against `DESIGN.md`; put tokens in
  `globals.css` (`@theme`): paper, grid, ink, red-pen, mastered, shaky, gap,
  unknown, plus shadcn variable mapping. Squared-paper background utility `.bg-katak`.
- [x] Fonts via `next/font/google` as named in DESIGN.md, subsets `latin`, `latin-ext`.
  Verify on screen that `oʻ gʻ ʼ` render in every font (screenshot); switch font if not.
- [x] Build the components above. `MathText` parses `[[n/d]]`, `[[w n/d]]`,
  `**bold**`, newlines; runs `normalizeUz`.
- [x] `/dev/kit` page showing every component and colour (B and C use it as a reference).
- [x] Screenshot `/dev/kit` at 390 and 1440 via playwright MCP, fix, commit, push.

### A3. Learner engine — target T+6h
**Needs:** A1. **Unblocks:** A5–A9, C3.

**Files:** `src/engine/{bkt,graph,diagnostic,analyze,practice,index}.ts`, `src/engine/engine.test.ts`

**Interfaces (produces), all pure, no I/O:**
```ts
// bkt.ts
export interface BktParams { pInit: number; pSlip: number; pGuess: number; pTransit: number }
export const DIAGNOSTIC_PARAMS: BktParams // { pInit: 0.5, pSlip: 0.1, pGuess: 0.2, pTransit: 0 }
export const PRACTICE_PARAMS: BktParams   // same with pTransit: 0.15
export function updateP(p: number, correct: boolean, params: BktParams): number
export function levelOf(s: SkillState | undefined): MasteryLevel
// graph.ts
export interface GraphIndex { byId: Record<SkillId, Skill>; prereqs(id: SkillId): SkillId[]; ancestors(id: SkillId): SkillId[]; dependents(id: SkillId): SkillId[]; topoOrder: SkillId[] }
export function indexGraph(graph: KnowledgeGraph): GraphIndex
// diagnostic.ts
export const MAX_DIAGNOSTIC_QUESTIONS = 12
export interface DiagnosticState { queue: SkillId[]; askedQuestionIds: string[]; skills: Record<SkillId, SkillState>; count: number; done: boolean }
export function startDiagnostic(graph: KnowledgeGraph): DiagnosticState
export function nextDiagnosticQuestion(state: DiagnosticState, questionsBySkill: Record<SkillId, Question[]>): Question | null
export function answerDiagnostic(state: DiagnosticState, graph: KnowledgeGraph, q: Question, choiceId: ChoiceId): DiagnosticState
// analyze.ts
export function analyze(graph: KnowledgeGraph, skills: Record<SkillId, SkillState>): { rootGaps: SkillId[]; traces: RootCauseTrace[]; path: PathStep[] }
export function buildSnapshot(studentId: string, graph: KnowledgeGraph, skills: Record<SkillId, SkillState>, diagnosticDone: boolean, now?: Date): StudentSnapshot
// practice.ts
export function pickPracticeQuestion(skillId: SkillId, askedIds: string[], questionsBySkill: Record<SkillId, Question[]>, generate?: (skillId: SkillId, seed: number) => Question | null, seed?: number): Question
export function answerPractice(snapshot: StudentSnapshot, graph: KnowledgeGraph, q: Question, choiceId: ChoiceId, now?: Date): StudentSnapshot
```
Rules are in overview §6. Question choice in the diagnostic is deterministic:
first unasked question of difficulty 2, then 1, then 3, in file order.
If everything is mastered, `path` = entry skills with reason `target`.

- [x] Write `engine.test.ts` on a 4-skill inline fixture graph (a ← b ← c, a ← d):
  1. `updateP(0.5, true, DIAGNOSTIC_PARAMS)` ≈ 0.818 and `updateP(0.5, false, …)` ≈ 0.111 (±0.005).
  2. wrong answer on entry `a` puts `b` and `d` at the queue front; correct on `b` marks `c` inferred with p ≥ 0.85.
  3. with `a`,`b`,`c` weak and `d` mastered: `rootGaps` = `["c"]`, trace chain = `["a","b","c"]`.
  4. `path` is topological: `c` before `b` before `a`; first step `current`.
  5. `answerPractice` marks the step `done` after p ≥ 0.9 with ≥ 3 attempts and makes the next one `current`.
- [x] Implement until `npm test` passes. Commit, push.

### A4. Storage and student API — target T+7.5h
**Needs:** A1. **Unblocks:** C4, live dashboard.

**Files:** `src/lib/db/{schema,memory,pg,index}.ts`, `drizzle.config.ts`, `src/app/api/students/route.ts`, `src/app/api/students/[id]/route.ts`, `src/app/api/students/[id]/progress/route.ts`, `src/lib/student-store.ts`

**Interfaces (produces):**
- `getRepo(): Repo` — Postgres (Drizzle + `@neondatabase/serverless` http driver) when `DATABASE_URL` is set, else a `globalThis` singleton memory repo. Memory repo seeds the demo class on first use from `buildDemoSeed()` (`@/lib/seed/demo-class`, owned by C; if missing, create a stub returning the class `6a` "6-A sinf" with no students and a comment `// Owner: C — replace in C3`).
- Tables: `classes(id, name, teacher_name, grade)`, `students(id, name, class_id, created_at)`, `snapshots(student_id pk, data jsonb, updated_at)`, `attempts(id, student_id, question_id, skill_id, choice_id, correct, misconception_id, mode, ts)`.
- Client `student-store.ts`: `getLocalStudent(): Student | null`, `saveLocalStudent(s: Student)`, `loadDiagnostic()/saveDiagnostic(state)`, `loadSnapshot()/saveSnapshot(s)`, `queueProgress(studentId, attempts, snapshot): void` (POSTs, keeps unsent items in localStorage, retries on `online` event and every 10 s).

- [x] Implement, validate request bodies with zod, return 400 on bad input.
- [x] Manual check: `curl` create student, post progress, get student — both with and without `DATABASE_URL`. Commit, push.

### A5. Start and diagnostic screens — target T+11h
**Needs:** A2, A3, A4, B1 (at least 3 skills of content; use whatever exists).

**Files:** `src/app/(student)/layout.tsx`, `src/app/(student)/start/page.tsx`, `src/app/(student)/diagnostic/page.tsx`, `src/components/student/{question-card,choice-button,diagnostic-progress,analyzing}.tsx`

- [x] `/start?class=6a`: name input, class chip, "Boshlash" → `POST /api/students` (offline: local id + queue) → `/diagnostic`.
- [x] `/diagnostic`: one question per screen, 4 big choice buttons (letters a–d), no right/wrong shown (it is a test), auto-advance 400 ms after tap with a page transition; progress "Savol N" + soft bar; rotating encouragement microcopy; resumes after reload. After the last question: 1.5 s "Bilim xaritang chizilmoqda…" interstitial → `/result`.
- [x] Every answer: `answerDiagnostic` → `buildSnapshot` → save locally → `queueProgress`.
- [x] Screenshots at 390 and 1440; fix; commit, push.

### A6. Result screen with the knowledge map reveal (the hero) — target T+15h
**Needs:** A5.

**Files:** `src/components/student/knowledge-map.tsx`, `src/components/student/skill-node.tsx`, `src/app/(student)/result/page.tsx`

**Interfaces (produces):** `KnowledgeMap({ graph, snapshot, mode, highlightTrace, onSkillClick, className }: { graph: KnowledgeGraph; snapshot: StudentSnapshot; mode: "reveal" | "static"; highlightTrace?: boolean; onSkillClick?: (id: SkillId) => void; className?: string })` — C reuses it.

- [x] React Flow + dagre, `rankdir: "BT"` (roots at the bottom), custom skill node (short title + mastery ring, colour by level), fitView, gentle pan, no zoom buttons.
- [x] Reveal sequence (mode "reveal"): nodes rise in by rank bottom→top (stagger) → colours fill → trace edges draw from the failed entry skill down to the root (stroke-dashoffset, ~400 ms per edge) → root node pulses with a "Ildiz shu yerda" callout → bottom card slides up.
- [x] Bottom card: "Muammo *{target}*da emas — ildizi *{root}*da." plus the top misconception (title + example via `MathText`) + CTA "Shaxsiy yo'limni ko'rish" → `/path`. All-mastered case: celebration + "Murakkabroq mashqlar" CTA.
- [x] Use impeccable `animate` and motion-framer patterns. Record a short GIF/video of the reveal (playwright or screen capture) and check timing feels ~6–8 s total. Commit, push.

### A7. Personal path screen — target T+17h
**Needs:** A6.

**Files:** `src/app/(student)/path/page.tsx`, `src/components/student/path-stem.tsx`

- [ ] Vertical stem that grows from the root (bottom) to the target (top); steps on a gentle S-curve; done = green leaf, current = glowing large button "Davom etish", locked = muted; tap current → `/learn/[skillId]`. Header: name, overall mastery `MasteryRing`, link "Xaritam" (static map in a sheet).
- [ ] Screenshots, commit, push.

### A8. AI tutor layer — target T+20h
**Needs:** A1, B1 (glossary + misconceptions), ideally B4's examples file.

**Files:** `src/lib/ai/{client,fallback}.ts`, `src/lib/ai/prompts/{tutor,shared}.ts`, `src/app/api/tutor/explain/route.ts`, `src/app/api/tutor/chat/route.ts`

**Interfaces (produces):**
- `aiEnabled(): boolean` (`AI_MODE !== "fallback"` and key present), `getAnthropic(): Anthropic`, `MODEL: string`.
- `streamText(res: AsyncIterable<string>): Response` helper → `text/plain; charset=utf-8` stream.
- `fallbackExplanation(q: Question, choiceId: ChoiceId): string` (question explanation + misconception remedy).

- [ ] System prompt (Uzbek): friendly tutor for 11–12-year-olds, "sen", Latin script, uses only our markup (`[[a/b]]`, `**bold**`), no LaTeX/headers, terminology from `glossary.json`, few-shot examples from `src/content/tutor-examples.json` if present. Keep the system prompt byte-stable (cache-friendly), put the per-request facts in the user message.
- [ ] `explain`: facts = skill title, stem, correct choice text, chosen choice text, misconception (title/example/remedy) if any. Output ≤ 90 words: name the wrong thinking kindly → correct steps with these numbers → one short check question. `client.beta.messages.stream({ model: MODEL, max_tokens: 1024, output_config: { effort: "low" }, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default", system, messages })`; forward `text_delta`s. On error/timeout (8 s to first token) or `stop_reason === "refusal"` → stream the fallback text.
- [ ] `chat`: Socratic, ≤ 70 words per reply, never states the final answer to the current question, steers back to the topic.
- [ ] Manual check with 3 misconceptions, with and without key. Commit, push. Tell B: "A8 tayyor — B4 ni boshlash mumkin."

### A9. Learn screen: lesson, practice, tutor — target T+25h
**Needs:** A7, A8, B3 (generators; until then bank questions only).

**Files:** `src/app/(student)/learn/[skillId]/page.tsx`, `src/components/student/{lesson-card,practice-card,tutor-panel,tutor-chat,skill-complete}.tsx`

- [ ] Lesson card: skill title, why it matters (`description`), "Sen shunday o'ylagan bo'lishing mumkin" card from the observed misconception (example + remedy), one worked example (a bank question with its explanation). CTA "Mashq qilish".
- [ ] Practice loop with `pickPracticeQuestion` / `answerPractice`: correct → green state, small confetti, ring animates (NumberFlow); wrong → red-pen strike on the chosen answer + shake, then the tutor panel streams `/api/tutor/explain` with a typewriter feel. "Nega?" opens the chat drawer (`/api/tutor/chat`). Optional hint button shows `hint`.
- [ ] Completion: full-screen "{skill} o'zlashtirildi!" + big confetti + mini map with the node turning green → "Keyingi qadam".
- [ ] Every answer saved locally + `queueProgress`. Screenshots, commit, push.

### A10. Integration on the deployed URL — milestone M2, target T+26h
**Needs:** C1 deploy, C5 dashboard.

- [ ] On the Vercel URL with Neon: phone runs the full student flow while `/teacher` on a laptop shows the student appear and update within ~3 s.
- [ ] Real phone test (Android + iPhone if available) on mobile data. File issues for C/B problems, fix your own. Commit, push.

### A11. Polish pass — after M3 freeze, target T+34h
- [ ] impeccable `audit` then `polish` on `/start`, `/diagnostic`, `/result`, `/path`, `/learn`. Fix contrast, spacing rhythm, empty/loading/error states (skeletons, friendly Uzbek errors).
- [ ] Performance: first load on 4G < 3 s; lazy-load the map; no layout shift.
- [ ] Accessibility basics: focus states, buttons have labels, reduced motion respected.

### A12. Demo hardening — target T+38h
- [ ] `AI_MODE=fallback` full run, airplane-mode run, demo reset via C's `/api/teacher/reset`, two phones at once.
- [ ] Support C's rehearsals; fix anything that took > 1 s to feel responsive.

---

## If blocked or done (A's own backlog, in priority order)
1. Keyboard shortcuts 1–4 / a–d for answers on desktop.
2. Shared-element transition: path step → learn header (motion `layoutId`).
3. XP / streak chip with satisfying micro-animation.
4. Sound effects (correct / wrong / complete), muted by default toggle.
5. PWA manifest + icons so the app can be "installed" from the landing page.
6. Second graph support (B's backlog "O'nli kasrlar") via `?topic=` switch.
