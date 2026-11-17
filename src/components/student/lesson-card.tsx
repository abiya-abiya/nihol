"use client";

import { ArrowRight } from "lucide-react";
import { MathText } from "@/components/brand/math-text";
import { Stagger, StaggerItem } from "@/components/brand/motion";
import { Button } from "@/components/ui/button";
import type { Misconception, Question, Skill } from "@/lib/types";
import { normalizeUz } from "@/lib/uz";

/** Short lesson before practice: why the skill matters, the likely wrong idea, one worked example. */
export function LessonCard({
  skill,
  misconception,
  example,
  onStart,
}: {
  skill: Skill;
  misconception: Misconception | null;
  example: Question | null;
  onStart: () => void;
}) {
  const correctText = example?.choices.find((c) => c.id === example.correct)?.text;
  return (
    <Stagger className="space-y-4">
      <StaggerItem className="space-y-2">
        <h1 className="text-[1.9rem] leading-tight font-bold">{normalizeUz(skill.title)}</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">{normalizeUz(skill.description)}</p>
      </StaggerItem>

      {misconception && (
        <StaggerItem className="sheet space-y-2 border-dashed border-red-pen/40 p-5">
          <p className="font-hand text-red-pen -rotate-1 text-2xl">Sen shunday oʻylagan boʻlishing mumkin</p>
          <p className="font-semibold">{normalizeUz(misconception.title)}</p>
          <MathText text={misconception.example} className="text-red-pen font-semibold line-through decoration-2" />
          <div className="bg-mastered/8 rounded-xl p-3">
            <p className="text-mastered text-sm font-bold">Toʻgʻrisi</p>
            <MathText text={misconception.remedy} />
          </div>
        </StaggerItem>
      )}

      {example && (
        <StaggerItem className="sheet space-y-3 p-5">
          <p className="text-muted-foreground text-sm font-semibold">Namuna</p>
          <MathText text={example.stem} className="text-lg font-medium" />
          <div className="border-ink/15 space-y-1 border-l-2 pl-3">
            <MathText text={example.explanation} />
            {correctText && (
              <p className="font-semibold">
                Javob: <MathText as="span" text={correctText} />
              </p>
            )}
          </div>
        </StaggerItem>
      )}

      <StaggerItem>
        <Button onClick={onStart} className="h-14 w-full rounded-2xl text-lg font-semibold">
          Mashq qilish <ArrowRight className="size-5" />
        </Button>
      </StaggerItem>
    </Stagger>
  );
}
