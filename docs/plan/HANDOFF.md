# Handoff — continue on another device (2026-11-18)

## State of main (`git log -1` should be at or after this file's commit)

Done by A (all pushed):
- v2 contracts (`src/lib/types.ts`), kv store (`src/lib/db/kv.ts`, table `kv`), app store (`src/lib/store.ts`).
- Login with roles: `/login`, `/api/auth/*`, `src/proxy.ts`. Demo accounts: `ustoz / ustoz123`, `jasur / jasur123`, `ona / ona123`.
- Student: `/student`, `/student/subject/[id]`, `/student/test/[id]`; Matematika card opens the v1 diagnostic flow.
- Teacher: `/teacher/subjects`, `/teacher/subjects/[id]`, `/teacher/lessons/[subjectId]/[lessonId]` (material upload → staged "AI" analysis → editable prepared questions → send).
- Parent: `/parent` (subject cards, lesson map, trend chart, recent results).
- New Uzbek alphabet (Ö Ğ Ş Ç, tutuq ʼ) in all A-owned UI.

Not done yet (owner in brackets):
- **Deploy** on Vercel + Neon (C1). After deploy run `npm run db:push` with the Neon `DATABASE_URL` (creates the `kv` table).
- **3 new subjects** Ona tili, Ingliz tili, Biologiya, 7 lessons × 5 questions, `src/content/subjects/**` (B1); then switch `src/lib/subjects.ts` to `export * from "@/content/subjects";` (A).
- Math content to the new alphabet (B2).
- `/teacher` overview: subject tabs + nav to Fanlar/Hisoblar (C3). Quick fix if C is late: wrap the page in `TeacherShell` from `src/components/lesson/teacher-shell.tsx`.
- Demo history for the parent chart: `buildDemoV2()` in `src/lib/seed/demo-v2.ts` (C2; currently a stub with only the 3 demo users).
- `/teacher/accounts` page (A7, P1). API `GET/POST /api/users` already exists.
- Landing + pitch updated to v2 (C4).

## Set up the new device

```
git clone https://github.com/abiya-abiya/si-tyutor.git
cd si-tyutor
npm install
# .env.local (never commit): GEMINI_API_KEYS=key1,key2   AUTH_SECRET=any-long-string
npm run dev     # http://localhost:3000/login
npm run check   # typecheck + content + tests
```

Claude Code skills: project skills are in `.claude/skills/` (frontend-design,
impeccable, motion-framer, ui-toolkit, ui-revamp, coordinator) and load
automatically when Claude starts in the repo folder. Plugins used here are
installed per machine:

```
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

Then tell Claude: "Men A rolidaman, docs/plan/HANDOFF.md dan davom et."
