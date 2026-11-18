import { NextResponse } from "next/server";
import { z } from "zod";
import { guard, isResponse } from "@/lib/api/guard";
import { createTeacher, orgTeachers } from "@/lib/teachers";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await guard("org");
  if (isResponse(s)) return s;
  const list = await orgTeachers(s.orgId ?? "");
  return NextResponse.json(list.map((t) => ({ id: t.user.id, name: t.user.name, login: t.user.login, password: t.user.password, classes: t.classes.map((c) => c.name), students: t.studentIds.length })));
}

const Body = z.object({ name: z.string().trim().min(3).max(60) });

/** The organization creates a login and password for its teacher. */
export async function POST(req: Request) {
  const s = await guard("org");
  if (isResponse(s)) return s;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Öqituvçining ism va familiyasini kiriting" }, { status: 400 });
  const user = await createTeacher({ name: parsed.data.name, orgId: s.orgId });
  return NextResponse.json({ teacher: { id: user.id, name: user.name, login: user.login, password: user.password } });
}
