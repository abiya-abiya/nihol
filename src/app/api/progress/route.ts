import { NextResponse } from "next/server";
import { guard, isResponse } from "@/lib/api/guard";
import { getUsers, listProgress, listSubmissions } from "@/lib/store";
import type { ProgressResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const s = await guard();
  if (isResponse(s)) return s;
  const u = new URL(req.url);
  let ids: string[];
  if (s.role === "student") ids = [s.id];
  else if (s.role === "parent") ids = s.childId ? [s.childId] : [];
  else {
    const one = u.searchParams.get("studentId");
    const classId = u.searchParams.get("classId") ?? s.classId ?? "6a";
    ids = one
      ? [one]
      : (await getUsers()).filter((x) => x.role === "student" && x.classId === classId).map((x) => x.id);
  }
  const { progress, history } = await listProgress(ids);
  const submissions = await listSubmissions({ studentIds: ids });
  return NextResponse.json({ progress, history, submissions } satisfies ProgressResponse);
}
