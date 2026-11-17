// Owner: C. Builds the teacher's class report from stored snapshots and attempts.
// Mastery is never recomputed here: levels come from A's engine (`levelOf`) on the
// stored StudentSnapshot.
import { indexGraph, levelOf } from "@/engine";
import { graph } from "@/lib/content";
import type { ClassReport, MisconceptionId, Repo, SkillId, StudentSnapshot } from "@/lib/types";

const RECENT_LIMIT = 20;

/** Mean P(known) over every skill in the graph (missing skills count as 0). */
export function studentMasteryAvg(snapshot: StudentSnapshot | null): number {
  if (!snapshot) return 0;
  const ids = graph.skills.map((s) => s.id);
  return ids.reduce((sum, id) => sum + (snapshot.skills[id]?.p ?? 0), 0) / ids.length;
}

export async function buildClassReport(repo: Repo, classId: string, now: Date = new Date()): Promise<ClassReport> {
  const classRoom = await repo.getClass(classId);
  if (!classRoom) throw new Error(`Class "${classId}" not found`);

  const [records, attempts] = await Promise.all([repo.listClassStudents(classId), repo.listAttempts({ classId })]);

  const lastActiveBy = new Map<string, string>();
  for (const a of attempts) {
    const prev = lastActiveBy.get(a.studentId);
    if (!prev || a.ts > prev) lastActiveBy.set(a.studentId, a.ts);
  }

  const students = records
    .map((r) => {
      const fromSnapshot = r.snapshot?.updatedAt ?? null;
      const fromAttempts = lastActiveBy.get(r.student.id) ?? null;
      const lastActive = [fromAttempts, fromSnapshot].filter(Boolean).sort().pop() ?? null;
      return { ...r, lastActive, masteryAvg: studentMasteryAvg(r.snapshot) };
    })
    .sort((a, b) => a.student.name.localeCompare(b.student.name));

  const withSnap = records.filter((r): r is typeof r & { snapshot: StudentSnapshot } => !!r.snapshot);

  const skillStats = indexGraph(graph).topoOrder.map((skillId) => {
    let sumP = 0;
    let gapCount = 0;
    let shakyCount = 0;
    let masteredCount = 0;
    for (const r of withSnap) {
      const s = r.snapshot.skills[skillId];
      sumP += s?.p ?? 0;
      const level = levelOf(s);
      if (level === "gap") gapCount++;
      else if (level === "shaky") shakyCount++;
      else if (level === "mastered") masteredCount++;
    }
    return { skillId, avgP: withSnap.length ? sumP / withSnap.length : 0, gapCount, shakyCount, masteredCount };
  });

  const rootMap = new Map<SkillId, string[]>();
  for (const r of withSnap) {
    for (const root of r.snapshot.rootGaps) rootMap.set(root, [...(rootMap.get(root) ?? []), r.student.id]);
  }
  const topRootGaps = [...rootMap.entries()]
    .map(([skillId, studentIds]) => ({ skillId, studentIds }))
    .sort((a, b) => b.studentIds.length - a.studentIds.length);

  const misMap = new Map<MisconceptionId, { count: number; students: Set<string> }>();
  for (const a of attempts) {
    if (!a.misconceptionId) continue;
    const m = misMap.get(a.misconceptionId) ?? { count: 0, students: new Set<string>() };
    m.count++;
    m.students.add(a.studentId);
    misMap.set(a.misconceptionId, m);
  }
  const topMisconceptions = [...misMap.entries()]
    .map(([misconceptionId, m]) => ({ misconceptionId, count: m.count, studentIds: [...m.students] }))
    .sort((a, b) => b.studentIds.length - a.studentIds.length || b.count - a.count);

  const nameOf = new Map(records.map((r) => [r.student.id, r.student.name]));
  const recentAttempts = attempts
    .slice(0, RECENT_LIMIT)
    .map((a) => ({ ...a, studentName: nameOf.get(a.studentId) ?? "?" }));

  return {
    classRoom,
    students,
    skillStats,
    topRootGaps,
    topMisconceptions,
    recentAttempts,
    generatedAt: now.toISOString(),
  };
}
