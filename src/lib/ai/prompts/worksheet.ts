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

export const WORKSHEET_SYSTEM = `Siz 5–6-sinf matematika öqituvçilari uçun maşq varaqasi matnlarini özbek tilida (lotin yozuvi) yozasiz.

Qoidalar:
- Faqat adabiy özbek tili. Rus tilidan kalka qilmang. Atamalar luğatdagi kabi bölsin.
- Öquvçilarga "sen" deb murojaat qiling (intro va masalalar), öqituvçiga "Siz" deb (teacherNotes).
- Kasrlarni faqat şu belgi bilan yozing: [[3/4]], aralaş son [[2 1/3]]. Köpaytiriş "·", böliş ":".
- Heç qanday javob, hisob-kitob yoki yangi son öylab topmang. Matnli masala sizga berilgan hisoblaşni aynan öşa sonlar bilan hayotiy vaziyatga ögiradi; masala javobi berilgan javobga teng bölişi şart.
- Vaziyatlar Özbekiston hayotidan bölsin (bozor, non, maktab, paxta, sabzi, avtobus), qisqa: 1–2 gap va savol.
- Sarlavha qisqa va aniq, emoji yöq.
- Yangi alifboda yozing: ö, ğ, ş, ç harflari bilan (öquvçi, maşq, yöl, öqituvçi); eski oʻ, gʻ, sh, ch yozuvini ishlatmang.`;

export function worksheetUserPrompt(input: {
  rootSkill: Skill;
  otherSkills: Skill[];
  misconceptions: Misconception[];
  className: string;
  computations: Array<{ expr: string; answer: string }>;
}): string {
  const terms = glossary.map((g) => `- ${g.term}: ${g.definition}`).join("\n");
  const mis = input.misconceptions.length
    ? input.misconceptions.map((m) => `- ${m.title} (masalan: ${m.example}). Tuzatiş: ${m.remedy}`).join("\n")
    : "- (aniq xato turi qayd etilmagan)";
  const comps = input.computations.map((c, i) => `${i + 1}. ${c.expr} = ${c.answer}`).join("\n");
  return `Sinf: ${input.className}.
Ildiz böşliq (asosiy mavzu): ${input.rootSkill.title} — ${input.rootSkill.description}
Keyingi qadam: ${input.otherSkills.map((s) => s.title).join(", ") || "—"}

Guruhda köp uçragan xato turlari:
${mis}

Atamalar luğati:
${terms}

Matnli masalaga aylantiriladigan hisoblaşlar (sonlarni özgartirmang):
${comps}

Yozing: title, intro, teacherNotes (qaysi xatoga eʼtibor beriş va qanday tuşuntiriş), wordProblems (har bir hisoblaş uçun bitta masala, şu tartibda).`;
}
