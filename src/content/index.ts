import type {
  GlossaryEntry,
  KnowledgeGraph,
  Misconception,
  MisconceptionId,
  Question,
  Skill,
  SkillId,
  TutorExample,
} from "../lib/types";
import graphJson from "./graph.json";
import misconceptionsJson from "./misconceptions.json";
import glossaryJson from "./glossary.json";
import qLcm from "./questions/lcm.json";
import qFracCommonDenom from "./questions/frac-common-denom.json";
import qFracAddDiff from "./questions/frac-add-diff.json";

export const graph = graphJson as KnowledgeGraph;
export const skillsById: Record<SkillId, Skill> = Object.fromEntries(graph.skills.map((s) => [s.id, s]));

export const misconceptions = misconceptionsJson as Misconception[];
export const misconceptionsById: Record<MisconceptionId, Misconception> = Object.fromEntries(
  misconceptions.map((m) => [m.id, m]),
);

export const questions: Question[] = [qLcm, qFracCommonDenom, qFracAddDiff].flat() as Question[];
// every skill gets a key, so consumers never see undefined
export const questionsBySkill: Record<SkillId, Question[]> = Object.fromEntries(
  graph.skills.map((s) => [s.id, questions.filter((q) => q.skillId === s.id)]),
);

export const glossary = glossaryJson as GlossaryEntry[];
export const tutorExamples: TutorExample[] = [];
