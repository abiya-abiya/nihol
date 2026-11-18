import { NextResponse } from "next/server";
import { guard, isResponse } from "@/lib/api/guard";
import { getSubject } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: RouteContext<"/api/subjects/[id]">) {
  const s = await guard();
  if (isResponse(s)) return s;
  const subject = await getSubject((await ctx.params).id);
  return subject ? NextResponse.json(subject) : NextResponse.json({ error: "Fan topilmadi" }, { status: 404 });
}
