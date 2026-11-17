import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDemoClass, getRepo } from "@/lib/db";
import type { SaveProgressResponse, StudentSnapshot } from "@/lib/types";

const AttemptSchema = z.object({
  id: z.string().min(1),
  studentId: z.string(),
  questionId: z.string().min(1),
  skillId: z.string().min(1),
  choiceId: z.enum(["a", "b", "c", "d"]),
  correct: z.boolean(),
  misconceptionId: z.string().nullable(),
  mode: z.enum(["diagnostic", "practice"]),
  ts: z.string().min(1),
});

const Body = z.object({
  attempts: z.array(AttemptSchema).max(200),
  snapshot: z
    .object({ skills: z.record(z.string(), z.unknown()), path: z.array(z.unknown()), updatedAt: z.string() })
    .passthrough(),
  student: z
    .object({ id: z.string(), name: z.string().trim().min(1).max(40), classId: z.string().min(1), createdAt: z.string() })
    .optional(),
});

export async function POST(req: Request, ctx: RouteContext<"/api/students/[id]/progress">) {
  const { id } = await ctx.params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const repo = getRepo();
  if (!(await repo.getStudent(id))) {
    const s = parsed.data.student;
    if (!s || s.id !== id) return NextResponse.json({ error: "unknown student" }, { status: 404 });
    await ensureDemoClass();
    await repo.createStudent(s); // created offline, syncing now
  }
  await repo.saveProgress(id, parsed.data.attempts, parsed.data.snapshot as unknown as StudentSnapshot);
  return NextResponse.json({ ok: true } satisfies SaveProgressResponse);
}
