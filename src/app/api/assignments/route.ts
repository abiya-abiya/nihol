import { NextResponse } from "next/server";
import { z } from "zod";
import { guard, isResponse } from "@/lib/api/guard";
import { addAssignment, listAssignments } from "@/lib/store";
import type { Assignment, Question } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const s = await guard();
  if (isResponse(s)) return s;
  const u = new URL(req.url);
  const studentId =
    s.role === "student" ? s.id : s.role === "parent" ? s.childId : (u.searchParams.get("studentId") ?? undefined);
  const classId = u.searchParams.get("classId") ?? (s.role === "teacher" ? s.classId : undefined);
  return NextResponse.json(await listAssignments({ classId: studentId ? undefined : classId, studentId }));
}

const Q = z.object({
  id: z.string(),
  skillId: z.string(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  stem: z.string().min(1).max(800),
  choices: z
    .array(z.object({ id: z.enum(["a", "b", "c", "d"]), text: z.string().min(1).max(300), misconceptionId: z.string().optional() }))
    .length(4),
  correct: z.enum(["a", "b", "c", "d"]),
  explanation: z.string().max(1200).default(""),
  hint: z.string().max(400).default(""),
  source: z.enum(["bank", "generated", "ai"]),
});

const Body = z.object({
  subjectId: z.string(),
  lessonId: z.string(),
  title: z.string().trim().min(1).max(120),
  questions: z.array(Q).min(1).max(30),
  materialName: z.string().max(200).optional(),
  dueAt: z.string().optional(),
});

export async function POST(req: Request) {
  const s = await guard("teacher");
  if (isResponse(s)) return s;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Test maʼlumotlari töliq emas" }, { status: 400 });
  const a: Assignment = {
    id: `as-${Date.now().toString(36)}`,
    ...parsed.data,
    questions: parsed.data.questions as Question[],
    classId: s.classId ?? "6a",
    teacherId: s.id,
    createdAt: new Date().toISOString(),
    studentIds: [],
  };
  await addAssignment(a);
  return NextResponse.json({ assignment: a });
}
