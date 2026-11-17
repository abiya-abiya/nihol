# Ildiz (SI-tyutor) — instructions for every Claude session in this repo

Hackathon project: an Uzbek AI tutor that finds the *root* of a student's
gaps in 5–6 grade fractions. Three people work in parallel, each with
their own Claude: roles **A** (60%: app, engine, AI, infra), **B** (20%:
content and generators), **C** (20%: teacher dashboard, landing, pitch,
deploy). Speed matters more than polish of internals; the demo UI must
be excellent.

## Start of every session (do this before anything else)

1. Find your role. If the user has not said "A", "B" or "C" in this
   session, ask once: "Siz qaysi roldasiz: A, B yoki C?"
2. Run `node scripts/sync.mjs <ROLE>` (fetch + rebase on `origin/main`, shows
   what changed on main since your last sync, `[contract]` commits
   highlighted, runs `npm install` if the lockfile changed, lists open
   issues for your role).
3. Read `docs/plan/00-overview.md` (first session only, or when sync
   shows it changed) and your role file `docs/plan/<ROLE>.md`.
4. Pick the first unchecked task in your role file whose "Needs" are met
   and start working on it immediately. Do not wait for confirmation;
   the plan is approved. Tell the user in one line which task you started.

## Working rules

- **Language:** talk to the user in the language they write in (usually
  Uzbek). Code, identifiers, comments and commit messages in English. All
  UI text in Uzbek (Latin script), see `docs/plan/00-overview.md` §5.
- **Ownership:** edit only paths your role owns (overview §4). Need
  something from another role? Use a mock or a local throwaway version
  in your own path and open an issue:
  `gh issue create --title "[for-A] <what>" --body "<why, exact interface>"`.
- **Contract changes:** `src/lib/types.ts` and the API table in the
  overview are shared. Additive changes (new type, new optional field)
  are allowed for anyone in a separate commit whose message starts with
  `[contract]`. Renames/removals need the team's OK first (ask the user).
- **Dependencies:** A installs the planned packages in A1. If you must add
  one: `node scripts/sync.mjs <ROLE>`, then `npm install <pkg>`, then commit
  ONLY `package.json` + `package-lock.json` as `chore(deps): add <pkg>`
  and push at once. On a lockfile conflict take `origin/main`'s lockfile,
  rerun `npm install <pkg>`, commit.
- **Main moved?** After every sync, read the new commits. If a
  `[contract]` commit touched something you use, adapt your code before
  continuing.
- **Tests:** keep them minimal (user decision: speed first). Required
  only: engine unit tests (A), `npm run validate:content` (B). Never
  block on writing extra tests.
- **Research:** you may search the web and read docs freely (Uzbek
  curriculum, terminology, library docs, statistics for the pitch).
- **UI work:** use the vendored skills in `.claude/skills/`
  (frontend-design, impeccable, motion-framer) and the `shadcn` and
  `playwright` MCP servers. Follow `DESIGN.md`. Look at the rendered
  result (screenshots at 390 px and 1440 px) before marking a UI task done.
- **When your tasks run out or you are blocked:** do the "If blocked or
  done" list at the bottom of your role file. Never start another role's
  task without the user asking.

## Git workflow (everyone pushes to `main`, no PRs)

- Commit small and often (every finished step that builds).
  Conventional messages: `feat(student): ...`, `fix(engine): ...`,
  `content: ...`, `docs: ...`.
- Before every push: `node scripts/sync.mjs <ROLE>` then `npm run check`
  (typecheck + content validation + unit tests). Push with
  `git push origin HEAD:main`. If the push is rejected, sync again and retry.
- Run `npm run build` before pushing anything that touches routing,
  layouts or config, and before each milestone.
- Never `git push --force`, never rewrite pushed history, never commit
  `.env*` files (except `.env.example`) or secrets.
- Main broken by your push? Fixing it is your top priority.
- After finishing a task: tick its checkbox in YOUR role file, commit
  with the code, push.

## Commands (available after A1)

```
npm run dev              # local dev server, http://localhost:3000
npm run check            # tsc --noEmit + validate:content + vitest run
npm run build            # production build
npm run validate:content # B's content checks
npm test                 # vitest
node scripts/sync.mjs A  # sync with main as role A (works before A1 too)
```

## Secrets

`GEMINI_API_KEYS` and `DATABASE_URL` go in `.env.local` (git-ignored)
and in Vercel env settings. Get them from the team chat, not from git.

## MCP servers on Windows

`.mcp.json` starts `shadcn` and `playwright` with `npx`. If they fail to
start on Windows, add local copies wrapped in `cmd /c`:
`claude mcp add --scope local playwright -- cmd /c npx -y @playwright/mcp@latest`
and the same for `shadcn` (`cmd /c npx -y shadcn@latest mcp`). Playwright
may need `npx playwright install chromium` once.

## Next.js 16 notes

This is Next.js 16 (React 19, Tailwind v4, shadcn `radix-nova`, `cn` from
the `cn` package). APIs differ from older versions: read `AGENTS.md` and
the bundled docs in `node_modules/next/dist/docs/` before using a Next API
you are unsure about. `cacheComponents` is OFF in `next.config.ts`, so
route handlers run per request and `export const dynamic = "force-dynamic"`
works. Route `params` are Promises (`const { id } = await ctx.params`).
Client components that call `useSearchParams()` must sit inside `<Suspense>`.
