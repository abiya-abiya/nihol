// Owner: C. Client-safe helpers that shape a ClassReport for the teacher screens.
import { misconceptionsById, skillsById } from "@/lib/content";
import type { ClassReport, SkillId } from "@/lib/types";
import { normalizeUz } from "@/lib/uz";

export type ReportStudent = ClassReport["students"][number];

export const skillTitle = (id: SkillId) => normalizeUz(skillsById[id]?.title ?? id);
export const skillShort = (id: SkillId) => normalizeUz(skillsById[id]?.short ?? id);
export const misconceptionTitle = (id: string) => normalizeUz(misconceptionsById[id]?.title ?? id);

export const isInProgress = (s: ReportStudent) => !s.snapshot || !s.snapshot.diagnosticDone;

export interface StudentGroup {
  key: string;
  kind: "root" | "clear" | "progress";
  rootSkillId?: SkillId;
  label: string;
  students: ReportStudent[];
}

/**
 * Rows for the heatmap: one group per root gap (biggest first, each pupil in the
 * group of their most common root), then pupils with no root gap, then pupils
 * who have not finished the diagnostic.
 */
export function groupStudents(report: ClassReport): StudentGroup[] {
  const rank = new Map(report.topRootGaps.map((g, i) => [g.skillId, i]));
  const byRoot = new Map<SkillId, ReportStudent[]>();
  const clear: ReportStudent[] = [];
  const progress: ReportStudent[] = [];

  for (const s of report.students) {
    if (isInProgress(s)) {
      progress.push(s);
      continue;
    }
    const roots = [...(s.snapshot?.rootGaps ?? [])].sort((a, b) => (rank.get(a) ?? 99) - (rank.get(b) ?? 99));
    if (!roots.length) {
      clear.push(s);
      continue;
    }
    byRoot.set(roots[0], [...(byRoot.get(roots[0]) ?? []), s]);
  }

  const groups: StudentGroup[] = report.topRootGaps
    .filter((g) => byRoot.has(g.skillId))
    .map((g) => ({
      key: `root:${g.skillId}`,
      kind: "root",
      rootSkillId: g.skillId,
      label: skillShort(g.skillId),
      students: byRoot.get(g.skillId)!,
    }));
  if (clear.length) groups.push({ key: "clear", kind: "clear", label: "Ildiz muammo topilmadi", students: clear });
  if (progress.length)
    groups.push({ key: "progress", kind: "progress", label: "Diagnostika jarayonida", students: progress });
  return groups;
}

/** Root skill plus the skill most often just above it on these pupils' traces. */
export function worksheetSkills(report: ClassReport, rootSkillId: SkillId, studentIds: string[]): SkillId[] {
  const ids = new Set(studentIds);
  const counts = new Map<SkillId, number>();
  for (const s of report.students) {
    if (!ids.has(s.student.id)) continue;
    for (const t of s.snapshot?.traces ?? []) {
      const i = t.chain.indexOf(rootSkillId);
      if (i > 0) counts.set(t.chain[i - 1], (counts.get(t.chain[i - 1]) ?? 0) + 1);
    }
  }
  const above = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  return above ? [rootSkillId, above] : [rootSkillId];
}

export function worksheetHref(report: ClassReport, rootSkillId: SkillId, studentIds: string[]): string {
  const skills = worksheetSkills(report, rootSkillId, studentIds);
  const mis = report.topMisconceptions
    .filter((m) => misconceptionsById[m.misconceptionId]?.skillIds.some((id) => skills.includes(id)))
    .slice(0, 3)
    .map((m) => m.misconceptionId);
  const q = new URLSearchParams({ skills: skills.join(","), group: rootSkillId, class: report.classRoom.id });
  if (mis.length) q.set("mis", mis.join(","));
  return `/teacher/worksheet?${q.toString()}`;
}

export function initials(name: string): string {
  const parts = normalizeUz(name).trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** "Aziza Karimova" -> "Aziza K." (for compact lists) */
export function shortName(name: string): string {
  const parts = normalizeUz(name).trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
}

/** Relative time in Uzbek, measured against `now` (the report time, so SSR and client agree). */
export function timeAgo(iso: string | null, now: string | Date): string {
  if (!iso) return "—";
  const diff = Math.max(0, new Date(now).getTime() - new Date(iso).getTime()) / 1000;
  if (diff < 45) return "hozirgina";
  if (diff < 3600) return `${Math.round(diff / 60)} daqiqa oldin`;
  if (diff < 86_400) return `${Math.round(diff / 3600)} soat oldin`;
  if (diff < 172_800) return "kecha";
  return `${Math.round(diff / 86_400)} kun oldin`;
}

export const pct = (p: number) => Math.round(p * 100);
