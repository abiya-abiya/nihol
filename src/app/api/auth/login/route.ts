import { NextResponse } from "next/server";
import { z } from "zod";
import { HOME, SESSION_COOKIE, SESSION_COOKIE_OPTIONS, encodeSession } from "@/lib/auth";
import { findUser, resolveClassId } from "@/lib/store";

const Body = z.object({ login: z.string().trim().min(1).max(60), password: z.string().min(1).max(100) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Login va parolni kiriting" }, { status: 400 });
  const user = await findUser(parsed.data.login);
  if (!user || user.password !== parsed.data.password) {
    return NextResponse.json({ error: "Login yoki parol notöğri" }, { status: 401 });
  }
  const res = NextResponse.json({ user: { id: user.id, role: user.role, name: user.name }, home: HOME[user.role] });
  // A teacher always lands in an existing class (their last chosen one, or the first if it was deleted).
  const classId = user.role === "teacher" ? await resolveClassId(user.classId) : user.classId;
  res.cookies.set(SESSION_COOKIE, encodeSession({ ...user, classId }), SESSION_COOKIE_OPTIONS);
  return res;
}
