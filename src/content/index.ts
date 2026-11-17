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
import tutorExamplesJson from "./tutor-examples.json";
import qNatMul from "./questions/nat-mul.json";
import qNatDiv from "./questions/nat-div.json";
import qDivisibility from "./questions/divisibility.json";
import qGcd from "./questions/gcd.json";
import qLcm from "./questions/lcm.json";
import qFracConcept from "./questions/frac-concept.json";
import qFracEquiv from "./questions/frac-equiv.json";
import qFracSimplify from "./questions/frac-simplify.json";
import qFracCommonDenom from "./questions/frac-common-denom.json";
import qFracCompare from "./questions/frac-compare.json";
import qFracAddSame from "./questions/frac-add-same.json";
import qFracAddDiff from "./questions/frac-add-diff.json";
import qMixedNumbers from "./questions/mixed-numbers.json";
import qMixedAdd from "./questions/mixed-add.json";
import qFracMul from "./questions/frac-mul.json";
import qFracDiv from "./questions/frac-div.json";
import qFracWord from "./questions/frac-word.json";

export const graph = graphJson as KnowledgeGraph;
export const skillsById: Record<SkillId, Skill> = Object.fromEntries(graph.skills.map((s) => [s.id, s]));

export const misconceptions = misconceptionsJson as Misconception[];
export const misconceptionsById: Record<MisconceptionId, Misconception> = Object.fromEntries(
  misconceptions.map((m) => [m.id, m]),
);

export const questions: Question[] = [
  qNatMul,
  qNatDiv,
  qDivisibility,
  qGcd,
  qLcm,
  qFracConcept,
  qFracEquiv,
  qFracSimplify,
  qFracCommonDenom,
  qFracCompare,
  qFracAddSame,
  qFracAddDiff,
  qMixedNumbers,
  qMixedAdd,
  qFracMul,
  qFracDiv,
  qFracWord,
].flat() as Question[];
// every skill gets a key, so consumers never see undefined
export const questionsBySkill: Record<SkillId, Question[]> = Object.fromEntries(
  graph.skills.map((s) => [s.id, questions.filter((q) => q.skillId === s.id)]),
);

export const glossary = glossaryJson as GlossaryEntry[];
export const tutorExamples = tutorExamplesJson as TutorExample[];
