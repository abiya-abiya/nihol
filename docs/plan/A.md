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

### Handoff (2026-11-18) — continue on another device
Done after A7 (all on `main`):
- Multi-class CRUD: `/teacher/classes`, header class switcher,
  `GET/POST /api/classes`, `PATCH/DELETE /api/classes/[id]`,
  `POST /api/classes/[id]/activate`; `[contract]` `ClassGroup` type.
  Demo class `6a` can be renamed, not deleted; deleting a class removes its
  students, parents, tests and results.
- Knowledge map nodes are glass faces (`src/components/student/knowledge-map.tsx`):
  liquid fills to mastery, mouth smiles with it, untested = sleeping face.
- Rebrand to **Nihol** (logo = sprout in soil, favicon, apple icon, titles,
  landing, login, worksheet, tutor prompt). "Ildiz" stays only as the
  root-cause concept (Ildiz tahlili, "ildiz şu yerda!").
- Local address: `http://nihol.localhost:3000` (QR codes follow the host;
  `allowedDevOrigins` set for dev).

Open:
- [x] Netlify deploy is live at https://niholsi.netlify.app (2026-11-18): pages 200, protected areas redirect to /login, 4 subjects, demo history; end-to-end check teacher → student → parent consistent across 13 reads (data persists).
- [ ] Vercel production is still `si-tyutor.vercel.app`, deployed manually by C
  (`npx vercel --prod`).
- [ ] GitHub repo rename/description needs the owner (our account has WRITE only).

Setup on a new device: clone, `npm install`, put the team's `.env.local`
(not in git), `node scripts/sync.mjs A`, `npm run dev` → `http://nihol.localhost:3000`.
Demo logins: ustoz/ustoz123, jasur/jasur123, ona/ona123.
