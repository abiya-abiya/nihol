import "server-only";
import type { Repo } from "@/lib/types";
import { buildDemoSeed } from "@/lib/seed/demo-class";
import { MemoryRepo } from "./memory";
import { PgRepo } from "./pg";

export const DEMO_CLASS_ID = process.env.DEMO_CLASS_ID || "6a";

const g = globalThis as unknown as { __ildizRepo?: Repo; __ildizSeeded?: Promise<void> };

/** Postgres when DATABASE_URL is set, otherwise an in-memory store (survives hot reload). */
export function getRepo(): Repo {
  if (!g.__ildizRepo) {
    g.__ildizRepo = process.env.DATABASE_URL ? new PgRepo(process.env.DATABASE_URL) : new MemoryRepo();
  }
  return g.__ildizRepo;
}

/** Load the demo class once per server process if it is missing. Call before reading class data. */
export function ensureDemoClass(): Promise<void> {
  g.__ildizSeeded ??= (async () => {
    const repo = getRepo();
    if (!(await repo.getClass(DEMO_CLASS_ID))) await repo.seedClass(buildDemoSeed());
  })().catch((err) => {
    g.__ildizSeeded = undefined;
    throw err;
  });
  return g.__ildizSeeded;
}
