import { NextResponse } from "next/server";
import { z } from "zod";
import { streamText, tutorStream } from "@/lib/ai/client";
import { fallbackExplanation } from "@/lib/ai/fallback";
import { TUTOR_SYSTEM, explainMessage } from "@/lib/ai/prompts/tutor";
import { questions } from "@/lib/content";
import type { Question } from "@/lib/types";

const ChoiceSchema = z.object({
  id: z.enum(["a", "b", "c", "d"]),
  text: z.string().max(300),
  misconceptionId: z.string().max(60).optional(),
});
const QuestionSchema = z.object({
  id: z.string().max(80),
  skillId: z.string().max(60),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  stem: z.string().max(800),
  choices: z.array(ChoiceSchema).length(4),
  correct: z.enum(["a", "b", "c", "d"]),
  explanation: z.string().max(1200),
  hint: z.string().max(400),
  source: z.enum(["bank", "generated", "ai"]),
});
const Body = z.object({
  question: QuestionSchema,
  choiceId: z.enum(["a", "b", "c", "d"]),
  studentName: z.string().trim().max(40).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });
  const { choiceId, studentName } = parsed.data;
  // Trust our own bank over the client's copy.
  const q: Question = questions.find((x) => x.id === parsed.data.question.id) ?? (parsed.data.question as Question);
  return streamText(
    tutorStream(
      { system: TUTOR_SYSTEM, messages: [{ role: "user", content: explainMessage(q, choiceId, studentName) }] },
      fallbackExplanation(q, choiceId),
    ),
  );
}
