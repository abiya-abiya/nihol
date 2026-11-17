# Ildiz — overview, architecture, contracts, workflow

Every role reads this file once, fully, before their own task file
(`A.md`, `B.md`, `C.md`). It is the shared spec.

## 1. What we are building and why

**Hackathon:** Umummilliy AI Xakaton, Tashkent, 17–19 Nov 2026. Track:
Ta'lim va ilm-fan vazirligi, problem #3 "Shaxsiylashtirilgan o'qitish" —
an AI tutor that works in Uzbek, finds gaps in knowledge and builds an
individual learning path.

**Product:** *Ildiz* ("root"). Working name; C may propose a better one
before T+6h, after that it is frozen.

**One-line pitch:** Ildiz finds not *where* a student makes mistakes but
*why*: it traces a wrong answer back through the topic's prerequisite
graph to the root gap and builds a personal path that starts there.

**Why this wins:** most teams will ship an LLM chatbot. Our core is a
real learner model (knowledge graph + Bayesian Knowledge Tracing +
misconception-tagged answers). The LLM only explains, in good Uzbek.
Diagnosis is deterministic, explainable and works offline.

**Scope (fixed):** 5–6 grade mathematics, topic **"Kasrlar"**
(fractions), ~17 skills from times tables up to fraction word problems.
One subject done deeply beats five done shallowly.

**Users and surfaces**

| Surface | User | Device | Mode |
|---|---|---|---|
| `/` landing + QR | judges, everyone | projector / phone | persuade |
| `/start` → `/diagnostic` → `/result` → `/path` → `/learn/[skillId]` | student | phone first (390 px) | experience |
| `/teacher`, `/teacher/student/[id]`, worksheet | teacher | laptop / projector (1440 px) | operate |

**Goals**
- 3-minute live demo that a judge can take part in from their own phone.
- The "aha" moment: the knowledge map animates the trace from the failed
  skill down to the root gap.
- The teacher dashboard updates live while the judge answers.
- Everything works with the AI offline (fallback texts) and with the
  database offline (memory store).

**Non-goals:** accounts/passwords, other subjects (only as a pitch claim
plus, if time allows, one extra graph), Russian UI, dark mode, native
mobile app, real school data, a payment model in code.

**Anti-goals (failure even if it "works")**
- A diagnosis that looks random or contradicts the student's answers.
- Wrong math anywhere on screen (a judge will notice a wrong fraction).
- Broken or ugly Uzbek (wrong letters, Russian calques, "Siz/sen" mixed).
- A generic shadcn-template look.
- A demo that depends on hackathon wi-fi.

## 2. Demo script (target, 3 minutes)

1. **Problem (20 s):** one class, 30 students, one pace; the teacher sees
   wrong answers but not their cause. (C finds a real statistic with a
   source.)
2. **Judge as student (75 s):** judge scans the QR on the landing page,
   types a name, answers ~8–10 questions. The result screen draws the
   knowledge map, then animates: "Kasrlarni qo'shishdagi xatoning ildizi —
   EKUK". Personal path appears, growing from the root upward.
3. **Tutor (30 s):** a practice item; a wrong answer; the AI tutor
   explains in Uzbek *the specific wrong thinking* (misconception), then
   the student asks "Nega?" in the chat.
4. **Teacher (40 s):** projector shows `/teacher`; the judge's row just
   appeared in the heatmap; "7 students share the root gap EKUK"; one
   click creates a printable worksheet for exactly that group.
5. **Close (15 s):** any topic = a graph + a question bank; roadmap and
   pilot ask.

## 3. Architecture

```
Next.js (App Router, TypeScript) on Vercel
├─ client: engine runs in the browser (pure TS) → instant, offline-friendly
│    diagnostic selection, BKT updates, root-cause traces, path
├─ server routes
│    /api/students, /api/students/[id], /api/students/[id]/progress  (A)
│    /api/tutor/explain, /api/tutor/chat   → Gemini API, streamed     (A)
│    /api/teacher/report, /api/teacher/worksheet, /api/teacher/reset (C)
├─ storage: Repo interface (src/lib/types.ts)
│    Postgres (Neon, via Drizzle) when DATABASE_URL is set,
│    in-memory store otherwise (local dev, offline demo)
└─ content: static JSON in src/content (B) + generators (B)
```

- The client computes the `StudentSnapshot` and POSTs attempts + snapshot
  after every answer. The server stores; it does not recompute.
- The teacher dashboard polls `/api/teacher/report?classId=6a` every 3 s.
- Demo class id: `6a` ("6-A sinf"), seeded with 24 synthetic students (C).

### Tech stack (A installs everything in A1, so B and C rarely touch the lockfile)

- Next.js latest (App Router, `src/` dir, Turbopack), React, TypeScript strict
- Tailwind CSS v4, shadcn/ui (components in `src/components/ui`)
- `motion` (import from `motion/react`), `canvas-confetti`, `@number-flow/react`
- `@xyflow/react` + `@dagrejs/dagre` for the knowledge map
- `swr` for polling, `zod` for validation, `qrcode.react` for QR codes
- `drizzle-orm` + `@neondatabase/serverless`, `drizzle-kit`
- Dev: `vitest`, `tsx`
- npm (not pnpm/yarn). Node 20+.

### Gemini API usage (A owns `src/lib/ai/`)

- Plain REST from `src/lib/ai/client.ts` (no SDK), so we control failover.
- Keys: `GEMINI_API_KEYS="key1,key2"`. Models: `GEMINI_MODELS`, default
  `gemini-flash-latest,gemini-3.5-flash-lite,gemini-flash-lite-latest`.
  Failover: 429 or other 5xx -> same model, next key; 401/403 -> that key
  is dropped; 503 (overloaded), 400, timeout or network error -> next
  model. Untried pairs get a last go while the time budget lasts
  (tutor 20 s, 6 s per attempt; worksheet 25 s, 10 s per attempt).
- Explanations and chat: `streamGenerateContent?alt=sse`,
  `thinkingLevel: "low"`, streamed to the browser as `text/plain`.
- Worksheet JSON: `generateContent` with `responseJsonSchema` from
  `z.toJSONSchema(Schema)`, validated with zod again on our side.
- Whole chain failed, empty answer, or `AI_MODE=fallback` (or no
  `GEMINI_API_KEYS`) → every AI route returns prepared text built from B's
  content (`explanation`, `remedy`, glossary).
- Keys live only in `.env.local` / host env. Never in git, never in the client.

### Environment variables (`.env.example`, created in A1)

```
GEMINI_API_KEYS=        # comma-separated, tried in order
GEMINI_MODELS=gemini-flash-latest,gemini-3.5-flash-lite,gemini-flash-lite-latest
AI_MODE=live            # live | fallback
DATABASE_URL=           # empty = in-memory store
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEMO_CLASS_ID=6a
```

## 4. Repository layout and ownership

Edit only files you own. Ownership is by path; new files go under your
own paths.

| Path | Owner | Notes |
|---|---|---|
| `CLAUDE.md`, `PRODUCT.md`, `DESIGN.md`, `docs/plan/00-overview.md` | A | others propose changes via issue |
| `docs/plan/A.md` / `B.md` / `C.md` | A / B / C | tick your own checkboxes |
| `package.json`, lockfile, configs (`next.config.*`, `tsconfig.json`, `vitest.config.*`, `drizzle.config.*`, eslint) | A | see "Dependencies" rule |
| `src/app/layout.tsx`, `src/app/globals.css` | A | design tokens live here |
| `src/app/(student)/**`, `src/app/api/students/**`, `src/app/api/tutor/**` | A | |
| `src/components/ui/**` | A | anyone may ADD a new shadcn component with `npx shadcn@latest add <name>`; never edit an existing one |
| `src/components/brand/**`, `src/components/student/**` | A | `MathText`, `Frac`, `KnowledgeMap`, motion primitives |
| `src/engine/*.ts` (not generators) | A | bkt, graph, diagnostic, path |
| `src/engine/generators/**` | B | question generators + fraction utils |
| `src/content/**` | B | graph, misconceptions, questions, glossary |
| `scripts/validate-content.ts` | B | |
| `src/lib/types.ts` | A | additive edits by anyone, tagged `[contract]` |
| `src/lib/db/**`, `src/lib/ai/**`, `src/lib/uz.ts`, `src/lib/student-store.ts` | A | C may add `src/lib/ai/prompts/worksheet.ts` |
| `src/app/page.tsx` (landing) | C | |
| `src/app/teacher/**`, `src/app/api/teacher/**` | C | |
| `src/components/teacher/**`, `src/components/pitch/**` | C | |
| `src/lib/teacher/**`, `src/lib/seed/**` | C | report builder, synthetic class |
| `docs/pitch/**` | C | deck, script, Q&A, research |
| `scripts/sync.mjs` | A | |

## 5. Content format (B writes, everyone reads)

Files:
- `src/content/graph.json` — `KnowledgeGraph`
- `src/content/misconceptions.json` — `Misconception[]`
- `src/content/questions/<skillId>.json` — `Question[]` (one file per skill)
- `src/content/glossary.json` — `GlossaryEntry[]`
- `src/content/index.ts` — typed loader (B): exports `graph`, `skillsById`,
  `misconceptions`, `misconceptionsById`, `questions`, `questionsBySkill`, `glossary`

**Math markup** (rendered by A's `<MathText>`):
- `[[3/4]]` — fraction, `[[2 1/3]]` — mixed number
- multiplication `·`, division `:` (as in Uzbek schools), minus `−` is
  optional, `-` is fine
- `**bold**` allowed; new line = paragraph break; nothing else

**Uzbek spelling:** write `o'`, `g'` and the tutuq belgisi as `'` in JSON
for easy typing; `normalizeUz()` in `src/lib/uz.ts` (A) turns them into
`oʻ gʻ ʼ` at render time. Address the student as **sen** (friendly tutor
voice) in student-facing text and as **Siz** in teacher-facing text.

### Skill graph (fixed ids; B writes titles/descriptions)

Prerequisites point down. Bottom = foundations ("roots").

| id | Uzbek title (draft) | grade | prerequisites |
|---|---|---|---|
| `nat-mul` | Natural sonlarni ko'paytirish | 5 | — |
| `nat-div` | Qoldiqli bo'lish | 5 | `nat-mul` |
| `divisibility` | Bo'linish belgilari | 6 | `nat-div` |
| `gcd` | EKUB | 6 | `divisibility` |
| `lcm` | EKUK | 6 | `divisibility` |
| `frac-concept` | Kasr tushunchasi | 5 | `nat-div` |
| `frac-equiv` | Kasrning asosiy xossasi | 5 | `frac-concept`, `nat-mul` |
| `frac-simplify` | Kasrlarni qisqartirish | 6 | `frac-equiv`, `gcd` |
| `frac-common-denom` | Umumiy maxrajga keltirish | 6 | `frac-equiv`, `lcm` |
| `frac-compare` | Kasrlarni taqqoslash | 6 | `frac-common-denom` |
| `frac-add-same` | Bir xil maxrajli kasrlarni qo'shish va ayirish | 5 | `frac-concept` |
| `frac-add-diff` | Har xil maxrajli kasrlarni qo'shish va ayirish | 6 | `frac-add-same`, `frac-common-denom` |
| `mixed-numbers` | Aralash sonlar | 5 | `frac-concept`, `nat-div` |
| `mixed-add` | Aralash sonlarni qo'shish va ayirish | 6 | `mixed-numbers`, `frac-add-diff` |
| `frac-mul` | Kasrlarni ko'paytirish | 6 | `frac-simplify`, `nat-mul` |
| `frac-div` | Kasrlarni bo'lish | 6 | `frac-mul` |
| `frac-word` | Kasrlarga doir matnli masalalar | 6 | `frac-add-diff`, `frac-mul` |

`entrySkills` (ask in this order): `frac-word`, `mixed-add`, `frac-div`, `frac-compare`.

### Misconception ids (fixed; B may add more)

| id | wrong thinking |
|---|---|
| `add-num-den` | adds numerators and denominators separately ([[1/2]]+[[1/3]]=[[2/5]]) |
| `bigger-den-bigger` | bigger denominator means bigger fraction |
| `simplify-subtract` | "simplifies" by subtracting the same number from top and bottom |
| `equiv-one-side` | multiplies only the numerator (or only the denominator) |
| `lcm-is-product` | always takes the product of denominators as the common denominator, then forgets to simplify |
| `lcm-gcd-swap` | confuses EKUK with EKUB |
| `common-denom-keep-num` | changes the denominator but keeps the numerator |
| `mixed-convert` | [[2 1/3]] → [[3/3]] or [[21/3]] (forgets whole · denominator) |
| `mixed-borrow` | subtracting mixed numbers, does not borrow from the whole part |
| `mul-common-denom` | keeps the common denominator when multiplying ([[2/5]]·[[3/5]]=[[6/5]]) |
| `whole-times-both` | multiplies a whole number into numerator and denominator (3·[[2/5]]=[[6/15]]) |
| `div-no-flip` | divides without taking the reciprocal |
| `div-flip-first` | takes the reciprocal of the first fraction |
| `remainder-error` | wrong quotient/remainder in division with remainder |
| `times-table` | multiplication-table slip |
| `part-of-rest` | word problems: takes the fraction of the whole instead of the remaining part |
| `divisibility-rule` | misapplies a divisibility rule (e.g. by 3 looks at the last digit) |

## 6. Learner model (A implements; documented here so everyone agrees)

- **BKT** per skill. Diagnostic: `pInit 0.5, pSlip 0.1, pGuess 0.2, pTransit 0`.
  Practice: same with `pTransit 0.15`.
  - correct: `p' = p(1−s) / (p(1−s) + (1−p)g)`
  - wrong: `p' = p·s / (p·s + (1−p)(1−g))`
  - then `p'' = p' + (1−p')·T`
- **Levels:** `mastered` p ≥ 0.8; `gap` p < 0.5 (with attempts or inferred);
  `shaky` otherwise; `unknown` if no attempts and not inferred.
- **Diagnostic selection (graph descent):** queue = `entrySkills`. Ask one
  difficulty-2 question per skill (fallback 1, then 3). Correct → all
  transitive prerequisites get `p = max(p, 0.85)`, `inferred = true` and
  leave the queue. Wrong → its undecided direct prerequisites go to the
  FRONT of the queue. Stop when the queue is empty or after 12 questions.
- **Root gaps:** weak skills (gap or shaky, not inferred) none of whose
  prerequisites are weak.
- **Trace:** for each weak entry skill, walk down through the weakest weak
  prerequisite until a root gap.
- **Path:** all skills on traces plus all weak skills, topologically sorted
  (prerequisites first); first step `current`, rest `locked`.
- **Practice completion:** p ≥ 0.9 and at least 3 practice attempts on
  that skill → step `done`, next becomes `current`.

## 7. HTTP API

| Method + path | Owner | Body → response |
|---|---|---|
| `POST /api/students` | A | `CreateStudentRequest` → `CreateStudentResponse` |
| `GET /api/students/[id]` | A | → `StudentRecord` or 404 |
| `POST /api/students/[id]/progress` | A | `SaveProgressRequest` → `SaveProgressResponse` |
| `POST /api/tutor/explain` | A | `ExplainRequest` → streamed `text/plain` |
| `POST /api/tutor/chat` | A | `ChatRequest` → streamed `text/plain` |
| `GET /api/teacher/report?classId=6a` | C | → `ClassReport` |
| `POST /api/teacher/worksheet` | C | `WorksheetRequest` → `Worksheet` |
| `POST /api/teacher/reset` | C | `{ classId }` → `{ ok: true }` (re-seeds demo class) |

Server code gets storage with `getRepo()` from `src/lib/db` (A). The
memory store seeds the demo class on first use by calling C's
`buildDemoSeed()` from `src/lib/seed/demo-class.ts`; until C lands it, A
uses an empty class.

## 8. Shared UI components (A builds, C reuses)

- `<MathText text: string className?: string />` — renders markup + `normalizeUz`.
- `<Frac n: number d: number whole?: number size?: "sm"|"md"|"lg" />`
- `<KnowledgeMap graph snapshot mode: "reveal" | "static" onSkillClick? highlightTrace? />`
  — bottom-to-top layout (roots at the bottom), node colour by level.
- `<MasteryRing p: number size?: number />`
- `levelColor(level)` and `levelLabel(level)` in `src/components/brand/levels.ts`
  (`mastered` → "O'zlashtirilgan", `shaky` → "Mustahkamlash kerak",
  `gap` → "Bo'shliq", `unknown` → "Tekshirilmagan").

C imports these; if C needs one before A ships it, C writes a throwaway
local version inside `src/components/teacher/` and switches later.

## 9. Visual direction (details in DESIGN.md)

"Katak daftar + Ildiz": the Uzbek school squared notebook (paper,
faint blue grid, ink-blue text, teacher's red pen for mistakes, green for
mastery) and the root metaphor (the knowledge map grows from roots at the
bottom; gaps glow at the roots). Bold display type, generous motion with
purpose: the map reveal and the root trace are the hero moments.

UI skills are vendored in `.claude/skills/`: **frontend-design**,
**impeccable** (run its `shape`/`craft`/`polish`/`audit`/`animate`
commands; it reads PRODUCT.md and DESIGN.md), **motion-framer**. MCP
servers in `.mcp.json`: **shadcn** (find/add components) and
**playwright** (look at the rendered page). Close the loop on every UI
task: screenshot at 390 px and 1440 px before calling it done.

## 10. Timeline

T0 = when this plan was pushed. Fill in real clock times in the team chat
once the submission deadline is known.

| Milestone | Target | Done when |
|---|---|---|
| M0 skeleton | T+2h | A1 on main, deployed URL works, B has 3 skills of content validating, C has Vercel + Neon ready |
| M1 vertical slice | T+10h | diagnostic → map → path works on real content; teacher dashboard on seed data |
| M2 feature complete | T+22h | AI explain + chat live, practice loop, live teacher updates, worksheet |
| M3 FEATURE FREEZE | T+30h | after this only fixes, polish, content QA, pitch |
| M4 demo-ready | T+38h | 3 full rehearsals, backup video, offline mode tested |
| Submit | deadline − 1h | |

## 11. Risks

| Risk | Mitigation |
|---|---|
| Hackathon wi-fi dies | phone hotspot; `AI_MODE=fallback`; memory store; backup video |
| AI writes wrong math or poor Uzbek | AI never creates graded answers; prompts carry glossary + misconception; B reviews 20 sample outputs |
| Merge conflicts | path ownership, small commits, `npm run sync` before every task |
| Main build breaks | `npm run check` before every push; whoever broke it fixes it first |
| Judge's phone is small/old | 390 px first, no heavy WebGL, test on a real phone at M1 |
| Diagnostic too long | hard cap 12 questions; target 8–10 |
