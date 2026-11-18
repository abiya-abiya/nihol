import type { StudentSnapshot, SubjectContent, SubjectProgress } from "@/lib/types";

/** A KnowledgeMap-ready snapshot from per-lesson progress (lessons are the map's skills). */
export function toSnapshot(studentId: string, progress?: SubjectProgress | null): StudentSnapshot {
  return {
    studentId,
    skills: progress?.skills ?? {},
    rootGaps: [],
    traces: [],
    path: [],
    diagnosticDone: true,
    updatedAt: progress?.updatedAt ?? new Date().toISOString(),
  };
}

/** Average mastery over all lessons of the subject (untouched lessons count as 0). */
export function subjectMastery(subject: SubjectContent, progress?: SubjectProgress | null): number {
  const ids = subject.graph.skills.map((s) => s.id);
  if (!ids.length) return 0;
  return ids.reduce((a, id) => a + (progress?.skills[id]?.p ?? 0), 0) / ids.length;
}

/** Lessons with at least one answered test. */
export function lessonsTouched(subject: SubjectContent, progress?: SubjectProgress | null): number {
  return subject.graph.skills.filter((s) => (progress?.skills[s.id]?.attempts ?? 0) > 0).length;
}
