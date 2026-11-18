import { NextResponse } from "next/server";
import { z } from "zod";
import { guard, isResponse } from "@/lib/api/guard";
import { addSubmission, getAssignment, listSubmissions } from "@/lib/store";
import type { Submission } from "@/lib/types";

const Body = z.object({
  assignmentId: z.string(),
  answers: z.array(z.object({ questionId: z.string(), choiceId: z.enum(["a", "b", "c", "d"]) })).min(1).max(30),
});

export async function POST(req: Request) {
  const s = await guard("student");
  if (isResponse(s)) return s;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Javoblar töliq emas" }, { status: 400 });
  const a = await getAssignment(parsed.data.assignmentId);
  if (!a) return NextResponse.json({ error: "Test topilmadi" }, { status: 404 });
  const already = (await listSubmissions({ studentIds: [s.id] })).find((x) => x.assignmentId === a.id);
  if (already) return NextResponse.json({ submission: already, duplicate: true });
  const answers = parsed.data.answers.map((x) => ({
    ...x,
    correct: a.questions.find((q) => q.id === x.questionId)?.correct === x.choiceId,
  }));
  const sub: Submission = {
    id: `sb-${Date.now().toString(36)}`,
    assignmentId: a.id,
    studentId: s.id,
    subjectId: a.subjectId,
    lessonId: a.lessonId,
    answers,
    score: answers.filter((x) => x.correct).length / answers.length,
    submittedAt: new Date().toISOString(),
  };
  const progress = await addSubmission(sub);
  return NextResponse.json({ submission: sub, progress });
}
