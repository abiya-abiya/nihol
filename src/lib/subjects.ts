/**
 * Owner: A. Single import point for v2 subjects.
 * TEMPORARY: builds Matematika from the v1 content until B's `@/content/subjects`
 * lands; then this file becomes `export * from "@/content/subjects";`.
 */
import { graph, questions } from "@/lib/content";
import type { Question, SubjectContent } from "@/lib/types";

const matematika: SubjectContent = {
  meta: {
    id: "matematika",
    name: "Matematika",
    short: "Matematika",
    color: "#1d4ed8",
    icon: "sigma",
    order: 1,
    description: "Kasrlar: diagnostika, bilim xaritasi va SI-ustoz bilan.",
  },
  graph,
  questions,
  materials: [
    { lessonId: "lcm", fileName: "Matematika_6-sinf_EKUK.pdf", pages: 3, summary: "Eng kiçik umumiy karrali va uni topiş usullari." },
    { lessonId: "frac-add-diff", fileName: "Kasrlarni_qöşiş.pdf", pages: 4, summary: "Har xil maxrajli kasrlarni qöşiş va ayiriş." },
  ],
};

export const subjects: SubjectContent[] = [matematika];
export const subjectsById: Record<string, SubjectContent> = Object.fromEntries(subjects.map((s) => [s.meta.id, s]));
export function lessonQuestions(subjectId: string, lessonId: string): Question[] {
  return (subjectsById[subjectId]?.questions ?? []).filter((q) => q.skillId === lessonId);
}
