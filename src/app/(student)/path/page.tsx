"use client";

import { Map as MapIcon, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LogoMark } from "@/components/brand/logo";
import { MasteryRing } from "@/components/brand/mastery-ring";
import { FadeIn } from "@/components/brand/motion";
import { KnowledgeMap } from "@/components/student/knowledge-map";
import { PathStem } from "@/components/student/path-stem";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { graph, skillsById } from "@/lib/content";
import { getLocalStudent, loadSnapshot } from "@/lib/student-store";
import type { PathStep, Student, StudentSnapshot } from "@/lib/types";
import { normalizeUz } from "@/lib/uz";

export default function PathPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [snap, setSnap] = useState<StudentSnapshot | null>(null);

  useEffect(() => {
    const s = getLocalStudent();
    const sn = loadSnapshot();
    if (!s || !sn?.diagnosticDone) {
      router.replace(s ? "/diagnostic" : "/start");
      return;
    }
    setStudent(s);
    setSnap(sn);
  }, [router]);

  useEffect(() => {
    if (!snap) return;
    const t = window.setTimeout(() => {
      document.querySelector("[aria-label$='joriy qadam']")?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 600);
    return () => window.clearTimeout(t);
  }, [snap]);

  const progress = useMemo(() => {
    if (!snap) return 0;
    const ps = snap.path.map((s) => snap.skills[s.skillId]?.p ?? 0);
    return ps.length ? ps.reduce((a, b) => a + b, 0) / ps.length : 0;
  }, [snap]);

  if (!snap || !student) {
    return (
      <div className="space-y-4 pt-10">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-[60dvh] w-full rounded-3xl" />
      </div>
    );
  }

  const titleOf = (id: string) => skillsById[id]?.title ?? id;
  const done = snap.path.filter((s) => s.status === "done").length;
  const current = snap.path.find((s) => s.status === "current");
  const finished = !current;

  function open(step: PathStep) {
    if (step.status === "locked") {
      toast("Avval pastdagi qadamni tugat", { description: "Yoʻl ildizdan yuqoriga qarab ochiladi." });
      return;
    }
    router.push(`/learn/${step.skillId}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <header className="flex items-center gap-3 pt-1">
        <LogoMark size={30} />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl leading-tight font-bold">Shaxsiy yoʻling</h1>
          <p className="text-muted-foreground truncate text-sm">
            {student.name}, {done} / {snap.path.length} qadam bajarildi
          </p>
        </div>
        <MasteryRing p={progress} size={52} showValue />
      </header>

      <FadeIn className="flex gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-10 rounded-xl">
              <MapIcon /> Xaritam
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Bilim xaritang</SheetTitle>
            </SheetHeader>
            <div className="px-3 pb-6">
              <KnowledgeMap graph={graph} snapshot={snap} mode="static" />
            </div>
          </SheetContent>
        </Sheet>
        {finished && (
          <Button asChild variant="secondary" className="h-10 rounded-xl">
            <Link href="/start">
              <RotateCcw /> Qayta tekshirish
            </Link>
          </Button>
        )}
      </FadeIn>

      {finished && (
        <FadeIn className="sheet space-y-1 p-4">
          <p className="font-display text-lg font-bold">Yoʻl tugadi!</p>
          <p className="text-muted-foreground">Barcha qadamlar oʻzlashtirildi. Xohlagan qadamni qayta mashq qilishing mumkin.</p>
        </FadeIn>
      )}

      <div className="pt-2 pb-8">
        <PathStem path={[...snap.path]} skills={snap.skills} titleOf={titleOf} onOpen={open} />
      </div>

      {current && (
        <div className="sticky bottom-4 z-10">
          <Button asChild className="h-14 w-full rounded-2xl text-lg font-semibold shadow-[var(--shadow-lift)]">
            <Link href={`/learn/${current.skillId}`}>Davom etish: {normalizeUz(skillsById[current.skillId]?.short ?? "")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
