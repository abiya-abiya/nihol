/**
 * Owner: A. TEMPORARY fixture so the student app can be built before B's
 * src/content lands. One difficulty-2 question per skill, math double-checked.
 * Delete once src/lib/content.ts re-exports "@/content".
 */
import type {
  GlossaryEntry,
  KnowledgeGraph,
  Misconception,
  MisconceptionId,
  Question,
  Skill,
  SkillId,
  TutorExample,
} from "@/lib/types";

const S = (
  id: string,
  title: string,
  short: string,
  grade: 5 | 6,
  prerequisites: string[],
  description: string,
): Skill => ({ id, title, short, grade, prerequisites, description });

export const graph: KnowledgeGraph = {
  subject: "Matematika",
  topic: "Kasrlar",
  entrySkills: ["frac-word", "mixed-add", "frac-div", "frac-compare"],
  skills: [
    S("nat-mul", "Natural sonlarni ko'paytirish", "Ko'paytirish", 5, [], "Ko'paytirish jadvalini biladi va ko'p xonali sonlarni ko'paytiradi."),
    S("nat-div", "Qoldiqli bo'lish", "Qoldiqli bo'lish", 5, ["nat-mul"], "Sonni bo'lib, bo'linma va qoldiqni to'g'ri topadi."),
    S("divisibility", "Bo'linish belgilari", "Bo'linish belgisi", 6, ["nat-div"], "2, 3, 5, 9 va 10 ga bo'linish belgilarini qo'llaydi."),
    S("gcd", "EKUB", "EKUB", 6, ["divisibility"], "Ikki sonning eng katta umumiy bo'luvchisini topadi."),
    S("lcm", "EKUK", "EKUK", 6, ["divisibility"], "Ikki sonning eng kichik umumiy karralisini topadi."),
    S("frac-concept", "Kasr tushunchasi", "Kasr nima", 5, ["nat-div"], "Surat va maxraj nimani bildirishini tushunadi."),
    S("frac-equiv", "Kasrning asosiy xossasi", "Teng kasrlar", 5, ["frac-concept", "nat-mul"], "Surat va maxrajni bir xil songa ko'paytirib teng kasr hosil qiladi."),
    S("frac-simplify", "Kasrlarni qisqartirish", "Qisqartirish", 6, ["frac-equiv", "gcd"], "Kasrni EKUB yordamida eng sodda ko'rinishga keltiradi."),
    S("frac-common-denom", "Umumiy maxrajga keltirish", "Umumiy maxraj", 6, ["frac-equiv", "lcm"], "Kasrlarni EKUK yordamida eng kichik umumiy maxrajga keltiradi."),
    S("frac-compare", "Kasrlarni taqqoslash", "Taqqoslash", 6, ["frac-common-denom"], "Har xil maxrajli kasrlardan qaysi biri katta ekanini aniqlaydi."),
    S("frac-add-same", "Bir xil maxrajli kasrlarni qo'shish va ayirish", "Bir xil maxraj", 5, ["frac-concept"], "Maxraji bir xil kasrlarni qo'shadi va ayiradi."),
    S("frac-add-diff", "Har xil maxrajli kasrlarni qo'shish va ayirish", "Har xil maxraj", 6, ["frac-add-same", "frac-common-denom"], "Avval umumiy maxrajga keltirib, so'ng qo'shadi va ayiradi."),
    S("mixed-numbers", "Aralash sonlar", "Aralash son", 5, ["frac-concept", "nat-div"], "Aralash sonni noto'g'ri kasrga va aksincha aylantiradi."),
    S("mixed-add", "Aralash sonlarni qo'shish va ayirish", "Aralash qo'shish", 6, ["mixed-numbers", "frac-add-diff"], "Aralash sonlarni qo'shadi va ayiradi."),
    S("frac-mul", "Kasrlarni ko'paytirish", "Kasr ko'paytirish", 6, ["frac-simplify", "nat-mul"], "Kasrlarni ko'paytiradi va natijani qisqartiradi."),
    S("frac-div", "Kasrlarni bo'lish", "Kasr bo'lish", 6, ["frac-mul"], "Bo'luvchining teskarisiga ko'paytirib kasrlarni bo'ladi."),
    S("frac-word", "Kasrlarga doir matnli masalalar", "Matnli masala", 6, ["frac-add-diff", "frac-mul"], "Hayotiy masalada kasrdan foydalanib javob topadi."),
  ],
};

const M = (id: string, skillIds: string[], title: string, example: string, remedy: string): Misconception => ({
  id,
  skillIds,
  title,
  example,
  remedy,
});

export const misconceptions: Misconception[] = [
  M("add-num-den", ["frac-add-same", "frac-add-diff", "mixed-add"], "Suratlarni va maxrajlarni alohida qo'shadi", "[[1/2]] + [[1/3]] = [[2/5]]", "Maxraj — bo'laklar o'lchami. Avval bo'laklarni bir xil o'lchamga keltiramiz, keyin faqat suratlarni qo'shamiz."),
  M("bigger-den-bigger", ["frac-compare"], "Maxraji katta kasrni katta deb o'ylaydi", "[[5/8]] > [[2/3]]", "Maxraj katta bo'lsa, bo'laklar kichikroq bo'ladi. Taqqoslash uchun umumiy maxrajga keltiramiz."),
  M("simplify-subtract", ["frac-simplify"], "Qisqartirishda bo'lish o'rniga ayiradi", "[[12/18]] = [[10/16]]", "Qisqartirish — surat va maxrajni bir xil songa bo'lish. Ayirish kasr qiymatini o'zgartiradi."),
  M("equiv-one-side", ["frac-equiv"], "Faqat surat yoki faqat maxrajni ko'paytiradi", "[[2/3]] = [[2/12]]", "Kasr qiymati o'zgarmasligi uchun surat va maxraj bir xil songa ko'paytiriladi."),
  M("lcm-is-product", ["lcm", "frac-common-denom"], "Umumiy maxraj sifatida doim maxrajlar ko'paytmasini oladi", "EKUK(4, 6) = 24", "Ko'paytma umumiy karrali, lekin eng kichigi emas. Kattaroq maxrajning karralilarini tekshirib chiq."),
  M("lcm-gcd-swap", ["lcm", "gcd", "frac-common-denom"], "EKUK bilan EKUBni adashtiradi", "EKUK(4, 6) = 2", "EKUB ikkala sonni bo'ladi, EKUK esa ikkala songa bo'linadi. EKUK sonlarning o'zidan kichik bo'lmaydi."),
  M("common-denom-keep-num", ["frac-common-denom", "frac-add-diff", "mixed-add"], "Maxrajni o'zgartiradi, suratni esa o'zgartirmaydi", "[[1/4]] = [[1/12]]", "Maxrajni necha marta oshirsang, suratni ham shuncha marta oshir."),
  M("mixed-convert", ["mixed-numbers"], "Aralash sonni kasrga aylantirishda butun qismni maxrajga ko'paytirmaydi", "[[2 1/3]] = [[3/3]]", "Butun qismdagi har bir birlikda maxrajcha bo'lak bor: 2 · 3 + 1 = 7, demak [[7/3]]."),
  M("mixed-borrow", ["mixed-add"], "Ayirishda butun qismdan bir birlik olmaydi", "[[3 1/4]] − [[1 3/4]] = [[2 2/4]]", "Kasr qismi yetmasa, butun qismdan bitta birlikni kasrga aylantirib olamiz."),
  M("mul-common-denom", ["frac-mul"], "Ko'paytirishda maxrajni o'zgartirmay qoldiradi", "[[2/5]] · [[3/5]] = [[6/5]]", "Ko'paytirishda surat suratga, maxraj maxrajga ko'paytiriladi. Umumiy maxraj kerak emas."),
  M("whole-times-both", ["frac-mul", "frac-word"], "Butun sonni surat va maxrajga ko'paytiradi", "3 · [[2/5]] = [[6/15]]", "Butun son — maxraji 1 bo'lgan kasr: 3 = [[3/1]]. Shuning uchun faqat surat ko'payadi."),
  M("div-no-flip", ["frac-div"], "Bo'lishda teskari kasrni olmaydi", "[[3/4]] : [[1/2]] = [[3/8]]", "Kasrga bo'lish — uning teskarisiga ko'paytirish: [[3/4]] · [[2/1]]."),
  M("div-flip-first", ["frac-div"], "Birinchi kasrni teskari qiladi", "[[3/4]] : [[1/2]] = [[4/3]] · [[1/2]]", "Faqat bo'luvchi (ikkinchi kasr) teskari qilinadi."),
  M("remainder-error", ["nat-div"], "Qoldiqli bo'lishda bo'linma yoki qoldiqni noto'g'ri topadi", "47 : 6 = 7 (qoldiq 1)", "Tekshir: bo'linma · bo'luvchi + qoldiq = bo'linuvchi, qoldiq bo'luvchidan kichik."),
  M("times-table", ["nat-mul"], "Ko'paytirish jadvalida adashadi", "7 · 8 = 54", "Yaqin misoldan foydalan: 7 · 8 = 7 · 7 + 7 = 56."),
  M("part-of-rest", ["frac-word"], "Qolgan qism o'rniga butunning ulushini oladi", "30 ta o'quvchining [[2/5]] qismi qiz → o'g'il bolalar 12 ta", "Avval ulushni top, so'ng savol nimani so'rayotganini o'qi: qolgan qism kerak bo'lsa, ayir."),
  M("divisibility-rule", ["divisibility"], "Bo'linish belgisini noto'g'ri qo'llaydi", "143 oxiri 3 bilan tugaydi → 3 ga bo'linadi", "3 ga bo'linish uchun raqamlar yig'indisiga qaraymiz: 1 + 4 + 3 = 8, 3 ga bo'linmaydi."),
];

type Ch = [string, string?];
const Q = (skillId: string, stem: string, choices: [Ch, Ch, Ch, Ch], correct: "a" | "b" | "c" | "d", explanation: string, hint: string): Question => ({
  id: `${skillId}-01`,
  skillId,
  difficulty: 2,
  stem,
  choices: (["a", "b", "c", "d"] as const).map((id, i) => ({
    id,
    text: choices[i][0],
    ...(choices[i][1] ? { misconceptionId: choices[i][1] as MisconceptionId } : {}),
  })),
  correct,
  explanation,
  hint,
  source: "bank",
});

export const questions: Question[] = [
  Q("nat-mul", "Hisobla: 7 · 8 = ?", [["54", "times-table"], ["56"], ["64", "times-table"], ["48", "times-table"]], "b", "7 · 8 = 7 · 7 + 7 = 49 + 7 = 56.", "7 · 7 nechaga teng?"),
  Q("nat-div", "47 ni 6 ga qoldiqli bo'l.", [["7, qoldiq 5"], ["7, qoldiq 1", "remainder-error"], ["8, qoldiq 1", "remainder-error"], ["6, qoldiq 11", "remainder-error"]], "a", "6 · 7 = 42, 47 − 42 = 5. Qoldiq 5 < 6, demak 7, qoldiq 5.", "6 ga ko'paytirib, 47 dan oshmaydigan eng katta sonni top."),
  Q("divisibility", "Qaysi son 3 ga qoldiqsiz bo'linadi?", [["124"], ["213"], ["113"], ["143", "divisibility-rule"]], "b", "2 + 1 + 3 = 6, 6 esa 3 ga bo'linadi. Demak 213 ham 3 ga bo'linadi.", "Raqamlar yig'indisini hisobla."),
  Q("gcd", "EKUB(12, 18) = ?", [["36", "lcm-gcd-swap"], ["6"], ["3"], ["2"]], "b", "12 ning bo'luvchilari: 1, 2, 3, 4, 6, 12. 18 niki: 1, 2, 3, 6, 9, 18. Eng kattasi umumiysi — 6.", "Ikkala sonni bo'ladigan eng katta sonni qidir."),
  Q("lcm", "EKUK(4, 6) = ?", [["2", "lcm-gcd-swap"], ["24", "lcm-is-product"], ["12"], ["10"]], "c", "4 ning karralilari: 4, 8, 12, … 6 ning karralilari: 6, 12, … Birinchi umumiysi — 12.", "6 ning karralilaridan qaysi biri 4 ga bo'linadi?"),
  Q("frac-concept", "Pirog 8 ta teng bo'lakka bo'lindi. Ali 3 bo'lagini yedi. Ali pirogning qanday qismini yedi?", [["[[3/8]]"], ["[[8/3]]"], ["[[3/5]]"], ["[[5/8]]", "part-of-rest"]], "a", "Butun 8 bo'lak — maxraj 8. Ali 3 bo'lak yedi — surat 3. Javob: [[3/8]].", "Maxraj — jami bo'laklar soni."),
  Q("frac-equiv", "Bo'sh joyni to'ldir: [[2/3]] = [[?/12]]", [["[[8/12]]"], ["[[6/12]]"], ["[[11/12]]"], ["[[2/12]]", "equiv-one-side"]], "a", "3 · 4 = 12, demak surat ham 4 ga ko'payadi: 2 · 4 = 8.", "Maxraj necha marta oshdi?"),
  Q("frac-simplify", "[[12/18]] kasrni eng sodda ko'rinishga keltir.", [["[[2/3]]"], ["[[3/2]]"], ["[[10/16]]", "simplify-subtract"], ["[[1/3]]"]], "a", "EKUB(12, 18) = 6. 12 : 6 = 2, 18 : 6 = 3. Javob: [[2/3]].", "Surat va maxrajni bo'ladigan eng katta sonni top."),
  Q("frac-common-denom", "[[1/4]] va [[1/6]] kasrlarni eng kichik umumiy maxrajga keltir.", [["[[3/12]] va [[2/12]]"], ["[[6/24]] va [[4/24]]", "lcm-is-product"], ["[[1/12]] va [[1/12]]", "common-denom-keep-num"], ["[[1/2]] va [[1/2]]", "lcm-gcd-swap"]], "a", "EKUK(4, 6) = 12. [[1/4]] = [[3/12]], [[1/6]] = [[2/12]].", "Avval EKUK(4, 6) ni top."),
  Q("frac-compare", "Qaysi kasr katta: [[2/3]] yoki [[5/8]]?", [["[[2/3]]"], ["[[5/8]]", "bigger-den-bigger"], ["Ular teng"], ["Aniqlab bo'lmaydi"]], "a", "Umumiy maxraj 24: [[2/3]] = [[16/24]], [[5/8]] = [[15/24]]. 16 > 15, demak [[2/3]] katta.", "Ikkalasini maxraji 24 bo'lgan kasrga aylantir."),
  Q("frac-add-same", "Hisobla: [[2/7]] + [[3/7]] = ?", [["[[5/14]]", "add-num-den"], ["[[5/7]]"], ["[[6/7]]"], ["[[1/7]]"]], "b", "Maxraj bir xil — bo'laklar bir xil. Faqat suratlarni qo'shamiz: 2 + 3 = 5. Javob: [[5/7]].", "Maxraj o'zgaradimi?"),
  Q("frac-add-diff", "Hisobla: [[1/2]] + [[1/3]] = ?", [["[[2/5]]", "add-num-den"], ["[[5/6]]"], ["[[2/6]]", "common-denom-keep-num"], ["[[1/6]]"]], "b", "EKUK(2, 3) = 6. [[1/2]] = [[3/6]], [[1/3]] = [[2/6]]. [[3/6]] + [[2/6]] = [[5/6]].", "Avval kasrlarni umumiy maxrajga keltir."),
  Q("mixed-numbers", "[[2 1/3]] ni noto'g'ri kasrga aylantir.", [["[[7/3]]"], ["[[3/3]]", "mixed-convert"], ["[[21/3]]", "mixed-convert"], ["[[6/3]]"]], "a", "2 · 3 + 1 = 7, maxraj o'zgarmaydi: [[7/3]].", "Ikki butunda nechta uchdan bir bor?"),
  Q("mixed-add", "Hisobla: [[1 1/2]] + [[2 1/3]] = ?", [["[[3 2/5]]", "add-num-den"], ["[[3 2/6]]", "common-denom-keep-num"], ["[[3 5/6]]"], ["[[4 5/6]]"]], "c", "Butunlar: 1 + 2 = 3. Kasrlar: [[1/2]] + [[1/3]] = [[3/6]] + [[2/6]] = [[5/6]]. Javob: [[3 5/6]].", "Butun va kasr qismlarini alohida qo'sh."),
  Q("frac-mul", "Hisobla: [[2/5]] · [[3/4]] = ?", [["[[3/10]]"], ["[[5/9]]", "add-num-den"], ["[[8/15]]"], ["[[6/9]]"]], "a", "Surat suratga, maxraj maxrajga: [[6/20]]. Qisqartiramiz: [[3/10]].", "Ko'paytirishda umumiy maxraj kerakmi?"),
  Q("frac-div", "Hisobla: [[3/4]] : [[1/2]] = ?", [["[[1 1/2]]"], ["[[3/8]]", "div-no-flip"], ["[[2/3]]", "div-flip-first"], ["[[1/2]]"]], "a", "[[1/2]] ga bo'lish — 2 ga ko'paytirish: [[3/4]] · [[2/1]] = [[6/4]] = [[1 1/2]].", "Bo'luvchining teskarisi qanday?"),
  Q("frac-word", "Sinfda 30 o'quvchi bor. Ularning [[2/5]] qismi qizlar. Sinfda nechta o'g'il bola bor?", [["12", "part-of-rest"], ["18"], ["75"], ["6"]], "b", "Qizlar: 30 : 5 · 2 = 12. O'g'il bolalar: 30 − 12 = 18.", "Savol qizlar haqida emas, o'g'il bolalar haqida."),
];

export const skillsById: Record<SkillId, Skill> = Object.fromEntries(graph.skills.map((s) => [s.id, s]));
export const misconceptionsById: Record<string, Misconception> = Object.fromEntries(misconceptions.map((m) => [m.id, m]));
export const questionsBySkill: Record<SkillId, Question[]> = {};
for (const q of questions) (questionsBySkill[q.skillId] ??= []).push(q);
export const glossary: GlossaryEntry[] = [
  { term: "surat", definition: "kasr chizig'i ustidagi son; nechta bo'lak olinganini ko'rsatadi" },
  { term: "maxraj", definition: "kasr chizig'i ostidagi son; butun nechta teng bo'lakka bo'linganini ko'rsatadi" },
  { term: "EKUK", definition: "eng kichik umumiy karrali" },
  { term: "EKUB", definition: "eng katta umumiy bo'luvchi" },
];
export const tutorExamples: TutorExample[] = [];

/** B's deterministic generators replace this (src/engine/generators). */
export function generateQuestion(skillId: SkillId, seed: number): Question | null {
  void skillId;
  void seed;
  return null;
}
