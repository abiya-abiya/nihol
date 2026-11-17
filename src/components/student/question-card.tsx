"use client";

import { MathText } from "@/components/brand/math-text";
import { normalizeUz } from "@/lib/uz";
import type { ChoiceId, Question } from "@/lib/types";
import { ChoiceButton, type ChoiceState } from "./choice-button";

/** One question with its four options. `stateOf` decides how each option looks. */
export function QuestionCard({
  question,
  topic,
  stateOf,
  disabled,
  onSelect,
}: {
  question: Question;
  topic?: string;
  stateOf?: (id: ChoiceId) => ChoiceState;
  disabled?: boolean;
  onSelect?: (id: ChoiceId) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="sheet space-y-3 px-5 py-6">
        {topic && <p className="text-muted-foreground text-sm font-medium">{normalizeUz(topic)}</p>}
        <MathText text={question.stem} className="text-[1.35rem] leading-[1.75] font-medium" fracSize="lg" />
      </div>
      <div className="grid gap-3" role="group" aria-label="Javob variantlari">
        {question.choices.map((c) => (
          <ChoiceButton
            key={c.id}
            id={c.id}
            text={c.text}
            state={stateOf?.(c.id) ?? "idle"}
            disabled={disabled}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
