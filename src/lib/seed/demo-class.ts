// Owner: C — replace in C3 with the 24 synthetic students (see docs/plan/C.md).
import type { SeedData } from "@/lib/types";

export function buildDemoSeed(now: Date = new Date()): SeedData {
  void now;
  return {
    classRoom: { id: process.env.DEMO_CLASS_ID || "6a", name: "6-A sinf", teacherName: "Dilnoza Karimova", grade: 6 },
    students: [],
    attempts: [],
  };
}
