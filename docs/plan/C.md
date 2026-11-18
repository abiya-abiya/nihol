# Role C — deploy, seed, teacher overview, landing, pitch (15%)

Read `docs/plan/00-overview.md` first. Deploy is the most urgent task of
the whole team: start it before anything else.

### C1. Deploy now — target T+0:30 (P0)
- [ ] Vercel (not Netlify: Next.js 16 works on Vercel with zero config).
  Fastest: Abdulloh (repo owner `abiya-abiya`) signs in to vercel.com with
  GitHub → Add New Project → Import `si-tyutor` → Deploy (auto-deploys
  every push to `main`). Without him: `npx vercel login` then
  `npx vercel --prod` from your clone (redeploy after merges).
- [ ] Storage → Neon Postgres (free) → `DATABASE_URL`. Env vars:
  `GEMINI_API_KEYS` (from the team chat), `AI_MODE=live`,
  `DEMO_CLASS_ID=6a`, `NEXT_PUBLIC_APP_URL=https://<project>.vercel.app`,
  `AUTH_SECRET=<any long string>`. Then `DATABASE_URL=... npm run db:push`.
- [ ] Put the URL in `docs/pitch/links.md` and the team chat. Redeploy and
  smoke-test after each milestone (T+1:00, T+1:45, T+2:15, freeze).

### C2. Demo data v2 — target T+1:15 (P0)
- [x] `src/lib/seed/demo-v2.ts`: `buildDemoV2(now?: Date): DemoV2` (users, assignments, submissions,
  progress, history — see `src/lib/types.ts`) for class `6a`: the 24 v1 students (ids from the v1
  seed) **plus `s-jasur` (Jasur Toşmatov)** with a student `User` each
  (login = first name lowercase + number, password `parol123`); 4 subjects
  of progress per student built with `answerPractice`-style BKT updates
  from B's questions; 6–10 past assignments over the last 10 days with
  submissions (so the parent chart has history). Use `@/content/subjects`
  (stub a tiny version locally if B has not pushed yet). Names in the new
  alphabet (Şahnoza, Çinara…).

### C3. Teacher overview v2 — target T+1:45 (P0/P1)
- [ ] `/teacher`: subject tabs (Matematika first, B's colours/icons). Per
  subject: class heatmap students × lessons (reuse your heatmap; data from
  `GET /api/progress?classId=6a`), assignments list with completion % and
  average score (`GET /api/assignments?classId=6a`), live polling as now.
- [ ] Teacher layout nav: "Sinf" (`/teacher`), "Fanlar"
  (`/teacher/subjects`, A builds), "Hisoblar" (`/teacher/accounts`, A
  builds), user name + "Çiqiş" (`POST /api/auth/logout`).
- [ ] All C-owned UI text in the new alphabet.

### C4. Landing + pitch — target T+2:15 (P1)
- [ ] Landing: Ildiz = tayyor vosita for teachers, 4 subjects, 3 roles,
  big "Kiriş" button → `/login`, keep the QR to `/start` ("Sinab köriş").
  New alphabet everywhere.
- [ ] Update slides, `script.md`, `qa.md` to v2 (3 roles, upload→test,
  parent map, new alphabet; AI provider is Gemini now, not Claude — fix
  the cost estimate).

### C5. Rehearsal — T+2:30 to T+2:50
- [ ] Two full runs of the §7 demo on the deployed URL (laptop + phone),
  file `[for-A]` issues for blockers, record a backup screen video.
