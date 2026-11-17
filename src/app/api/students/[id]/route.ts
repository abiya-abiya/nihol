import { NextResponse } from "next/server";
import { getRepo } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: RouteContext<"/api/students/[id]">) {
  const { id } = await ctx.params;
  const record = await getRepo().getStudent(id);
  if (!record) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(record);
}
