import type { User } from "@/lib/types";

/** Hardcoded demo accounts for the pitch (hackathon only). */
export const DEMO_USERS: User[] = [
  { id: "t-dilnoza", login: "ustoz", password: "ustoz123", role: "teacher", name: "Dilnoza Karimova", classId: "6a" },
  { id: "s-jasur", login: "jasur", password: "jasur123", role: "student", name: "Jasur Toşmatov", classId: "6a" },
  { id: "p-jasur", login: "ona", password: "ona123", role: "parent", name: "Jasurning onasi", classId: "6a", childId: "s-jasur" },
];
