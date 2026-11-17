import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDemoClass, getRepo } from "@/lib/db";
import type { CreateStudentResponse } from "@/lib/types";

const Body = z.object({
  name: z.string().trim().min(1).max(40),
  classId: z.string().trim().min(1).max(20),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });
  await ensureDemoClass();
  const student = await getRepo().createStudent(parsed.data);
  return NextResponse.json({ student } satisfies CreateStudentResponse);
}
