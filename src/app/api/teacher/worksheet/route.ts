import { NextResponse } from "next/server";
import { z } from "zod";
import { aiEnabled, generateJson } from "@/lib/ai/client";
import { WORKSHEET_SYSTEM, WorksheetTextSchema, type WorksheetText, worksheetUserPrompt } from "@/lib/ai/prompts/worksheet";
import { misconceptionsById, skillsById } from "@/lib/content";
import { getRepo } from "@/lib/db";
import { buildWorksheetTasks, generateWorksheetTasks, wordProblemSeeds } from "@/lib/teacher/worksheet-items";
import type { Worksheet } from "@/lib/types";
import { normalizeUz } from "@/lib/uz";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Body = z.object({
  classId: z.string().trim().min(1).max(20),
  skillIds: z.array(z.string()).min(1).max(4),
  misconceptionIds: z.array(z.string()).max(6).default([]),
  count: z.number().int().min(2).max(12).optional(),
});

const AI_TIMEOUT_MS = 25_000;

/** Every [[...]] fraction of the computation must appear in the AI's story, or we drop the story. */
function usesNumbers(stem: string, expr: string): boolean {
  const tokens = expr.match(/\[\[[^\]]+\]\]|\d+/g) ?? [];
  return tokens.every((t) => stem.includes(t));
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });
  const { classId, misconceptionIds } = parsed.data;
  const skillIds = parsed.data.skillIds.filter((id) => skillsById[id]);
  if (!skillIds.length) return NextResponse.json({ error: "unknown skills" }, { status: 400 });
  const count = parsed.data.count ?? 8;
  const seed = Number(new URL(req.url).searchParams.get("seed")) || 1;

  const tasks = buildWorksheetTasks(skillIds, count, seed);
  const root = skillsById[skillIds[0]];
  const others = skillIds.slice(1).map((id) => skillsById[id]);
  const mis = misconceptionIds.map((id) => misconceptionsById[id]).filter(Boolean);

  const classRoom = await getRepo()
    .getClass(classId)
    .catch(() => null);
  const className = classRoom?.name ?? classId;

  // Template text (always available, used when AI is off or fails).
  const template: WorksheetText = {
    title: `Maşq varaqasi: ${root.title}`,
    intro: `Bugun «${root.title}» mavzusini mustahkamlaymiz. Har bir misolni şoşilmay yeç va javobni çiziqqa yoz.`,
    teacherNotes: mis.length
      ? `Bu guruhda köp uçragan xato: ${mis[0].title.toLowerCase()} (${mis[0].example}). ${mis[0].remedy}`
      : `Bu guruhning ildiz böşliği — ${root.title}. Avval birinçi misollarni birga yeçib köring.`,
    wordProblems: [],
  };

  let text = template;
  let aiStories: Array<{ stem: string; answer: string; skillId: string }> = [];

  if (aiEnabled()) {
    const seeds = wordProblemSeeds(skillIds, seed, 2);
    const out = await generateJson(WorksheetTextSchema, {
      system: WORKSHEET_SYSTEM,
      user: worksheetUserPrompt({
        rootSkill: root,
        otherSkills: others,
        misconceptions: mis,
        className,
        computations: seeds.map((s) => ({ expr: s.expr!, answer: s.answer })),
      }),
      maxTokens: 4000,
      timeoutMs: AI_TIMEOUT_MS,
    });
    if (out) {
      text = {
        title: out.title.trim() || template.title,
        intro: out.intro.trim() || template.intro,
        teacherNotes: out.teacherNotes.trim() || template.teacherNotes,
        wordProblems: [],
      };
      aiStories = out.wordProblems
        .slice(0, seeds.length)
        .map((wp, i) => ({ stem: wp.stem.trim(), answer: seeds[i].answer, skillId: seeds[i].skillId, expr: seeds[i].expr! }))
        .filter((wp) => wp.stem && usesNumbers(wp.stem, wp.expr))
        .map(({ stem, answer, skillId }) => ({ stem, answer, skillId }));
    }
  }

  const worksheet: Worksheet = {
    title: normalizeUz(text.title),
    intro: text.intro,
    teacherNotes: text.teacherNotes,
    items: [
      ...tasks.map((t) => ({ stem: t.stem, answer: t.answer, skillId: t.skillId, source: "generated" as const })),
      ...(aiStories.length
        ? aiStories.map((s) => ({ ...s, source: "ai" as const }))
        : generateWorksheetTasks(["frac-word"], 2, seed + 101).map((t) => ({
            stem: t.stem,
            answer: t.answer,
            skillId: t.skillId,
            source: "generated" as const,
          }))),
    ],
  };
  return NextResponse.json(worksheet, { headers: { "Cache-Control": "no-store" } });
}
