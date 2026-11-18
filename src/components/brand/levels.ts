import type { MasteryLevel } from "@/lib/types";

/** CSS colour for a mastery level (a var() reference, usable in style props and SVG). */
export function levelColor(level: MasteryLevel): string {
  switch (level) {
    case "mastered":
      return "var(--mastered)";
    case "shaky":
      return "var(--shaky)";
    case "gap":
      return "var(--gap)";
    default:
      return "var(--unknown)";
  }
}

export function levelLabel(level: MasteryLevel): string {
  switch (level) {
    case "mastered":
      return "Özlaştirilgan";
    case "shaky":
      return "Mustahkamlaş kerak";
    case "gap":
      return "Böşliq";
    default:
      return "Tekşirilmagan";
  }
}

export const LEVELS: MasteryLevel[] = ["mastered", "shaky", "gap", "unknown"];
