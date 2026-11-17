import { NextResponse } from "next/server";
import { z } from "zod";
import { DEMO_CLASS_ID, getRepo } from "@/lib/db";
import { buildDemoSeed } from "@/lib/seed/demo-class";

export const dynamic = "force-dynamic";

const Body = z.object({ classId: z.string().trim().min(1).max(20).optional() });

/** Re-seed the demo class (wipes pupils who joined during the demo). Only the demo class can be reset. */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });
  const classId = parsed.data.classId ?? DEMO_CLASS_ID;
  if (classId !== DEMO_CLASS_ID) return NextResponse.json({ error: "only the demo class can be reset" }, { status: 403 });
  await getRepo().seedClass(buildDemoSeed());
  return NextResponse.json({ ok: true });
}
