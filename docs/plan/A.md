# Role A — platform, roles, student/parent/teacher flows (70%)

Read `docs/plan/00-overview.md`. Inline execution, push every task.

### A1. Contracts and foundations — T+0:20 (P0)
- [x] v2 types in `src/lib/types.ts`; `src/lib/db/kv.ts` (memory + Postgres
  `kv` table in `schema.ts`); `src/lib/auth-demo.ts` (3 demo users);
  `normalizeUz` → new alphabet for `oʻ/gʻ` only; fonts get `latin-ext`
  back (Ğ Ş); seed stub `src/lib/seed/demo-v2.ts` until C lands.

### A2. Auth — T+0:50 (P0)
- [x] `src/lib/auth.ts` (HMAC-signed cookie `ildiz_session`, `getSession()`,
  `requireRole()`), `/api/auth/{login,logout,me}`, `src/proxy.ts` role
  redirects, `/login` page with demo-account chips (Öqituvçi, Öquvçi,
  Ota-ona) and a great animated screen; redirect by role.

### A3. Data API — T+1:10 (P0)
- [x] `/api/subjects`, `/api/subjects/[id]`, `/api/assignments`,
  `/api/submissions` (score + BKT progress update per lesson),
  `/api/progress`, `/api/users` on the kv store, seeded from `buildDemoV2()`.

### A4. Student — T+1:30 (P0)
- [x] `/student`: greeting, new tests inbox, subject cards (Matematika first
  with "Diagnostika" CTA into the v1 flow), mastery rings.
- [x] `/student/subject/[id]`: lesson knowledge map + lesson list;
  `/student/test/[assignmentId]`: solve with `QuestionCard`, result screen
  with celebration and per-question review.
- [x] v1 math flow uses the logged-in student (id `s-jasur`).

### A5. Teacher content tools — T+2:00 (P0)
- [x] `/teacher/subjects`: subject grid + "Yangi fan" dialog.
- [x] `/teacher/subjects/[id]`: lesson map + list + "Yangi dars".
- [x] `/teacher/lessons/[subjectId]/[lessonId]`: material drop zone → AI
  analysis animation (6–8 s, staged) → editable 5 questions → "Öquvçilarga
  yuboriş" → success toast + link to `/teacher`.

### A6. Parent — T+2:15 (P0)
- [x] `/parent`: child header, subject tabs with `KnowledgeMap` (lessons as
  nodes), mastery ring per subject, progress line chart (shadcn chart),
  recent results.

### A7. Accounts + alphabet pass — T+2:25 (P1)
- [x] `/teacher/accounts`: list class accounts, create student (+ parent)
  with generated login/password, copy button.
- [x] Convert every A-owned UI string to the new alphabet; freeze; deploy check.
