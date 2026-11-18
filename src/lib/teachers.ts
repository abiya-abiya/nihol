import "server-only";
import { orgOfUser, teacherOfClass } from "@/lib/auth-demo";
import { addClass, addUsers, getUsers, listClasses } from "@/lib/store";
import type { ClassGroup, User } from "@/lib/types";

const translit = (s: string) =>
  s
    .toLowerCase()
    .replace(/ö/g, "o")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "sh")
    .replace(/ç/g, "ch")
    .replace(/[^a-z0-9]/g, "");

/** Create a teacher account with a starter class. orgId empty = independent teacher. */
export async function createTeacher(input: { name: string; login?: string; password?: string; orgId?: string }): Promise<User> {
  const all = await getUsers();
  const base = translit(input.login || input.name.split(" ")[0]) || "ustoz";
  let login = base;
  for (let i = 2; all.some((u) => u.login === login); i++) login = `${base}${i}`;
  const id = `t-${login}-${Date.now().toString(36).slice(-4)}`;
  const first = input.name.split(" ")[0];
  const cls = await addClass({ name: `${first}ning sinfi`, teacherId: id });
  const user: User = {
    id,
    login,
    password: input.password || Math.random().toString(36).slice(2, 8),
    role: "teacher",
    name: input.name,
    classId: cls.id,
    orgId: input.orgId,
  };
  await addUsers([user]);
  return user;
}

export interface OrgTeacher {
  user: User;
  classes: ClassGroup[];
  studentIds: string[];
}

/** Teachers of an organization with their classes and students. */
export async function orgTeachers(orgId: string): Promise<OrgTeacher[]> {
  const [users, classes] = await Promise.all([getUsers(), listClasses()]);
  return users
    .filter((u) => u.role === "teacher" && orgOfUser(u) === orgId)
    .map((t) => {
      const mine = classes.filter((c) => teacherOfClass(c) === t.id);
      const ids = new Set(mine.map((c) => c.id));
      return { user: t, classes: mine, studentIds: users.filter((u) => u.role === "student" && u.classId && ids.has(u.classId)).map((u) => u.id) };
    });
}
