#!/usr/bin/env node
// Sync this clone with origin/main and show what changed since the last sync.
// Usage: node scripts/sync.mjs [A|B|C]
// Works before the Next.js scaffold exists (no dependencies).
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const role = (process.argv[2] || "").toUpperCase();
const sh = (cmd, opts = {}) =>
  execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trim();
const tryRun = (cmd) => {
  try {
    return sh(cmd);
  } catch {
    return null;
  }
};

const gitDir = sh("git rev-parse --git-dir");
const marker = join(gitDir, "ildiz-last-sync");
const before = sh("git rev-parse HEAD");
const lastSync = existsSync(marker) ? readFileSync(marker, "utf8").trim() : before;

sh("git fetch origin --quiet");
try {
  execSync("git rebase --autostash origin/main", { stdio: "inherit" });
} catch {
  console.error(
    "\nREBASE CONFLICT. Run `git status`, resolve the conflicted files " +
      "(keep both sides' intent; never drop someone else's change), " +
      "`git add <files>`, then `git rebase --continue`. Ask the user if a conflict is in another role's file.",
  );
  process.exit(1);
}

const after = sh("git rev-parse HEAD");
const base = tryRun(`git merge-base ${lastSync} origin/main`) || lastSync;
const log = tryRun(`git log --oneline --no-decorate ${base}..origin/main`) || "";

console.log("\n=== New commits on main since your last sync ===");
if (!log) console.log("(none)");
for (const line of log.split("\n").filter(Boolean)) {
  console.log(line.includes("[contract]") ? `!! CONTRACT CHANGE: ${line}` : `   ${line}`);
}

const changed = (tryRun(`git diff --name-only ${base} origin/main`) || "").split("\n").filter(Boolean);
if (changed.some((f) => f.startsWith("docs/plan/") || f === "CLAUDE.md" || f === "DESIGN.md")) {
  console.log("\n!! Plan/docs changed: re-read the changed files under docs/plan/, CLAUDE.md, DESIGN.md.");
}
if (changed.includes("src/lib/types.ts")) {
  console.log("!! src/lib/types.ts changed: check that your code still matches the contracts.");
}
if (existsSync("package.json") && changed.some((f) => f === "package.json" || f === "package-lock.json")) {
  console.log("\nDependencies changed -> npm install");
  execSync("npm install --no-audit --no-fund", { stdio: "inherit" });
}

if (role && tryRun("gh --version")) {
  const issues = tryRun(`gh issue list --state open --search "[for-${role}] in:title" --limit 20`);
  console.log(`\n=== Open issues for role ${role} ===\n${issues || "(none or gh not authenticated)"}`);
}

writeFileSync(marker, sh("git rev-parse origin/main"));
console.log(`\nSynced: ${before.slice(0, 7)} -> ${after.slice(0, 7)} (origin/main ${sh("git rev-parse --short origin/main")})`);
