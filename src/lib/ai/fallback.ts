import { misconceptionsById, skillsById } from "@/lib/content";
import type { ChoiceId, Question, SkillId } from "@/lib/types";

/** Prepared explanation used when the AI is off or fails: misconception remedy + worked solution. */
export function fallbackExplanation(q: Question, choiceId: ChoiceId): string {
  const mId = q.choices.find((c) => c.id === choiceId)?.misconceptionId;
  const m = mId ? misconceptionsById[mId] : undefined;
  const parts = [];
  if (choiceId !== q.correct && m) parts.push(`Ehtimol, xato şu yerda: **${m.title}**. ${m.remedy}`);
  parts.push(q.explanation);
  if (choiceId !== q.correct) parts.push(`Maslahat: ${q.hint}`);
  return parts.join("\n");
}

export function fallbackChat(skillId: SkillId, q?: Question): string {
  const skill = skillsById[skillId];
  const lines = ["Hozir ustoz internetga ulana olmadi, lekin birga öylab köramiz."];
  if (skill) lines.push(`${skill.title}: ${skill.description}`);
  if (q) lines.push(`Maslahat: ${q.hint}`);
  return lines.join("\n");
}
