import { NextResponse } from "next/server";
import { guard, isResponse } from "@/lib/api/guard";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS, encodeSession } from "@/lib/auth";
import { getClassGroup, setUserClass } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Teacher switches the active class; every teacher page and API follows the session's classId. */
export async function POST(_req: Request, ctx: RouteContext<"/api/classes/[id]/activate">) {
  const s = await guard("teacher");
  if (isResponse(s)) return s;
  const cls = await getClassGroup((await ctx.params).id);
  if (!cls) return NextResponse.json({ error: "Sinf topilmadi" }, { status: 404 });
  await setUserClass(s.id, cls.id);
  const res = NextResponse.json({ class: cls });
  res.cookies.set(SESSION_COOKIE, encodeSession({ ...s, classId: cls.id }), SESSION_COOKIE_OPTIONS);
  return res;
}
