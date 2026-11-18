import { NextResponse } from "next/server";
import { z } from "zod";
import { DEMO_CLASS_ID, getRepo } from "@/lib/db";
import { buildDemoSeed } from "@/lib/seed/demo-class";
import { resetV2 } from "@/lib/store";

export const dynamic = "force-dynamic";

const Body = z.object({ classId: z.string().trim().min(1).max(20).optional() });

/** Re-seed the demo class: v1 diagnostic data and v2 accounts, tests and progress. */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });
  const classId = parsed.data.classId ?? DEMO_CLASS_ID;
  if (classId !== DEMO_CLASS_ID) return NextResponse.json({ error: "only the demo class can be reset" }, { status: 403 });
  await getRepo().seedClass(buildDemoSeed());
  await resetV2();
  return NextResponse.json({ ok: true });
}
