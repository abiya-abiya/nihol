# Handoff — continue on another device (updated 2026-11-18 evening)

## State of main

Everything below is on `main` and live after the next Netlify deploy
(https://niholsi.netlify.app). Details per role: `docs/plan/A.md`, `B.md`, `C.md`.

- **Roles:** maktab (taşkilot), öqituvçi, öquvçi, ota‑ona. Login `/login`, role guard `src/proxy.ts`.
- **Demo accounts:**
  | Role | Login / password | Notes |
  |---|---|---|
  | Organization | `maktab / maktab123` | 45-maktab, `/org` teacher effectiveness |
  | Teacher | `ustoz / ustoz123` | Dilnoza, classes 6-A and 6-B |
  | Teacher | `nodira / nodira123`, `bobur / bobur123` | 5-A, 7-A |
  | Student | `jasur / jasur123` | 6-A |
  | Parent | `ona / ona123` | Jasur's mother |
- **Subjects:** Matematika (v1 diagnostic, 17 skills, root-cause trace, SI tutor) plus Ona tili,
  Ingliz tili, Biologiya, Kimyo (7 lessons × 5 questions each). Teachers add subjects and lessons.
- **Teacher:** classes CRUD and switcher (own classes only), accounts, material upload with staged
  "AI" analysis → editable prepared questions → send, period stats (Hafta / Oy / Çorak), Ildiz tahlili (maths).
- **Organization:** creates teacher logins; sees each teacher's average student mastery, test score,
  tests sent and a period chart with teachers as rows.
- **Independent teacher:** signs up on `/login` («Öqituvçi sifatida röyxatdan ötiş»).
- **Landing:** QR opens the landing page; hero example cycles three subjects; chalk knowledge-map background.
- **Data:** kv document store on Postgres (`DATABASE_URL`) or memory. New demo accounts are added to
  existing data automatically on first request; «Demo holatini tiklaş» resets everything.
- **Alphabet:** all UI in the new Uzbek alphabet (Ö Ğ Ş Ç, tutuq ʼ).

## Open

- Redeploy Netlify after the latest commits; then check `/org`, `maktab` login and the landing QR.
- Paper background (`bolak`) still shows fraction pieces only; mixed-subject doodles approved next.
- Team names in `docs/pitch/links.md` and `src/components/pitch/sections.tsx` (TEAM).
- Rehearse `docs/pitch/script.md` once end to end on a phone.
- After the hackathon: rotate Gemini keys and GitHub tokens.

## Set up the new device

```
git clone https://github.com/abiya-abiya/si-tyutor.git
cd si-tyutor
npm install
# .env.local (never commit): GEMINI_API_KEYS=key1,key2   AUTH_SECRET=any-long-string
npm run dev     # http://localhost:3000/login
npm run check   # typecheck + content + tests
```

Note: if the dev server keeps reloading the page in a loop, use a production build
(`npx next build && npx next start`) for checks.

Claude Code skills: project skills are in `.claude/skills/` (frontend-design,
impeccable, motion-framer, ui-toolkit, ui-revamp, coordinator) and load
automatically when Claude starts in the repo folder. Plugins used here are
installed per machine:

```
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

Then tell Claude: "Men A rolidaman, docs/plan/HANDOFF.md dan davom et."
