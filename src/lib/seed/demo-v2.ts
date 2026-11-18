// Owner: C — stub created by A1 so the app runs; C replaces it in C2.
import { DEMO_USERS } from "@/lib/auth-demo";
import type { DemoV2 } from "@/lib/types";

export function buildDemoV2(now: Date = new Date()): DemoV2 {
  void now;
  return { users: [...DEMO_USERS], assignments: [], submissions: [], progress: [], history: [] };
}
