import { NextResponse } from "next/server";
import { z } from "zod";
import { guard, isResponse } from "@/lib/api/guard";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS, encodeSession } from "@/lib/auth";
import { DEFAULT_CLASS, deleteClass, listClasses, resolveClassId, setUserClass, updateClass } from "@/lib/store";

export const dynamic = "force-dynamic";

const Patch = z.object({
  name: z.string().trim().min(1).max(40).optional(),
  grade: z.number().int().min(1).max(11).nullish(),
});

/** Teacher renames a class or changes its grade. */
export async function PATCH(req: Request, ctx: RouteContext<"/api/classes/[id]">) {
  const s = await guard("teacher");
  if (isResponse(s)) return s;
  const { id } = await ctx.params;
  const parsed = Patch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Sinf nomini kiriting" }, { status: 400 });
  const { name, grade } = parsed.data;
  if (name && (await listClasses()).some((c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase())) {
    return NextResponse.json({ error: "Bu nomli sinf allaqaçon bor" }, { status: 409 });
  }
  const updated = await updateClass(id, { name, grade });
  return updated ? NextResponse.json({ class: updated }) : NextResponse.json({ error: "Sinf topilmadi" }, { status: 404 });
}

/** Teacher deletes a class with its accounts, tests and results. The demo class stays. */
export async function DELETE(_req: Request, ctx: RouteContext<"/api/classes/[id]">) {
  const s = await guard("teacher");
  if (isResponse(s)) return s;
  const { id } = await ctx.params;
  if (id === DEFAULT_CLASS.id) {
    return NextResponse.json({ error: "Demo sinfni öçirib bölmaydi, faqat nomini özgartiriş mumkin" }, { status: 400 });
  }
  const removed = await deleteClass(id);
  if (!removed) return NextResponse.json({ error: "Sinf topilmadi" }, { status: 404 });
  const wasActive = s.classId === id;
  const activeId = await resolveClassId(wasActive ? undefined : s.classId);
  const res = NextResponse.json({ removed, activeId });
  if (wasActive) {
    await setUserClass(s.id, activeId);
    res.cookies.set(SESSION_COOKIE, encodeSession({ ...s, classId: activeId }), SESSION_COOKIE_OPTIONS);
  }
  return res;
}
