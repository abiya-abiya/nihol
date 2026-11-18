import { NextResponse } from "next/server";
import { z } from "zod";
import { HOME, SESSION_COOKIE, SESSION_COOKIE_OPTIONS, encodeSession } from "@/lib/auth";
import { findUser } from "@/lib/store";
import { createTeacher } from "@/lib/teachers";

const Body = z.object({
  name: z.string().trim().min(3).max(60),
  login: z.string().trim().min(3).max(30).regex(/^[a-z0-9._-]+$/i),
  password: z.string().min(4).max(60),
});

/** Independent teacher sign-up (no organization). */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ism, login (lotin harflari) va kamida 4 belgili parol kiriting" }, { status: 400 });
  if (await findUser(parsed.data.login)) return NextResponse.json({ error: "Bu login band, boşqasini tanlang" }, { status: 409 });
  const user = await createTeacher(parsed.data);
  const res = NextResponse.json({ user: { id: user.id, role: user.role, name: user.name }, home: HOME.teacher });
  res.cookies.set(SESSION_COOKIE, encodeSession(user), SESSION_COOKIE_OPTIONS);
  return res;
}
