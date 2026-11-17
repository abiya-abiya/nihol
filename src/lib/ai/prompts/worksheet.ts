// Owner: C (allowed by overview §4). Prompt for the group worksheet's text parts.
// The AI never computes answers: we hand it finished computations and it only
// writes the wording around them.
import { z } from "zod";
import { glossary } from "@/lib/content";
import type { Misconception, Skill } from "@/lib/types";

export const WorksheetTextSchema = z.object({
  title: z.string().describe("Uzbek worksheet title, at most 60 characters"),
  intro: z.string().describe("1-2 Uzbek sentences to the pupils, 'sen' form, warm, no math"),
  teacherNotes: z.string().describe("2-4 Uzbek sentences to the teacher, 'Siz' form"),
  wordProblems: z
    .array(
      z.object({
        stem: z.string().describe("Uzbek word problem that uses exactly the given numbers; ends with a question"),
      }),
    )
    .describe("One word problem per given computation, same order"),
});
export type WorksheetText = z.infer<typeof WorksheetTextSchema>;

export const WORKSHEET_SYSTEM = `Siz 5–6-sinf matematika oʻqituvchilari uchun mashq varaqasi matnlarini oʻzbek tilida (lotin yozuvi) yozasiz.

Qoidalar:
- Faqat adabiy oʻzbek tili. Rus tilidan kalka qilmang. Atamalar lugʻatdagi kabi boʻlsin.
- Oʻquvchilarga "sen" deb murojaat qiling (intro va masalalar), oʻqituvchiga "Siz" deb (teacherNotes).
- Kasrlarni faqat shu belgi bilan yozing: [[3/4]], aralash son [[2 1/3]]. Koʻpaytirish "·", boʻlish ":".
- Hech qanday javob, hisob-kitob yoki yangi son oʻylab topmang. Matnli masala sizga berilgan hisoblashni aynan oʻsha sonlar bilan hayotiy vaziyatga oʻgiradi; masala javobi berilgan javobga teng boʻlishi shart.
- Vaziyatlar Oʻzbekiston hayotidan boʻlsin (bozor, non, maktab, paxta, sabzi, avtobus), qisqa: 1–2 gap va savol.
- Sarlavha qisqa va aniq, emoji yoʻq.`;

export function worksheetUserPrompt(input: {
  rootSkill: Skill;
  otherSkills: Skill[];
  misconceptions: Misconception[];
  className: string;
  computations: Array<{ expr: string; answer: string }>;
}): string {
  const terms = glossary.map((g) => `- ${g.term}: ${g.definition}`).join("\n");
  const mis = input.misconceptions.length
    ? input.misconceptions.map((m) => `- ${m.title} (masalan: ${m.example}). Tuzatish: ${m.remedy}`).join("\n")
    : "- (aniq xato turi qayd etilmagan)";
  const comps = input.computations.map((c, i) => `${i + 1}. ${c.expr} = ${c.answer}`).join("\n");
  return `Sinf: ${input.className}.
Ildiz boʻshliq (asosiy mavzu): ${input.rootSkill.title} — ${input.rootSkill.description}
Keyingi qadam: ${input.otherSkills.map((s) => s.title).join(", ") || "—"}

Guruhda koʻp uchragan xato turlari:
${mis}

Atamalar lugʻati:
${terms}

Matnli masalaga aylantiriladigan hisoblashlar (sonlarni oʻzgartirmang):
${comps}

Yozing: title, intro, teacherNotes (qaysi xatoga eʼtibor berish va qanday tushuntirish), wordProblems (har bir hisoblash uchun bitta masala, shu tartibda).`;
}
