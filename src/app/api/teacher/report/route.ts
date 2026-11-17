import { NextResponse } from "next/server";
import { DEMO_CLASS_ID, ensureDemoClass, getRepo } from "@/lib/db";
import { buildClassReport } from "@/lib/teacher/report";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const classId = new URL(req.url).searchParams.get("classId") || DEMO_CLASS_ID;
  await ensureDemoClass();
  const repo = getRepo();
  if (!(await repo.getClass(classId))) return NextResponse.json({ error: "class not found" }, { status: 404 });
  const report = await buildClassReport(repo, classId);
  return NextResponse.json(report, { headers: { "Cache-Control": "no-store" } });
}
