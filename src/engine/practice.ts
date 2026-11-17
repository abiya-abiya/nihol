import type { ChoiceId, KnowledgeGraph, PathStep, Question, SkillId, StudentSnapshot } from "@/lib/types";
import {
  PRACTICE_DONE_P,
  PRACTICE_MIN_ATTEMPTS,
  PRACTICE_PARAMS,
  initialSkillState,
  topMisconceptions,
  updateP,
} from "./bkt";
import { analyze } from "./analyze";

/** Unasked bank questions first (easy to hard), then a generated one, then recycle. */
export function pickPracticeQuestion(
  skillId: SkillId,
  askedIds: string[],
  questionsBySkill: Record<SkillId, Question[]>,
  generate?: (skillId: SkillId, seed: number) => Question | null,
  seed: number = Date.now(),
): Question {
  const bank = questionsBySkill[skillId] ?? [];
  const fresh = bank.filter((q) => !askedIds.includes(q.id)).sort((a, b) => a.difficulty - b.difficulty);
  if (fresh[0]) return fresh[0];
  const generated = generate?.(skillId, seed);
  if (generated) return generated;
  if (bank.length) return bank[askedIds.length % bank.length];
  throw new Error(`No practice questions for skill "${skillId}"`);
}

export function answerPractice(
  snapshot: StudentSnapshot,
  graph: KnowledgeGraph,
  q: Question,
  choiceId: ChoiceId,
  now: Date = new Date(),
): StudentSnapshot {
  const prev = snapshot.skills[q.skillId] ?? initialSkillState(q.skillId);
  const correct = choiceId === q.correct;
  const misconceptionId = q.choices.find((c) => c.id === choiceId)?.misconceptionId;
  const misconceptions = { ...prev.misconceptions };
  if (!correct && misconceptionId) misconceptions[misconceptionId] = (misconceptions[misconceptionId] ?? 0) + 1;

  const updated = {
    ...prev,
    p: updateP(prev.p, correct, PRACTICE_PARAMS),
    attempts: prev.attempts + 1,
    correct: prev.correct + (correct ? 1 : 0),
    inferred: false,
    misconceptions,
    practiceAttempts: (prev.practiceAttempts ?? 0) + 1,
  };
  const skills = { ...snapshot.skills, [q.skillId]: updated };

  let path: PathStep[] = snapshot.path.map((s) => ({ ...s }));
  const step = path.find((s) => s.skillId === q.skillId && s.status === "current");
  if (step && updated.p >= PRACTICE_DONE_P && (updated.practiceAttempts ?? 0) >= PRACTICE_MIN_ATTEMPTS) {
    step.status = "done";
    const next = path.find((s) => s.status === "locked");
    if (next) next.status = "current";
  }
  path = path.map((s) => (s.skillId === q.skillId ? { ...s, misconceptionIds: topMisconceptions(updated) } : s));

  // Root gaps follow the new evidence; the story (traces) and the path stay as diagnosed.
  const { rootGaps } = analyze(graph, skills);
  return { ...snapshot, skills, rootGaps, path, updatedAt: now.toISOString() };
}
