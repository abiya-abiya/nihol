import type { KnowledgeGraph, PathStep, RootCauseTrace, SkillId, SkillState, StudentSnapshot } from "@/lib/types";
import { isWeak, topMisconceptions } from "./bkt";
import { indexGraph } from "./graph";

export interface Analysis {
  rootGaps: SkillId[];
  traces: RootCauseTrace[];
  path: PathStep[];
}

export function analyze(graph: KnowledgeGraph, skills: Record<SkillId, SkillState>): Analysis {
  const g = indexGraph(graph);
  const weak = (id: SkillId) => isWeak(skills[id]);

  const rootGaps = g.topoOrder.filter((id) => weak(id) && !g.prereqs(id).some(weak));

  const traces: RootCauseTrace[] = [];
  for (const target of graph.entrySkills) {
    if (!weak(target)) continue;
    const chain = [target];
    let current = target;
    while (!rootGaps.includes(current)) {
      const next = g
        .prereqs(current)
        .filter(weak)
        .sort((x, y) => skills[x].p - skills[y].p)[0];
      if (!next || chain.includes(next)) break;
      chain.push(next);
      current = next;
    }
    traces.push({ targetSkillId: target, chain, rootSkillId: current });
  }

  const onPath = new Set<SkillId>([...traces.flatMap((t) => t.chain), ...g.topoOrder.filter(weak)]);
  let ids = g.topoOrder.filter((id) => onPath.has(id));
  if (ids.length === 0) ids = [...graph.entrySkills]; // everything mastered: offer challenge practice

  const path: PathStep[] = ids.map((skillId, i) => ({
    skillId,
    reason: rootGaps.includes(skillId)
      ? "root-gap"
      : graph.entrySkills.includes(skillId)
        ? "target"
        : "on-the-way",
    misconceptionIds: topMisconceptions(skills[skillId]),
    status: i === 0 ? "current" : "locked",
  }));

  return { rootGaps, traces, path };
}

export function buildSnapshot(
  studentId: string,
  graph: KnowledgeGraph,
  skills: Record<SkillId, SkillState>,
  diagnosticDone: boolean,
  now: Date = new Date(),
): StudentSnapshot {
  const { rootGaps, traces, path } = analyze(graph, skills);
  return { studentId, skills, rootGaps, traces, path, diagnosticDone, updatedAt: now.toISOString() };
}
