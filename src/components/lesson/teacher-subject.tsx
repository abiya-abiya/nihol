"use client";

import { FileUp, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { levelColor, levelLabel } from "@/components/brand/levels";
import { MasteryRing } from "@/components/brand/mastery-ring";
import { KnowledgeMap } from "@/components/student/knowledge-map";
import { Button } from "@/components/ui/button";
import { levelOf } from "@/engine/bkt";
import type { StudentSnapshot, SubjectContent } from "@/lib/types";
import { normalizeUz } from "@/lib/uz";

/** Teacher view of one subject: class-average lesson map, lesson list with upload, add lesson. */
export function TeacherSubject({
  subject,
  classSnap,
  testsByLesson,
}: {
  subject: SubjectContent;
  classSnap: StudentSnapshot;
  testsByLesson: Record<string, number>;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function addLesson() {
    setBusy(true);
    const res = await fetch(`/api/subjects/${subject.meta.id}/lessons`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const body = await res.json();
    setBusy(false);
    if (!res.ok) return toast.error(body.error ?? "Dars qöşilmadi");
    toast.success("Dars qöşildi", { description: "Endi unga material yuklang." });
    setTitle("");
    router.push(`/teacher/lessons/${subject.meta.id}/${body.lesson.id}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
      <div className="space-y-3">
        <div className="sheet px-1 pt-2 pb-1">
          {subject.graph.skills.length ? (
            <KnowledgeMap
              graph={subject.graph}
              snapshot={classSnap}
              mode="reveal"
              highlightTrace={false}
              className="lg:mx-auto lg:h-[min(62dvh,620px)] lg:w-auto lg:max-w-full"
            />
          ) : (
            <p className="text-muted-foreground p-10 text-center">Hali dars yöq. Öngdan birinçi darsni qöşing.</p>
          )}
        </div>
        <p className="text-muted-foreground px-1 text-sm">Xarita ranglari — sinfning örtaça özlaştiriş darajasi.</p>
      </div>

      <div className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim().length >= 2) void addLesson();
          }}
          className="sheet flex gap-2 p-3"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Yangi dars nomi"
            className="border-input focus-visible:border-ink h-11 min-w-0 flex-1 rounded-xl border-2 bg-card px-3 outline-none"
          />
          <Button type="submit" disabled={busy || title.trim().length < 2} className="h-11 rounded-xl">
            <Plus className="size-4" /> Dars
          </Button>
        </form>
        <ol className="grid gap-2">
          {subject.graph.skills.map((l, i) => {
            const st = classSnap.skills[l.id];
            const level = levelOf(st);
            return (
              <li key={l.id} className="sheet flex items-center gap-3 p-3">
                <span className="font-display text-ink-soft w-6 text-center text-sm font-bold">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{normalizeUz(l.title)}</span>
                  <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <span className="size-2 rounded-full" style={{ background: levelColor(level) }} />
                    {levelLabel(level)} · {testsByLesson[l.id] ?? 0} test
                  </span>
                </span>
                <MasteryRing p={st?.p ?? 0} size={32} level={level} />
                <Button asChild size="sm" variant="outline" className="h-9 rounded-xl">
                  <Link href={`/teacher/lessons/${subject.meta.id}/${l.id}`}>
                    <FileUp className="size-4" /> Material
                  </Link>
                </Button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
