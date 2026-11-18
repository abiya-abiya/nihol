import type { KnowledgeGraph, MaterialSample, Question, SubjectContent, SubjectMeta } from "../../lib/types";
import { graph as mathGraph, questions as mathQuestions } from "../index";
import onaTili from "./ona-tili/subject.json";
import onaTiliQ from "./ona-tili/questions.json";
import inglizTili from "./ingliz-tili/subject.json";
import inglizTiliQ from "./ingliz-tili/questions.json";
import biologiya from "./biologiya/subject.json";
import biologiyaQ from "./biologiya/questions.json";

type SubjectJson = { meta: SubjectMeta; graph: KnowledgeGraph; materials: MaterialSample[] };
const fromJson = (s: unknown, questions: unknown): SubjectContent => ({
  ...(s as SubjectJson),
  questions: questions as Question[],
});

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
  graph: mathGraph,
  questions: mathQuestions,
  materials: [
    { lessonId: "lcm", fileName: "Matematika_6-sinf_EKUK.pdf", pages: 3, summary: "Eng kiçik umumiy karrali va uni topiş usullari." },
    { lessonId: "frac-simplify", fileName: "Matematika_6-sinf_Kasrlarni_qisqartiriş.pdf", pages: 2, summary: "Kasrning surat va maxrajini EKUBga bölib qisqartiriş." },
    { lessonId: "frac-add-diff", fileName: "Matematika_6-sinf_Kasrlarni_qöşiş.pdf", pages: 4, summary: "Har xil maxrajli kasrlarni umumiy maxrajga keltirib qöşiş va ayiriş." },
    { lessonId: "frac-word", fileName: "Matematika_6-sinf_Kasrli_masalalar.pdf", pages: 3, summary: "Kasrlar qatnaşgan matnli masalalarni bosqiçma-bosqiç yeçiş." },
  ],
};

export const subjects: SubjectContent[] = [
  matematika,
  fromJson(onaTili, onaTiliQ),
  fromJson(inglizTili, inglizTiliQ),
  fromJson(biologiya, biologiyaQ),
];
export const subjectsById: Record<string, SubjectContent> = Object.fromEntries(subjects.map((s) => [s.meta.id, s]));
export function lessonQuestions(subjectId: string, lessonId: string): Question[] {
  return (subjectsById[subjectId]?.questions ?? []).filter((q) => q.skillId === lessonId);
}
