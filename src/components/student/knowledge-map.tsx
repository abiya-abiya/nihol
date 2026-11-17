"use client";

import dagre from "@dagrejs/dagre";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo } from "react";
import { levelLabel } from "@/components/brand/levels";
import { levelOf } from "@/engine/bkt";
import type { KnowledgeGraph, MasteryLevel, SkillId, StudentSnapshot } from "@/lib/types";
import { normalizeUz } from "@/lib/uz";
import { cn } from "@/lib/utils";

// Layout units (SVG viewBox). The map scales to its container width.
const NODE_W = 86;
const NODE_H = 62;
const R = 17;
const LABEL_SIZE = 11.5;

interface Placed {
  id: SkillId;
  x: number;
  cy: number; // circle centre
  ly: number; // label baseline of first line
  lines: string[];
  rank: number;
}

interface Layout {
  width: number;
  height: number;
  nodes: Record<SkillId, Placed>;
  edges: Array<{ from: SkillId; to: SkillId }>;
}

const layoutCache = new WeakMap<KnowledgeGraph, Layout>();

function splitLabel(s: string): string[] {
  const text = normalizeUz(s);
  if (text.length <= 11 || !text.includes(" ")) return [text];
  const mid = text.length / 2;
  let best = -1;
  for (let i = 0; i < text.length; i++) if (text[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  const a = text.slice(0, best);
  const b = text.slice(best + 1);
  return b.length < 3 || a.length < 3 ? [text] : [a, b];
}

function computeLayout(graph: KnowledgeGraph): Layout {
  const hit = layoutCache.get(graph);
  if (hit) return hit;
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "BT", nodesep: 8, ranksep: 30, marginx: 14, marginy: 22 });
  g.setDefaultEdgeLabel(() => ({}));
  for (const s of graph.skills) g.setNode(s.id, { width: NODE_W, height: NODE_H });
  const edges: Layout["edges"] = [];
  for (const s of graph.skills) {
    for (const p of s.prerequisites) {
      g.setEdge(p, s.id);
      edges.push({ from: p, to: s.id });
    }
  }
  dagre.layout(g);
  const ys = [...new Set(graph.skills.map((s) => Math.round(g.node(s.id).y)))].sort((a, b) => b - a);
  const nodes: Layout["nodes"] = {};
  for (const s of graph.skills) {
    const n = g.node(s.id);
    nodes[s.id] = {
      id: s.id,
      x: n.x,
      cy: n.y - 10,
      ly: n.y + 19,
      lines: splitLabel(s.short),
      rank: ys.indexOf(Math.round(n.y)), // 0 = bottom (roots)
    };
  }
  const gl = g.graph();
  const layout = { width: gl.width ?? 400, height: gl.height ?? 400, nodes, edges };
  layoutCache.set(graph, layout);
  return layout;
}

const curve = (a: Placed, b: Placed) => {
  const my = (a.cy + b.cy) / 2;
  return `M ${a.x} ${a.cy} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.cy}`;
};

const LEVEL_STYLE: Record<MasteryLevel, { stroke: string; fill: string; dash?: string }> = {
  mastered: { stroke: "var(--mastered)", fill: "color-mix(in oklab, var(--mastered) 16%, white)" },
  shaky: { stroke: "var(--shaky)", fill: "color-mix(in oklab, var(--shaky) 18%, white)" },
  gap: { stroke: "var(--red-pen)", fill: "color-mix(in oklab, var(--red-pen) 14%, white)" },
  unknown: { stroke: "var(--unknown)", fill: "white", dash: "3 3" },
};

function LevelGlyph({ level, x, y }: { level: MasteryLevel; x: number; y: number }) {
  const common = { fill: "none", strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (level === "mastered") return <path d={`M ${x - 6} ${y} l 4 4 l 8 -9`} stroke="var(--mastered)" {...common} />;
  if (level === "gap")
    return (
      <g stroke="var(--red-pen)" {...common}>
        <path d={`M ${x} ${y - 7} v 8`} />
        <circle cx={x} cy={y + 6} r={0.6} />
      </g>
    );
  if (level === "shaky") return <path d={`M ${x - 7} ${y} q 3.5 -5 7 0 t 7 0`} stroke="var(--shaky)" {...common} />;
  return <circle cx={x} cy={y} r={2.2} fill="var(--unknown)" />;
}

export interface KnowledgeMapProps {
  graph: KnowledgeGraph;
  snapshot: StudentSnapshot;
  mode: "reveal" | "static";
  highlightTrace?: boolean;
  onSkillClick?: (id: SkillId) => void;
  /** reveal mode: called once the root callout has appeared */
  onRevealDone?: () => void;
  selectedSkillId?: SkillId | null;
  className?: string;
}

/** The knowledge graph drawn bottom-up (roots at the bottom); the root-cause trace in red pen. */
export function KnowledgeMap({
  graph,
  snapshot,
  mode,
  highlightTrace = true,
  onSkillClick,
  onRevealDone,
  selectedSkillId,
  className,
}: KnowledgeMapProps) {
  const reduce = useReducedMotion();
  const layout = useMemo(() => computeLayout(graph), [graph]);
  const animate = mode === "reveal" && !reduce;
  const maxRank = Math.max(...Object.values(layout.nodes).map((n) => n.rank));

  const traces = highlightTrace ? snapshot.traces : [];
  const primary = traces[0];
  const roots = [...new Set(traces.map((t) => t.rootSkillId))];

  // Timeline (seconds).
  const T_NODES = 0.15;
  const T_FILL = 0.35 + (maxRank + 1) * T_NODES;
  const T_TRACE = T_FILL + 0.9;
  const SEG = 0.55;
  const T_ROOT = T_TRACE + (primary ? (primary.chain.length - 1) * SEG : 0) + 0.15;

  useEffect(() => {
    if (!onRevealDone) return;
    const ms = animate ? (T_ROOT + 0.6) * 1000 : 0;
    const t = window.setTimeout(onRevealDone, ms);
    return () => window.clearTimeout(t);
  }, [animate, onRevealDone, T_ROOT]);

  const traceSegments = traces.flatMap((t, ti) =>
    t.chain.slice(0, -1).map((from, i) => ({ key: `${ti}-${i}`, from, to: t.chain[i + 1], order: ti === 0 ? i : primary ? primary.chain.length - 1 : 0 })),
  );

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className={cn("h-auto w-full font-sans select-none", className)}
      role="img"
      aria-label="Bilim xaritasi"
    >
      {/* base edges */}
      {layout.edges.map((e) => {
        const a = layout.nodes[e.from];
        const b = layout.nodes[e.to];
        if (!a || !b) return null;
        return (
          <motion.path
            key={`${e.from}-${e.to}`}
            d={curve(a, b)}
            fill="none"
            stroke="var(--ink-soft)"
            strokeOpacity={0.32}
            strokeWidth={1.6}
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + Math.min(a.rank, b.rank) * T_NODES, duration: 0.4 }}
          />
        );
      })}

      {/* root-cause trace: target down to the root */}
      {traceSegments.map((s) => {
        const a = layout.nodes[s.from];
        const b = layout.nodes[s.to];
        if (!a || !b) return null;
        return (
          <motion.path
            key={s.key}
            d={curve(a, b)}
            fill="none"
            stroke="var(--red-pen)"
            strokeWidth={4}
            strokeLinecap="round"
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: T_TRACE + s.order * SEG, duration: SEG, ease: "easeInOut" }}
          />
        );
      })}

      {/* root halo */}
      {roots.map((id) => {
        const n = layout.nodes[id];
        if (!n) return null;
        return (
          <motion.circle
            key={`halo-${id}`}
            cx={n.x}
            cy={n.cy}
            r={R + 4}
            fill="none"
            stroke="var(--red-pen)"
            strokeWidth={3}
            initial={{ opacity: 0, scale: 1 }}
            animate={reduce ? { opacity: 0.5 } : { opacity: [0, 0.65, 0], scale: [1, 1.7, 1.9] }}
            transition={
              reduce
                ? { duration: 0 }
                : { delay: animate ? T_ROOT : 0, duration: 1.6, repeat: Infinity, repeatDelay: 0.4, ease: "easeOut" }
            }
            style={{ transformOrigin: `${n.x}px ${n.cy}px` }}
          />
        );
      })}

      {/* nodes */}
      {graph.skills.map((s) => {
        const n = layout.nodes[s.id];
        const level = levelOf(snapshot.skills[s.id]);
        const st = LEVEL_STYLE[level];
        const isRoot = roots.includes(s.id);
        const selected = selectedSkillId === s.id;
        const labelW = Math.max(...n.lines.map((l) => l.length)) * LABEL_SIZE * 0.56 + 10;
        const rise = 0.35 + n.rank * T_NODES;
        return (
          <motion.g
            key={s.id}
            initial={animate ? { opacity: 0, y: 14 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rise, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            role={onSkillClick ? "button" : undefined}
            tabIndex={onSkillClick ? 0 : undefined}
            aria-label={`${normalizeUz(s.title)}: ${levelLabel(level)}`}
            onClick={onSkillClick ? () => onSkillClick(s.id) : undefined}
            onKeyDown={onSkillClick ? (e) => (e.key === "Enter" || e.key === " ") && onSkillClick(s.id) : undefined}
            className={cn(onSkillClick && "cursor-pointer outline-none")}
          >
            {selected && <circle cx={n.x} cy={n.cy} r={R + 5} fill="none" stroke="var(--ink)" strokeWidth={2} strokeDasharray="4 3" />}
            {/* neutral base, then the level colour fades in */}
            <circle cx={n.x} cy={n.cy} r={R} fill="white" stroke="var(--ink-soft)" strokeOpacity={0.5} strokeWidth={2} />
            <motion.g
              initial={animate ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ delay: T_FILL + n.rank * 0.05, duration: 0.45 }}
            >
              <circle
                cx={n.x}
                cy={n.cy}
                r={R}
                fill={st.fill}
                stroke={st.stroke}
                strokeWidth={isRoot ? 3.5 : 2.6}
                strokeDasharray={st.dash}
              />
              <LevelGlyph level={level} x={n.x} y={n.cy} />
            </motion.g>
            <rect
              x={n.x - labelW / 2}
              y={n.ly - LABEL_SIZE - 1}
              width={labelW}
              height={n.lines.length * (LABEL_SIZE + 2) + 5}
              rx={6}
              fill="var(--paper)"
              fillOpacity={0.92}
            />
            <text
              x={n.x}
              y={n.ly}
              textAnchor="middle"
              fontSize={LABEL_SIZE}
              fontWeight={isRoot ? 700 : 600}
              fill={isRoot ? "var(--red-pen-strong)" : "var(--ink)"}
            >
              {n.lines.map((l, i) => (
                <tspan key={i} x={n.x} dy={i === 0 ? 0 : LABEL_SIZE + 2}>
                  {l}
                </tspan>
              ))}
            </text>
          </motion.g>
        );
      })}

      {/* hand-written callout next to the primary root */}
      {primary &&
        (() => {
          const n = layout.nodes[primary.rootSkillId];
          if (!n) return null;
          const right = n.x < layout.width * 0.6;
          const dx = right ? 1 : -1;
          const tx = n.x + dx * (R + 34);
          return (
            <motion.g
              initial={animate ? { opacity: 0, scale: 0.6 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: animate ? T_ROOT : 0, type: "spring", stiffness: 260, damping: 18 }}
              style={{ transformOrigin: `${n.x}px ${n.cy}px` }}
            >
              <path
                d={`M ${tx - dx * 6} ${n.cy - 14} Q ${n.x + dx * (R + 14)} ${n.cy - 22} ${n.x + dx * (R + 5)} ${n.cy - 6}`}
                fill="none"
                stroke="var(--red-pen)"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <text
                x={tx}
                y={n.cy - 18}
                textAnchor={right ? "start" : "end"}
                className="font-hand"
                fontSize={19}
                fontWeight={700}
                fill="var(--red-pen)"
                transform={`rotate(-4 ${tx} ${n.cy - 18})`}
              >
                ildiz shu yerda!
              </text>
            </motion.g>
          );
        })()}
    </svg>
  );
}
