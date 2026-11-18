# Role B — content in the new alphabet (15%)

Read `docs/plan/00-overview.md` §2–§4 first. Work fast: Claude drafts, you
check the facts and the Uzbek. Push after every subject.

### B1. Three new subjects — target T+1:00 (P0)
- [ ] `src/content/subjects/{ona-tili,ingliz-tili,biologiya}/subject.json`:
  `meta` (`id`, `name`, `short`, `color`, `icon` = a lucide icon name,
  `order` 2/3/4, `description`), `graph` (7 lessons for grade 6, ids
  `<subjectId>-01`…`-07`, sensible `prerequisites` so the map has
  branches, `entrySkills` = the last 1–2 lessons), `materials` (one
  `MaterialSample` per lesson: plausible `fileName` like
  `Biologiya_6-sinf_Hujayra.pdf`, `pages`, 1-sentence `summary`).
  Colours: ona-tili `#be185d`, ingliz-tili `#7c3aed`, biologiya `#0e7490`.
  Icons: `book-open`, `languages`, `leaf`.
- [ ] `questions.json` per subject: 5 questions per lesson (35), 4 choices,
  difficulties 1,2,2,3,3, `explanation`, `hint`, `source: "bank"`. All
  Uzbek text in the **new alphabet** (Ö Ğ Ş Ç, tutuq ʼ). Ingliz tili:
  English sentences stay English, instructions in Uzbek.
- [ ] `src/content/subjects/index.ts`: export `subjects: SubjectContent[]`
  with Matematika first (meta `{ id: "matematika", name: "Matematika",
  short: "Matematika", color: "#1d4ed8", icon: "sigma", order: 1, … }`,
  graph and questions from the existing `@/content` exports, materials for
  3–4 math lessons), plus `subjectsById` and
  `lessonQuestions(subjectId, lessonId): Question[]`.
- [ ] Extend `scripts/validate-content.ts` to check the new files (ids,
  4 choices, correct exists, prerequisites exist, 5 questions per lesson).

### B2. Math content to the new alphabet — target T+1:30 (P0)
- [ ] Script-convert `src/content/{graph,misconceptions,glossary,tutor-examples}.json`
  and `src/content/questions/*.json` text fields: `oʻ/o'→ö`, `gʻ/g'→ğ`,
  `sh→ş`, `ch→ç` (with capitals), other apostrophes → `ʼ`. Never touch ids.
  Hand-check words where s+h or c+h are separate sounds. Validator green.

### B3. Demo material files — target T+1:45 (P1)
- [ ] 3 short real files in `public/demo-materials/` that match the
  `materials` entries of the demo lessons (one Biologiya PDF, one Ona tili
  DOCX, one Matematika PDF; 1–3 pages each, made in Word/Google Docs).

### B4. QA on the deployed URL — after T+2:15
- [ ] Log in as `jasur`, open every new subject map and one test per
  subject: typos, alphabet, wrapping. Fix content, push.

## If done early
More realistic `materials` summaries; a 6th question for the demo lessons;
proofread C's and A's UI strings and send fixes as issues.
