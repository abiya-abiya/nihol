"use client";

import { useState } from "react";
import { levelColor, levelLabel } from "@/components/brand/levels";
import { MasteryRing } from "@/components/brand/mastery-ring";
import { KnowledgeMap } from "@/components/student/knowledge-map";
import { levelOf } from "@/engine/bkt";
import type { SubjectContent, SubjectProgress } from "@/lib/types";
import { normalizeUz } from "@/lib/uz";
import { toSnapshot } from "./snapshot";

/** Lesson knowledge map + lesson list for one subject (student and parent views). */
export function SubjectMap({
  subject,
  progress,
  studentId,
  mode = "reveal",
}: {
  subject: SubjectContent;
  progress?: SubjectProgress | null;
  studentId: string;
  mode?: "reveal" | "static";
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const snap = toSnapshot(studentId, progress);
  const lessons = subject.graph.skills;
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
      <div className="sheet px-1 pt-2 pb-1">
        <KnowledgeMap
          key={subject.meta.id}
          graph={subject.graph}
          snapshot={snap}
          mode={mode}
          highlightTrace={false}
          selectedSkillId={picked}
          onSkillClick={(id) => setPicked((p) => (p === id ? null : id))}
          className="lg:mx-auto lg:h-[min(64dvh,640px)] lg:w-auto lg:max-w-full"
        />
      </div>
      <ol className="grid gap-2">
        {lessons.map((l, i) => {
          const st = snap.skills[l.id];
          const level = levelOf(st);
          return (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => setPicked((p) => (p === l.id ? null : l.id))}
                aria-pressed={picked === l.id}
                className="sheet flex w-full items-center gap-3 p-3 text-left transition aria-pressed:ring-2 aria-pressed:ring-ink/40"
              >
                <span className="font-display text-ink-soft w-6 text-center text-sm font-bold">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{normalizeUz(l.title)}</span>
                  <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <span className="size-2 rounded-full" style={{ background: levelColor(level) }} />
                    {levelLabel(level)}
                  </span>
                </span>
                <MasteryRing p={st?.p ?? 0} size={34} level={level} />
              </button>
              {picked === l.id && <p className="text-muted-foreground px-3 pt-2 text-sm">{normalizeUz(l.description)}</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
