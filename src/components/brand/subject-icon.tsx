import {
  Atom,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe2,
  Languages,
  Leaf,
  type LucideIcon,
  Music,
  Palette,
  Sigma,
  BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  sigma: Sigma,
  "book-open": BookOpen,
  languages: Languages,
  leaf: Leaf,
  calculator: Calculator,
  "flask-conical": FlaskConical,
  atom: Atom,
  globe: Globe2,
  music: Music,
  palette: Palette,
  book: BookMarked,
};

export const SUBJECT_ICON_NAMES = Object.keys(ICONS);

/** Rounded tile with the subject's lucide icon on its colour. */
export function SubjectIcon({ icon, color, size = 44, className }: { icon: string; color: string; size?: number; className?: string }) {
  const Icon = ICONS[icon] ?? BookMarked;
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-2xl text-white shadow-[var(--shadow-sheet)]", className)}
      style={{ width: size, height: size, background: color }}
      aria-hidden
    >
      <Icon style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={2.2} />
    </span>
  );
}
