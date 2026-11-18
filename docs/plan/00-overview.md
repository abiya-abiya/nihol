# Ildiz v2 — multi-subject teacher tool (3-hour sprint)

v1 (fractions tutor) is finished and archived in `docs/plan/v1/`. Everything
built there is reused. **Deadline: T0 + 3 h.** Speed beats completeness:
no new tests beyond `npm run check`; spend the time on features, animation
and UI polish.

## 1. Product

Ildiz is a ready-made tool for **teachers**. Three roles log in with a
login and password:

- **Oʻqituvçi (teacher):** sees every student's mastery per subject and
  lesson; creates subjects and lessons; uploads a lesson material (PDF or
  Word) and "AI" turns it into a test (see §3); edits and sends the test
  to the class; creates student and parent accounts.
- **Öquvçi (student):** sees subjects (Matematika first), receives tests,
  solves them, sees their own knowledge map per subject. Matematika keeps
  the v1 diagnostic, root-cause map, path and AI tutor.
- **Ota-ona (parent):** sees the child's knowledge map per subject (same
  map component as v1, lessons as nodes) and a progress chart over time.

**Default data must make the pitch work with no setup:** demo accounts,
4 subjects × 7 lessons × 5 questions (Matematika reuses v1), assignments
and results history for the demo class.

## 2. Hard rules for this sprint

1. **New Uzbek alphabet everywhere in the UI and content** (law of
   21 Oct 2026): `Oʻ→Ö, Gʻ→Ğ, Sh→Ş, Ch→Ç`, tutuq `ʼ` stays (maʼno,
   taʼlim, şeʼr), `ng` stays two letters, `sʼh` stays (Isʼhoq). Write new
   UI text directly in the new alphabet: "Öquvçi", "Maşq qiliş", "Keyingi
   savol", "Öqituvçi", "Yöl", "Ğalaba", "Çiqiş". English text (Ingliz tili
   content) stays English. No automatic sh/ch conversion at runtime.
2. **Fast development priorities:** P0 first (§6), small commits, push to
   `main` every 20–30 min, `npm run check` before push, `npm run build`
   only before the freeze. Do not refactor working v1 code.
3. **Ownership** as in §5; edit only your paths. Need something else:
   use a mock, keep going, open an issue `[for-A]` / `[for-B]` / `[for-C]`.
4. Demo passwords may be hardcoded. API keys live only in `.env.local`
   and Vercel env (`GEMINI_API_KEYS`), never in git.
5. Best animations and a great UI: reuse brand components (`MathText`,
   `KnowledgeMap`, `MasteryRing`, `FadeIn`/`Stagger`, `celebrate`,
   backgrounds `Backdrop`), follow `DESIGN.md`.

## 3. "AI test from material" (agreed demo behaviour)

Teacher picks a lesson → drops a PDF/DOCX → the screen shows an animated
analysis (file read → pages → key terms found → questions drafted →
checked) for ~6–8 s → a ready test appears: the lesson's prepared
questions from the content bank (5), editable (change text, choices,
correct answer, delete, add). For a lesson the teacher created, the
draft is 5 template questions built from the lesson title. **No API call
is made.** Then "Öquvçilarga yuboriş" creates an assignment for the class.

## 4. Contracts (source of truth: `src/lib/types.ts`, v2 section)

**Content** (B): `src/content/subjects/<subjectId>/subject.json` =
`{ meta: SubjectMeta, graph: KnowledgeGraph, materials: MaterialSample[] }`
and `src/content/subjects/<subjectId>/questions.json` = `Question[]`
(`skillId` = lesson id). Loader `src/content/subjects/index.ts` exports
`subjects: SubjectContent[]` (Matematika first, built from the v1 graph
and bank), `subjectsById`, `lessonQuestions(subjectId, lessonId)`.

Subject ids: `matematika`, `ona-tili`, `ingliz-tili`, `biologiya`.
Lesson ids: `<subjectId>-01` … `<subjectId>-07` (Matematika keeps its
17 v1 skill ids). Question ids: `<lessonId>-01` … `-05`.

**Demo accounts** (A, `src/lib/auth-demo.ts`, hardcoded):

| login | parol | role | id | notes |
|---|---|---|---|---|
| `ustoz` | `ustoz123` | teacher | `t-dilnoza` | Dilnoza Karimova, class `6a` |
| `jasur` | `jasur123` | student | `s-jasur` | Jasur Toşmatov, class `6a` |
| `ona` | `ona123` | parent | `p-jasur` | Jasurning onasi, `childId: s-jasur` |

**Storage** (A): `src/lib/db/kv.ts` — a JSON document store
(`getDoc<T>(key)`, `setDoc(key, value)`, `updateDoc(key, fn)`) on
Postgres table `kv(key text primary key, value jsonb)` when
`DATABASE_URL` is set, memory otherwise. Keys: `users`,
`customSubjects`, `assignments`, `submissions`, `progress`. Seeded once
from C's `buildDemoV2()` (`src/lib/seed/demo-v2.ts`).

**HTTP API** (A; C reads):

| Route | Body → response |
|---|---|
| `POST /api/auth/login` | `{login,password}` → `{user}` + session cookie |
| `POST /api/auth/logout`, `GET /api/auth/me` | → `{user}` or 401 |
| `GET /api/subjects` | → `SubjectMeta[]` (default + teacher-made) |
| `GET /api/subjects/[id]` | → `SubjectContent` |
| `POST /api/subjects`, `POST /api/subjects/[id]/lessons` | teacher creates |
| `GET /api/assignments?classId=6a` or `?studentId=` | → `Assignment[]` |
| `POST /api/assignments` | teacher sends → `{assignment}` |
| `POST /api/submissions` | student answers → `{submission, progress}` |
| `GET /api/progress?classId=6a` or `?studentId=` | → `{progress: SubjectProgress[], history: ProgressPoint[], submissions: Submission[]}` |
| `GET /api/users?classId=6a`, `POST /api/users` | teacher lists/creates accounts |

## 5. Ownership (v2)

| Path | Owner |
|---|---|
| `src/lib/types.ts`, `src/lib/db/**`, `src/lib/auth*.ts`, `src/proxy.ts`, `src/app/api/{auth,subjects,assignments,submissions,progress,users}/**` | A |
| `src/app/login/**`, `src/app/student/**`, `src/app/parent/**`, `src/app/(student)/**` (v1 math flow) | A |
| `src/app/teacher/subjects/**`, `src/app/teacher/lessons/**`, `src/app/teacher/accounts/**` | A |
| `src/components/{brand,student,parent,lesson}/**`, `src/lib/uz.ts`, `src/app/layout.tsx`, `globals.css` | A |
| `src/content/**`, `public/demo-materials/**`, `scripts/validate-content.ts` | B |
| `src/app/page.tsx`, `src/app/teacher/{page,layout}.tsx`, `src/app/teacher/{student,worksheet}/**`, `src/components/{teacher,pitch}/**`, `src/lib/{teacher,seed}/**`, `src/app/api/teacher/**`, `docs/pitch/**` | C |

## 6. Priorities and timeline (T0 = plan pushed)

| When | Milestone |
|---|---|
| T+0:20 | A: contracts, kv store, alphabet + fonts pushed. C: Vercel + Neon live. B: first subject content. |
| T+1:00 | Login with demo accounts; student home with 4 subjects; C seed v2. |
| T+1:45 | Teacher upload → AI animation → send → student solves → teacher and parent see it (the demo loop). |
| T+2:15 | Parent maps + chart, teacher subject tabs, all UI in the new alphabet. |
| T+2:30 | **FREEZE.** Deploy, fix only. |
| T+2:45 | Rehearsal on the deployed URL; submit before T+3:00. |

**P0 (demo dies without it):** deploy, login + demo accounts, student
home + subject maps, upload→AI→send→solve loop, parent map, new alphabet.
**P1:** teacher creates subject/lesson, teacher creates accounts, parent
chart, teacher subject tabs. **P2:** everything else.

## 7. Demo script (3 min)

1. Landing → "Kiriş" → login `ustoz`: class overview by subject.
2. Biologiya → lesson → drop PDF → AI animation → edit one question → send.
3. Phone: login `jasur` → new test appears → solve → celebration.
4. Teacher screen updates; Matematika shows the v1 root-cause map.
5. Login `ona`: Jasur's maps for 4 subjects + progress chart.
