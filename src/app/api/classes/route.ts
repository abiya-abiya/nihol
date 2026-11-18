import { NextResponse } from "next/server";
import { z } from "zod";
import { guard, isResponse } from "@/lib/api/guard";
import { teacherOfClass } from "@/lib/auth-demo";
import { addClass, classStats, getUsers, listAssignments, listClasses, resolveClassId } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Teacher: all classes with counts and the active one. */
export async function GET() {
  const s = await guard("teacher");
  if (isResponse(s)) return s;
  const [classes, users, assignments, activeId] = await Promise.all([
    listClasses(),
    getUsers(),
    listAssignments({}),
    resolveClassId(s.classId),
  ]);
  return NextResponse.json({
    activeId,
    classes: classes.filter((c) => (teacherOfClass(c) ?? s.id) === s.id).map((c) => ({ ...c, ...classStats(c.id, users, assignments) })),
  });
}

const Body = z.object({
  name: z.string().trim().min(1).max(40),
  grade: z.number().int().min(1).max(11).nullish(),
});

export async function POST(req: Request) {
  const s = await guard("teacher");
  if (isResponse(s)) return s;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Sinf nomini kiriting" }, { status: 400 });
  const { name, grade } = parsed.data;
  if ((await listClasses()).some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    return NextResponse.json({ error: "Bu nomli sinf allaqaçon bor" }, { status: 409 });
  }
  const created = await addClass({ name, grade: grade ?? undefined, teacherId: s.id });
  return NextResponse.json({ class: { ...created, students: 0, parents: 0, tests: 0 } });
}
