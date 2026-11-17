"use client";

import { MessageCircleQuestion } from "lucide-react";
import { motion } from "motion/react";
import { LogoMark } from "@/components/brand/logo";
import { MathText } from "@/components/brand/math-text";
import { EASE_OUT_EXPO } from "@/components/brand/motion";
import { Button } from "@/components/ui/button";

/** Text may still be streaming: hide an unfinished [[fraction or **bold tail until it closes. */
export function safePartial(text: string): string {
  let t = text;
  const open = t.lastIndexOf("[[");
  if (open > t.lastIndexOf("]]")) t = t.slice(0, open);
  if ((t.match(/\*\*/g) ?? []).length % 2 === 1) t = t.slice(0, t.lastIndexOf("**"));
  return t;
}

/** The tutor's streamed explanation after a wrong answer. */
export function TutorPanel({ text, loading, onAsk }: { text: string; loading: boolean; onAsk: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
      className="sheet space-y-3 border-ink/15 p-5"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span className="bg-ink-wash grid size-9 place-items-center rounded-full">
          <LogoMark size={22} />
        </span>
        <p className="font-display font-semibold">Ustoz tushuntiradi</p>
      </div>
      {text ? (
        <MathText text={safePartial(text)} className="text-[1.05rem]" />
      ) : (
        <div className="space-y-2" aria-label="Yozilmoqda">
          {[90, 75, 55].map((w) => (
            <div key={w} className="bg-ink-wash h-3.5 animate-pulse rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      )}
      {loading && text && <span className="bg-ink inline-block h-4 w-1.5 animate-pulse rounded-sm align-middle" aria-hidden />}
      {!loading && text && (
        <Button variant="secondary" onClick={onAsk} className="h-11 rounded-xl">
          <MessageCircleQuestion /> Nega? Ustozdan soʻrash
        </Button>
      )}
    </motion.section>
  );
}
