import "server-only";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { kv } from "./schema";

/**
 * v2 document store: getDoc/setDoc/updateDoc on whole JSON collections.
 * Postgres `kv` table when DATABASE_URL is set, process memory otherwise.
 */
const g = globalThis as unknown as { __ildizKv?: Map<string, unknown> };
const mem = () => (g.__ildizKv ??= new Map());
const db = process.env.DATABASE_URL ? drizzle(neon(process.env.DATABASE_URL)) : null;

export async function getDoc<T>(key: string): Promise<T | null> {
  if (!db) return (mem().get(key) as T | undefined) ?? null;
  const [row] = await db.select().from(kv).where(eq(kv.key, key));
  return (row?.value as T | undefined) ?? null;
}

export async function setDoc<T>(key: string, value: T): Promise<void> {
  if (!db) {
    mem().set(key, value);
    return;
  }
  const now = new Date().toISOString();
  await db
    .insert(kv)
    .values({ key, value: value as unknown as object, updatedAt: now })
    .onConflictDoUpdate({ target: kv.key, set: { value: value as unknown as object, updatedAt: now } });
}

export async function updateDoc<T>(key: string, fallback: T, fn: (current: T) => T): Promise<T> {
  const next = fn((await getDoc<T>(key)) ?? fallback);
  await setDoc(key, next);
  return next;
}
