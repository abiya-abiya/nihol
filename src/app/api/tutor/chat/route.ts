import { NextResponse } from "next/server";
import { z } from "zod";
import { streamText, tutorStream } from "@/lib/ai/client";
import { fallbackChat } from "@/lib/ai/fallback";
import { TUTOR_SYSTEM, chatContext } from "@/lib/ai/prompts/tutor";
import { questions } from "@/lib/content";

const Body = z.object({
  skillId: z.string().max(60),
  question: z.object({ id: z.string().max(80) }).passthrough().optional(),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(600) }))
    .min(1)
    .max(12),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });
  const { skillId, messages } = parsed.data;
  const q = parsed.data.question ? questions.find((x) => x.id === parsed.data.question!.id) : undefined;
  if (messages[messages.length - 1].role !== "user") return NextResponse.json({ error: "last message must be from user" }, { status: 400 });

  // Context goes in front of the first user turn so the system prompt stays identical.
  const [first, ...rest] = messages;
  const withContext = [{ role: "user" as const, content: `${chatContext(skillId, q)}\n\nO'quvchi: ${first.content}` }, ...rest];
  return streamText(tutorStream({ system: TUTOR_SYSTEM, messages: withContext, maxTokens: 700 }, fallbackChat(skillId, q)));
}
