# Role C — deploy, teacher dashboard, landing, pitch (20%)

> **For agentic workers:** execute task by task with superpowers:executing-plans
> (inline). Tick `- [ ]` boxes as you go and commit them with the work.

**Goal:** the deployed URL, the teacher side (live class dashboard,
student detail, printable worksheet), the landing page with QR codes,
the demo seed data, and the pitch (deck, script, Q&A, backup video).

**Read first:** `CLAUDE.md`, `docs/plan/00-overview.md` (§2 demo, §7 API,
§8 shared components), `PRODUCT.md`, `DESIGN.md`, `src/lib/types.ts`.

**Global constraints**
- Teacher screens: designed for 1440 px and a projector (big type, high
  contrast), must still work at 1024 px. Teacher addressed as "Siz".
- Landing: must look stunning on a projector and on a phone (it is the first thing judges see).
- Never compute mastery yourself: read `StudentSnapshot` (A's engine output).
- No secrets in git. Vercel env holds `ANTHROPIC_API_KEY`, `DATABASE_URL`.

**Review focus**
1. A student with `snapshot: null` (joined, not finished) → shows "Diagnostika jarayonida", never crashes the heatmap.
2. 0 students / reset class → empty state with the QR to join, not a blank page.
3. Polling while the laptop sleeps or the network blips → keeps last data, shows a small "aloqa yo'q" badge, recovers.
4. Worksheet printed from Chrome on A4 → one page of tasks, answer key on a second page, no cut-off fractions.
5. Projector at 1280×720 → nothing important below the fold on `/teacher`.

---

### C1. Vercel + Neon — target T+1h (no code)
**Needs:** nothing; first deploy after A1.

- [ ] Vercel: log in with GitHub. The repo is private and owned by
  `abiya-abiya`; importing it needs that account to grant the Vercel GitHub
  app access to `si-tyutor` (Abdulloh clicks "Import"). Fallback without
  owner access: `npx vercel link` then `npx vercel --prod` from a local clone.
- [ ] Storage → create a Neon Postgres (free) → it sets `DATABASE_URL`.
  Add env vars from `.env.example` (`ANTHROPIC_API_KEY` from the team chat,
  `ANTHROPIC_MODEL=claude-opus-5-5`, `AI_MODE=live`, `DEMO_CLASS_ID=6a`,
  `NEXT_PUBLIC_APP_URL=https://<project>.vercel.app`).
- [ ] After A1/A4 land: deploy, run `npm run db:push` with the Neon
  `DATABASE_URL`, check the URL works. Post the URL in the team chat and
  in `docs/pitch/links.md`. Commit, push.

### C2. Pitch research — target T+3h (parallel with C1)
**Files:** `docs/pitch/research.md`

- [x] With sources (links): Uzbekistan school numbers (schools, pupils,
  teachers; pupils per class), international assessment results that
  include Uzbekistan (PISA/TIMSS/PIRLS — check which ones and the math
  results), the state of private tutoring (repetitor) costs, relevant
  government programmes on AI/digital education. Only numbers you can cite.
- [x] Competitor scan: Khan Academy / Khanmigo, Duolingo Math, local
  Uzbek ed-tech; one line each on why Ildiz is different (root cause +
  Uzbek + teacher loop + offline).
- [x] Guess the judging criteria (innovation, impact, feasibility, demo,
  AI use) and note what in our demo proves each. Commit, push.

### C3. Demo class seed — target T+7h
**Needs:** A1; A3 for `buildSnapshot` (write states directly if A3 is late).

**Files:** `src/lib/seed/demo-class.ts` (replaces A's stub if present)

**Interfaces (produces):** `buildDemoSeed(now?: Date): SeedData` — deterministic.

- [x] Class `6a` "6-A sinf", teacher "Dilnoza Karimova" (fictional).
  24 students with common Uzbek first names + surname initial. Patterns:
  7 with root gap `lcm` (trace through `frac-common-denom`, `frac-add-diff`),
  5 with root `frac-concept`, 4 with `mixed-convert` misconception on
  `mixed-numbers`, 6 mostly mastered, 2 joined but no snapshot.
  Build skill states, then `buildSnapshot()` from `@/engine`. Attempts
  with timestamps spread over the last 2 days. Commit, push.

### C4. Class report + teacher API — target T+9h
**Needs:** A4 (`getRepo`), C3.

**Files:** `src/lib/teacher/report.ts`, `src/app/api/teacher/report/route.ts`, `src/app/api/teacher/reset/route.ts`

**Interfaces (produces):** `buildClassReport(repo: Repo, classId: string, now?: Date): Promise<ClassReport>`

- [x] `skillStats` per skill in topological order; `topRootGaps` sorted by
  student count; `topMisconceptions` from attempts; `recentAttempts` last
  20 with student names; `masteryAvg` = mean p over all skills.
- [x] `GET /api/teacher/report?classId=6a` (no caching: `dynamic = "force-dynamic"`), `POST /api/teacher/reset` → `repo.seedClass(buildDemoSeed())`.
- [x] curl check, commit, push.

### C5. Teacher dashboard `/teacher` — target T+16h
**Needs:** C4; A2 for tokens/brand (start with shadcn defaults, restyle when A2 lands).

**Files:** `src/app/teacher/page.tsx`, `src/app/teacher/layout.tsx`, `src/components/teacher/{kpi-tiles,heatmap,root-gaps,misconceptions,activity-feed,live-badge}.tsx`

- [x] SWR polling every 3 s. Header: class, teacher, live badge (pulsing dot; "aloqa yo'q" when stale).
- [x] KPI tiles with `@number-flow/react`: students, diagnostics done, average mastery, #1 root gap.
- [x] Heatmap: rows = students (grouped by root gap), columns = skills
  (topological, roots on the left), cell colour = level (`levelColor`);
  hover shows p and attempts; click row → student detail. New or changed
  cells flash briefly (motion).
- [x] "Sinfning ildiz muammolari": bars per root gap with avatar stacks and
  a "Mashq varaqasi yaratish" button (→ C7). Misconceptions panel with
  example via `MathText`.
- [x] Live activity feed: newest attempts slide in ("Jasur — EKUK — ✗ EKUB bilan adashtirdi").
- [x] "Demo holatini tiklash" in a small menu → `/api/teacher/reset` (confirm in an in-app dialog, not `window.confirm`).
- [x] Use impeccable (`craft`, then `polish`) and the dataviz habits in
  DESIGN.md. Screenshots at 1440 and 1280×720. Commit, push.

### C6. Student detail `/teacher/student/[id]` — target T+19h
**Needs:** A6 (`KnowledgeMap`), C5.

- [x] Static `KnowledgeMap` with trace highlighted, root-cause sentence,
  path progress list, misconceptions seen, last attempts. Back to class. Commit, push.

### C7. Group worksheet — target T+22h
**Needs:** B3 (`generateWorksheetItems`), A8 (`aiEnabled`, `getAnthropic`, `MODEL`).

**Files:** `src/lib/ai/prompts/worksheet.ts`, `src/app/api/teacher/worksheet/route.ts`, `src/app/teacher/worksheet/page.tsx`, `src/components/teacher/worksheet-sheet.tsx`

- [ ] API: items from `generateWorksheetItems(skillIds, count ?? 8, seed)`
  (correct math). If `aiEnabled()`: `client.messages.parse` with a zod
  schema for `{ title, intro, teacherNotes, wordProblems: {stem, answer}[2] }`
  (`output_config: { format: zodOutputFormat(schema), effort: "medium" }`),
  word problems marked `source: "ai"`. Without AI: template title/intro
  and B's `word-problems.json` if it exists.
- [ ] Page `/teacher/worksheet?skills=lcm,frac-common-denom&group=<root>`:
  preview + "Chop etish" (`window.print()`), print CSS: A4, school header,
  name/date lines, tasks on page 1, answer key on page 2.
- [ ] Print to PDF and check. Commit, push.

### C8. Landing `/` — target T+25h
**Files:** `src/app/page.tsx`, `src/components/pitch/{hero,qr-card,how-it-works}.tsx`

- [ ] Persuade mode (impeccable `shape` → `craft`): product name + one-line
  promise, two QR cards (`qrcode.react`): "O'quvchi sifatida kirish"
  (`${NEXT_PUBLIC_APP_URL}/start?class=6a`) and "O'qituvchi paneli" (`/teacher`),
  a 3-step animated "Qanday ishlaydi" (Diagnostika → Ildizni topish →
  Shaxsiy yo'l), team strip. Looks great at 1920×1080 projector and 390 px.
- [ ] Screenshots, commit, push.

### C9. Pitch package — target T+32h
**Files:** `docs/pitch/{script,qa,deck-outline,links}.md`, deck file (any tool), backup video

- [ ] Deck (6–8 slides): problem with cited numbers → insight (root cause,
  not wrong answer) → live demo → how it works (graph + BKT + LLM only
  explains) → teacher value → scale (new topic = graph + bank; B's second
  topic if done) → roadmap/pilot ask → team.
- [ ] `script.md`: minute-by-minute 3-minute script matching overview §2,
  with B's `demo-answers.md` for "Jasur" and who clicks what.
- [ ] `qa.md`: 10 likely judge questions with crisp answers (data privacy
  of children, accuracy of diagnosis, cost per student, curriculum fit,
  offline, teacher adoption, scaling to other subjects/languages,
  business model, why not just ChatGPT, team).
- [ ] Record a 3-minute backup demo video of the deployed app (screen
  recording) and store the link in `links.md`. Commit, push.

### C10. Rehearsals — target T+38h
- [ ] 3 timed rehearsals with the team on the deployed URL (one with
  `AI_MODE=fallback`, one on phone hotspot). Fix list → issues `[for-A]`/`[for-B]`, fix your own.

---

## If blocked or done (C's own backlog, in priority order)
1. Parent report `/report/[studentId]`: one friendly page (what the child knows, what to practise, 3 tips) + Telegram share button.
2. Class CSV export.
3. Onboarding tour on `/teacher` (3 tooltips) for judges who open it themselves.
4. "How it works" 30-second animated explainer on the landing page.
5. Social/OG image and favicon set for the URL.
