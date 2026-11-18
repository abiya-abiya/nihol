import { NextResponse } from "next/server";
import { z } from "zod";
import { guard, isResponse } from "@/lib/api/guard";
import { addUsers, getUsers } from "@/lib/store";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const s = await guard("teacher");
  if (isResponse(s)) return s;
  const classId = new URL(req.url).searchParams.get("classId") ?? s.classId ?? "6a";
  return NextResponse.json((await getUsers()).filter((x) => x.classId === classId && x.role !== "teacher"));
}

const Body = z.object({ name: z.string().trim().min(2).max(60), withParent: z.boolean().default(true) });

const translit = (s: string) =>
  s
    .toLowerCase()
    .replace(/ö/g, "o")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "sh")
    .replace(/ç/g, "ch")
    .replace(/[^a-z]/g, "");
const newPassword = () => Math.random().toString(36).slice(2, 8);

export async function POST(req: Request) {
  const s = await guard("teacher");
  if (isResponse(s)) return s;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ism va familiyani kiriting" }, { status: 400 });
  const all = await getUsers();
  const base = translit(parsed.data.name.split(" ")[0]) || "oquvchi";
  let login = base;
  for (let i = 2; all.some((u) => u.login === login); i++) login = `${base}${i}`;
  const classId = s.classId ?? "6a";
  const student: User = { id: `s-${login}`, login, password: newPassword(), role: "student", name: parsed.data.name, classId };
  const created: User[] = [student];
  if (parsed.data.withParent) {
    created.push({
      id: `p-${login}`,
      login: `${login}-ota`,
      password: newPassword(),
      role: "parent",
      name: `${parsed.data.name.split(" ")[0]}ning ota-onasi`,
      classId,
      childId: student.id,
    });
  }
  await addUsers(created);
  return NextResponse.json({ created });
}
