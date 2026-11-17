import type { SkillId, Worksheet } from "@/lib/types";
import { generateQuestion, generators } from "./index";

/** `count` items, round-robin over the skills that have a generator; deterministic for a seed. */
export function generateWorksheetItems(skillIds: SkillId[], count: number, seed: number): Worksheet["items"] {
  const usable = skillIds.filter((id) => generators[id]);
  if (!usable.length) return [];
  return Array.from({ length: count }, (_, i) => {
    const skillId = usable[i % usable.length];
    const q = generateQuestion(skillId, seed * 1000 + i)!;
    const answer = q.choices.find((c) => c.id === q.correct)!.text;
    return { stem: q.stem, answer, skillId, source: "generated" as const };
  });
}
