import type { MasteryLevel, SkillId, SkillState } from "@/lib/types";

export interface BktParams {
  pInit: number;
  pSlip: number;
  pGuess: number;
  pTransit: number;
}

export const DIAGNOSTIC_PARAMS: BktParams = { pInit: 0.5, pSlip: 0.1, pGuess: 0.2, pTransit: 0 };
export const PRACTICE_PARAMS: BktParams = { ...DIAGNOSTIC_PARAMS, pTransit: 0.15 };

export const MASTERED_P = 0.8;
export const GAP_P = 0.5;
export const INFERRED_P = 0.85;
export const PRACTICE_DONE_P = 0.9;
export const PRACTICE_MIN_ATTEMPTS = 3;

/** Bayesian Knowledge Tracing posterior after one answer, then the learning transition. */
export function updateP(p: number, correct: boolean, params: BktParams): number {
  const { pSlip: s, pGuess: g, pTransit: t } = params;
  const posterior = correct
    ? (p * (1 - s)) / (p * (1 - s) + (1 - p) * g)
    : (p * s) / (p * s + (1 - p) * (1 - g));
  return posterior + (1 - posterior) * t;
}

export function levelOf(s: SkillState | undefined): MasteryLevel {
  if (!s || (s.attempts === 0 && !s.inferred)) return "unknown";
  if (s.p >= MASTERED_P) return "mastered";
  if (s.p < GAP_P) return "gap";
  return "shaky";
}

export function initialSkillState(skillId: SkillId, p = DIAGNOSTIC_PARAMS.pInit): SkillState {
  return { skillId, p, attempts: 0, correct: 0, inferred: false, misconceptions: {}, practiceAttempts: 0 };
}

/** A skill the student has shown (not inferred) to be weak. */
export function isWeak(s: SkillState | undefined): boolean {
  if (!s || s.inferred || s.attempts === 0) return false;
  return s.p < MASTERED_P;
}

/** Misconception ids seen on a skill, most frequent first. */
export function topMisconceptions(s: SkillState | undefined): string[] {
  if (!s) return [];
  return Object.entries(s.misconceptions)
    .filter(([, n]) => (n ?? 0) > 0)
    .sort((x, y) => (y[1] ?? 0) - (x[1] ?? 0))
    .map(([id]) => id);
}
