import "server-only";
import { glossary, misconceptionsById, skillsById, tutorExamples } from "@/lib/content";
import type { ChoiceId, Question, SkillId } from "@/lib/types";

// The system prompt is byte-stable across requests (cache-friendly); per-request facts go
// into the user message.

const glossaryBlock = glossary.map((g) => `- ${g.term}: ${g.definition}`).join("\n");

const examplesBlock = tutorExamples.length
  ? "\n\nNamuna tushuntirishlar (shu uslubda yoz):\n" +
    tutorExamples
      .map(
        (e, i) =>
          `${i + 1}) Savol: ${e.stem}\nO'quvchi tanlagan: ${e.chosenText}\nTo'g'ri javob: ${e.correctText}\nTushuntirish: ${e.idealExplanation}`,
      )
      .join("\n\n")
  : "";

export const TUTOR_SYSTEM = `Sen — "Nihol" ilovasidagi mehribon matematika ustozisan. 5–6-sinf o'quvchilariga kasrlarni tushuntirasan.

Qoidalar:
- Faqat o'zbek tilida, lotin yozuvida yoz. O'quvchiga "sen" deb murojaat qil. Gaplar qisqa va sodda bo'lsin.
- Kasrni faqat [[surat/maxraj]] ko'rinishida yoz, aralash sonni [[butun surat/maxraj]] ko'rinishida (masalan [[2 1/3]]). Ko'paytirish belgisi "·", bo'lish belgisi ":".
- Faqat **qalin** belgisidan foydalanish mumkin. Sarlavha, ro'yxat belgilari, LaTeX, jadval va emoji ishlatma.
- O'quvchini hech qachon kamsitma: xato — o'rganishning bir qismi.
- Maktab atamalarini ishlat:
${glossaryBlock}
- Hisob-kitobni diqqat bilan tekshir. Berilgan to'g'ri javobdan boshqa javob aytma.
- Matematika va shu mavzudan chetga chiqma.${examplesBlock}`;

const choiceText = (q: Question, id: ChoiceId) => q.choices.find((c) => c.id === id)?.text ?? "";

export function explainMessage(q: Question, choiceId: ChoiceId, studentName?: string): string {
  const skill = skillsById[q.skillId];
  const mId = q.choices.find((c) => c.id === choiceId)?.misconceptionId;
  const m = mId ? misconceptionsById[mId] : undefined;
  return [
    `Mavzu: ${skill?.title ?? q.skillId}`,
    `Savol: ${q.stem}`,
    `To'g'ri javob: ${choiceText(q, q.correct)}`,
    `O'quvchi tanlagan javob: ${choiceText(q, choiceId)}`,
    m ? `Ehtimoliy xato fikr: ${m.title}. Misol: ${m.example}. Qanday tuzatiladi: ${m.remedy}` : "Xato fikr aniqlanmadi.",
    `Darslikdagi yechim: ${q.explanation}`,
    studentName ? `O'quvchining ismi: ${studentName}` : "",
    "",
    "Vazifa: o'quvchiga 90 so'zdan oshmaydigan tushuntirish yoz. Avval uning xato fikrini muloyimlik bilan nomla, keyin shu sonlar bilan to'g'ri yechimni qadamma-qadam ko'rsat, oxirida bitta qisqa tekshiruv savoli ber (javobini aytma).",
  ]
    .filter(Boolean)
    .join("\n");
}

export function chatContext(skillId: SkillId, q?: Question): string {
  const skill = skillsById[skillId];
  return [
    `Hozirgi mavzu: ${skill?.title ?? skillId}. ${skill?.description ?? ""}`,
    q ? `O'quvchi hozir shu savol ustida ishlayapti: ${q.stem}` : "",
    "Suhbat qoidasi: har bir javobing 70 so'zdan oshmasin. Savol bilan yo'naltir, hozirgi savolning yakuniy javobini to'g'ridan-to'g'ri aytma. O'quvchi mavzudan chetga chiqsa, muloyimlik bilan qaytar.",
  ]
    .filter(Boolean)
    .join("\n");
}
