import { describe, expect, it } from "vitest";
import type { ChoiceId, KnowledgeGraph, Question, SkillId, SkillState, StudentSnapshot } from "@/lib/types";
import {
  DIAGNOSTIC_PARAMS,
  analyze,
  answerDiagnostic,
  answerPractice,
  nextDiagnosticQuestion,
  startDiagnostic,
  updateP,
} from "@/engine";

// a (entry) <- b <- c ; a <- d
const graph: KnowledgeGraph = {
  subject: "Test",
  topic: "Fixture",
  entrySkills: ["a"],
  skills: [
    { id: "a", title: "A", short: "A", grade: 6, prerequisites: ["b", "d"], description: "" },
    { id: "b", title: "B", short: "B", grade: 6, prerequisites: ["c"], description: "" },
    { id: "c", title: "C", short: "C", grade: 5, prerequisites: [], description: "" },
    { id: "d", title: "D", short: "D", grade: 5, prerequisites: [], description: "" },
  ],
};

const q = (skillId: SkillId, n: number, difficulty: 1 | 2 | 3 = 2): Question => ({
  id: `${skillId}-0${n}`,
  skillId,
  difficulty,
  stem: "?",
  choices: [
    { id: "a", text: "1" },
    { id: "b", text: "2", misconceptionId: "m1" },
    { id: "c", text: "3" },
    { id: "d", text: "4" },
  ],
  correct: "a",
  explanation: "",
  hint: "",
  source: "bank",
});

const questionsBySkill: Record<SkillId, Question[]> = {
  a: [q("a", 1)],
  b: [q("b", 1)],
  c: [q("c", 1), q("c", 2, 1), q("c", 3, 3)],
  d: [q("d", 1)],
};

const st = (skillId: SkillId, p: number, attempts = 1): SkillState => ({
  skillId,
  p,
  attempts,
  correct: p >= 0.5 ? attempts : 0,
  inferred: false,
  misconceptions: {},
});

describe("engine", () => {
  it("BKT update moves p in the right direction with the diagnostic params", () => {
    expect(updateP(0.5, true, DIAGNOSTIC_PARAMS)).toBeCloseTo(0.818, 2);
    expect(updateP(0.5, false, DIAGNOSTIC_PARAMS)).toBeCloseTo(0.111, 2);
  });

  it("diagnostic descends on a wrong answer and infers ancestors on a correct one", () => {
    let s = startDiagnostic(graph);
    const first = nextDiagnosticQuestion(s, questionsBySkill)!;
    expect(first.skillId).toBe("a");
    s = answerDiagnostic(s, graph, first, "b" as ChoiceId);
    expect(s.queue.slice(0, 2)).toEqual(["b", "d"]);
    expect(s.skills.a.misconceptions.m1).toBe(1);

    const second = nextDiagnosticQuestion(s, questionsBySkill)!;
    expect(second.skillId).toBe("b");
    s = answerDiagnostic(s, graph, second, "a");
    expect(s.skills.c.inferred).toBe(true);
    expect(s.skills.c.p).toBeGreaterThanOrEqual(0.85);
    expect(s.queue).not.toContain("c");
  });

  it("finds the root gap and the trace down to it", () => {
    const skills = { a: st("a", 0.1), b: st("b", 0.1), c: st("c", 0.1), d: st("d", 0.9) };
    const r = analyze(graph, skills);
    expect(r.rootGaps).toEqual(["c"]);
    expect(r.traces).toEqual([{ targetSkillId: "a", chain: ["a", "b", "c"], rootSkillId: "c" }]);
  });

  it("builds a topological path that starts at the root", () => {
    const skills = { a: st("a", 0.1), b: st("b", 0.1), c: st("c", 0.1), d: st("d", 0.9) };
    const { path } = analyze(graph, skills);
    expect(path.map((p) => p.skillId)).toEqual(["c", "b", "a"]);
    expect(path.map((p) => p.status)).toEqual(["current", "locked", "locked"]);
    expect(path[0].reason).toBe("root-gap");
    expect(path[2].reason).toBe("target");
  });

  it("practice completes a step at p >= 0.9 after 3 practice answers and unlocks the next", () => {
    const skills = { a: st("a", 0.1), b: st("b", 0.1), c: st("c", 0.1), d: st("d", 0.9) };
    const { rootGaps, traces, path } = analyze(graph, skills);
    let snap: StudentSnapshot = {
      studentId: "s1",
      skills,
      rootGaps,
      traces,
      path,
      diagnosticDone: true,
      updatedAt: new Date(0).toISOString(),
    };
    snap = answerPractice(snap, graph, q("c", 2, 1), "a");
    snap = answerPractice(snap, graph, q("c", 3, 3), "a");
    expect(snap.path[0].status).toBe("current");
    snap = answerPractice(snap, graph, q("c", 1), "a");
    expect(snap.skills.c.p).toBeGreaterThanOrEqual(0.9);
    expect(snap.path[0].status).toBe("done");
    expect(snap.path[1].status).toBe("current");
  });
});
