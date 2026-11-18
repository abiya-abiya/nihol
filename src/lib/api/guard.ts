import "server-only";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import type { Role, SessionUser } from "@/lib/types";

/** Returns the session or a 401/403 response. */
export async function guard(...roles: Role[]): Promise<SessionUser | NextResponse> {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Avval tizimga kiring" }, { status: 401 });
  if (roles.length && !roles.includes(s.role)) return NextResponse.json({ error: "Ruxsat yöq" }, { status: 403 });
  return s;
}

export const isResponse = (x: unknown): x is NextResponse => x instanceof NextResponse;

export const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30) || "fan";
