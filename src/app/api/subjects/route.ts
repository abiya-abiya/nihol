import { NextResponse } from "next/server";
import { z } from "zod";
import { guard, isResponse, slug } from "@/lib/api/guard";
import { addSubject, listSubjects } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await guard();
  if (isResponse(s)) return s;
  return NextResponse.json((await listSubjects()).map((x) => ({ ...x.meta, lessonCount: x.graph.skills.length })));
}

const Body = z.object({
  name: z.string().trim().min(2).max(40),
  description: z.string().trim().max(200).default(""),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#0f766e"),
  icon: z.string().max(30).default("book"),
});

export async function POST(req: Request) {
  const s = await guard("teacher");
  if (isResponse(s)) return s;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Fan nomini kiriting" }, { status: 400 });
  const all = await listSubjects();
  let id = slug(parsed.data.name);
  if (all.some((x) => x.meta.id === id)) id = `${id}-${all.length + 1}`;
  const meta = {
    id,
    name: parsed.data.name,
    short: parsed.data.name,
    color: parsed.data.color,
    icon: parsed.data.icon,
    order: all.length + 1,
    description: parsed.data.description,
    teacherId: s.id,
  };
  await addSubject(meta);
  return NextResponse.json({ subject: meta });
}
