import { NextResponse } from "next/server";
import { z } from "zod";
import { guard, isResponse } from "@/lib/api/guard";
import { addLesson, getSubject } from "@/lib/store";
import type { Skill } from "@/lib/types";

const Body = z.object({
  title: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).default(""),
  prerequisites: z.array(z.string()).default([]),
});

export async function POST(req: Request, ctx: RouteContext<"/api/subjects/[id]/lessons">) {
  const s = await guard("teacher");
  if (isResponse(s)) return s;
  const { id } = await ctx.params;
  const subject = await getSubject(id);
  if (!subject) return NextResponse.json({ error: "Fan topilmadi" }, { status: 404 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dars nomini kiriting" }, { status: 400 });
  const n = subject.graph.skills.length + 1;
  const last = subject.graph.skills[subject.graph.skills.length - 1];
  const lesson: Skill = {
    id: `${id}-${String(n).padStart(2, "0")}-${Date.now().toString(36).slice(-4)}`,
    title: parsed.data.title,
    short: parsed.data.title.slice(0, 18),
    grade: 6,
    prerequisites: parsed.data.prerequisites.length ? parsed.data.prerequisites : last ? [last.id] : [],
    description: parsed.data.description || parsed.data.title,
  };
  await addLesson(id, lesson);
  return NextResponse.json({ lesson });
}
