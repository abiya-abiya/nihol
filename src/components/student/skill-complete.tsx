"use client";

import { ArrowRight, Map as MapIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { celebrate } from "@/components/brand/confetti";
import { MasteryRing } from "@/components/brand/mastery-ring";
import { Button } from "@/components/ui/button";
import { normalizeUz } from "@/lib/uz";

/** Full-screen celebration when a path step is mastered. */
export function SkillComplete({
  title,
  p,
  nextTitle,
  onNext,
  onPath,
}: {
  title: string;
  p: number;
  nextTitle?: string;
  onNext: () => void;
  onPath: () => void;
}) {
  useEffect(() => {
    celebrate("big");
  }, []);
  return (
    <motion.div
      className="bg-paper/95 fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-label="Mavzu oʻzlashtirildi"
    >
      <motion.div
        className="sheet w-full max-w-sm space-y-5 p-7 text-center"
        initial={{ scale: 0.85, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
      >
        <MasteryRing p={p} size={112} level="mastered" className="mx-auto" />
        <div className="space-y-2">
          <p className="font-hand text-mastered text-3xl -rotate-2">barakalla!</p>
          <h2 className="text-2xl leading-tight font-bold">{normalizeUz(title)} oʻzlashtirildi</h2>
          {nextTitle && <p className="text-muted-foreground">Keyingi qadam: {normalizeUz(nextTitle)}</p>}
        </div>
        <div className="space-y-2">
          {nextTitle && (
            <Button onClick={onNext} className="h-14 w-full rounded-2xl text-lg font-semibold">
              Keyingi qadam <ArrowRight className="size-5" />
            </Button>
          )}
          <Button variant={nextTitle ? "ghost" : "default"} onClick={onPath} className="h-12 w-full rounded-2xl">
            <MapIcon /> Yoʻlimga qaytish
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
