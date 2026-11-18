import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, SessionUser, User } from "@/lib/types";

/** Demo-grade session: signed cookie with the user's id, role and name. */
export const SESSION_COOKIE = "ildiz_session";
const SECRET = process.env.AUTH_SECRET || "ildiz-hackathon-demo-secret-2026";

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const sign = (payload: string) => createHmac("sha256", SECRET).update(payload).digest("base64url");

export const SESSION_COOKIE_OPTIONS = { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 } as const;

export function encodeSession(u: SessionUser | User): string {
  const payload = b64(JSON.stringify({ id: u.id, role: u.role, name: u.name, classId: u.classId, childId: u.childId, orgId: u.orgId }));
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const got = Buffer.from(sig);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  return decodeSession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function requireRole(role: Role): Promise<SessionUser> {
  const s = await getSession();
  if (!s || s.role !== role) redirect(`/login?next=${role}`);
  return s;
}

export const HOME: Record<Role, string> = { teacher: "/teacher", student: "/student", parent: "/parent", org: "/org" };
