import type { ChoiceId, KnowledgeGraph, Question, SkillId, SkillState } from "@/lib/types";
import { DIAGNOSTIC_PARAMS, INFERRED_P, initialSkillState, updateP } from "./bkt";
import { indexGraph } from "./graph";

export const MAX_DIAGNOSTIC_QUESTIONS = 12;
const DIFFICULTY_ORDER = [2, 1, 3] as const;

export interface DiagnosticState {
  queue: SkillId[];
  askedQuestionIds: string[];
  skills: Record<SkillId, SkillState>;
  count: number;
  done: boolean;
}

const undecided = (s: SkillState | undefined) => !!s && s.attempts === 0 && !s.inferred;

export function startDiagnostic(graph: KnowledgeGraph): DiagnosticState {
  const skills: Record<SkillId, SkillState> = {};
  for (const s of graph.skills) skills[s.id] = initialSkillState(s.id);
  return { queue: [...graph.entrySkills], askedQuestionIds: [], skills, count: 0, done: false };
}

function pickQuestion(skillId: SkillId, asked: string[], questionsBySkill: Record<SkillId, Question[]>) {
  const pool = (questionsBySkill[skillId] ?? []).filter((q) => !asked.includes(q.id));
  for (const d of DIFFICULTY_ORDER) {
    const q = pool.find((x) => x.difficulty === d);
    if (q) return q;
  }
  return null;
}

/** Deterministic: same answers give the same questions (the stage demo relies on it). */
export function nextDiagnosticQuestion(
  state: DiagnosticState,
  questionsBySkill: Record<SkillId, Question[]>,
): Question | null {
  if (state.done || state.count >= MAX_DIAGNOSTIC_QUESTIONS) return null;
  for (const skillId of state.queue) {
    if (!undecided(state.skills[skillId])) continue;
    const q = pickQuestion(skillId, state.askedQuestionIds, questionsBySkill);
    if (q) return q;
  }
  return null;
}

export function answerDiagnostic(
  state: DiagnosticState,
  graph: KnowledgeGraph,
  q: Question,
  choiceId: ChoiceId,
): DiagnosticState {
  const g = indexGraph(graph);
  const skills = { ...state.skills };
  const prev = skills[q.skillId] ?? initialSkillState(q.skillId);
  const correct = choiceId === q.correct;
  const misconceptionId = q.choices.find((c) => c.id === choiceId)?.misconceptionId;

  const misconceptions = { ...prev.misconceptions };
  if (!correct && misconceptionId) misconceptions[misconceptionId] = (misconceptions[misconceptionId] ?? 0) + 1;

  skills[q.skillId] = {
    ...prev,
    p: updateP(prev.p, correct, DIAGNOSTIC_PARAMS),
    attempts: prev.attempts + 1,
    correct: prev.correct + (correct ? 1 : 0),
    inferred: false,
    misconceptions,
  };

  let queue = state.queue.filter((id) => id !== q.skillId);

  if (correct) {
    // Knowing a skill implies knowing everything below it.
    for (const anc of g.ancestors(q.skillId)) {
      const s = skills[anc];
      if (s && s.attempts === 0) skills[anc] = { ...s, p: Math.max(s.p, INFERRED_P), inferred: true };
    }
    queue = queue.filter((id) => undecided(skills[id]));
  } else {
    // Descend: test the direct prerequisites next.
    const down = g.prereqs(q.skillId).filter((id) => undecided(skills[id]));
    queue = [...down, ...queue.filter((id) => !down.includes(id))];
  }

  const count = state.count + 1;
  const done = count >= MAX_DIAGNOSTIC_QUESTIONS || !queue.some((id) => undecided(skills[id]));

  return { queue, askedQuestionIds: [...state.askedQuestionIds, q.id], skills, count, done };
}
