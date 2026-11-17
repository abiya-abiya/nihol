import type { KnowledgeGraph, Skill, SkillId } from "@/lib/types";

export interface GraphIndex {
  byId: Record<SkillId, Skill>;
  prereqs(id: SkillId): SkillId[];
  /** all transitive prerequisites, nearest first, without duplicates */
  ancestors(id: SkillId): SkillId[];
  /** skills that list `id` as a direct prerequisite */
  dependents(id: SkillId): SkillId[];
  /** prerequisites before dependents; ties keep the order of graph.skills */
  topoOrder: SkillId[];
}

const cache = new WeakMap<KnowledgeGraph, GraphIndex>();

export function indexGraph(graph: KnowledgeGraph): GraphIndex {
  const hit = cache.get(graph);
  if (hit) return hit;

  const byId: Record<SkillId, Skill> = {};
  for (const s of graph.skills) byId[s.id] = s;

  const dependentsMap: Record<SkillId, SkillId[]> = {};
  for (const s of graph.skills) {
    for (const p of s.prerequisites) (dependentsMap[p] ??= []).push(s.id);
  }

  const prereqs = (id: SkillId) => byId[id]?.prerequisites ?? [];

  const ancestors = (id: SkillId): SkillId[] => {
    const seen = new Set<SkillId>();
    const out: SkillId[] = [];
    let frontier = prereqs(id);
    while (frontier.length) {
      const next: SkillId[] = [];
      for (const p of frontier) {
        if (seen.has(p)) continue;
        seen.add(p);
        out.push(p);
        next.push(...prereqs(p));
      }
      frontier = next;
    }
    return out;
  };

  // Kahn's algorithm, stable by declaration order.
  const order = graph.skills.map((s) => s.id);
  const indegree: Record<SkillId, number> = {};
  for (const id of order) indegree[id] = prereqs(id).filter((p) => p in byId).length;
  const topoOrder: SkillId[] = [];
  const done = new Set<SkillId>();
  while (topoOrder.length < order.length) {
    const ready = order.find((id) => !done.has(id) && indegree[id] === 0);
    if (!ready) throw new Error("Knowledge graph has a cycle");
    done.add(ready);
    topoOrder.push(ready);
    for (const d of dependentsMap[ready] ?? []) indegree[d] -= 1;
  }

  const index: GraphIndex = {
    byId,
    prereqs,
    ancestors,
    dependents: (id) => dependentsMap[id] ?? [],
    topoOrder,
  };
  cache.set(graph, index);
  return index;
}
