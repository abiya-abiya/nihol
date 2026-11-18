import type { ClassGroup, Organization, User } from "@/lib/types";

export const DEMO_ORG: Organization = { id: "org-45", name: "45-maktab" };

/** Hardcoded demo accounts for the pitch (hackathon only). */
export const DEMO_USERS: User[] = [
  { id: "t-dilnoza", login: "ustoz", password: "ustoz123", role: "teacher", name: "Dilnoza Karimova", classId: "6a", orgId: DEMO_ORG.id },
  { id: "s-jasur", login: "jasur", password: "jasur123", role: "student", name: "Jasur Toşmatov", classId: "6a" },
  { id: "p-jasur", login: "ona", password: "ona123", role: "parent", name: "Jasurning onasi", classId: "6a", childId: "s-jasur" },
  { id: "o-45", login: "maktab", password: "maktab123", role: "org", name: "45-maktab maʼmuriyati", orgId: DEMO_ORG.id },
  { id: "t-nodira", login: "nodira", password: "nodira123", role: "teacher", name: "Nodira Rahimova", classId: "5a", orgId: DEMO_ORG.id },
  { id: "t-bobur", login: "bobur", password: "bobur123", role: "teacher", name: "Bobur Aliyev", classId: "7a", orgId: DEMO_ORG.id },
];

/** Demo class teachers (seeded classes carry no teacherId). */
const DEMO_CLASS_TEACHER: Record<string, string> = { "6a": "t-dilnoza", "6b": "t-dilnoza", "5a": "t-nodira", "7a": "t-bobur" };

export function teacherOfClass(c: ClassGroup): string | undefined {
  return c.teacherId ?? DEMO_CLASS_TEACHER[c.id];
}

/** Organization of a teacher; demo teachers belong to the demo school even in older stored data. */
export function orgOfUser(u: User): string | undefined {
  return u.orgId ?? DEMO_USERS.find((d) => d.id === u.id)?.orgId;
}
