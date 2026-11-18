import { ArrowRight, CheckCircle2, ClipboardList } from "lucide-react";
import Link from "next/link";
import { MasteryRing } from "@/components/brand/mastery-ring";
import { FadeIn, Stagger, StaggerItem } from "@/components/brand/motion";
import { SubjectIcon } from "@/components/brand/subject-icon";
import { MathEntry } from "@/components/lesson/math-entry";
import { lessonsTouched, subjectMastery } from "@/components/lesson/snapshot";
import { requireRole } from "@/lib/auth";
import { listAssignments, listProgress, listSubjects, listSubmissions } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function StudentHome() {
  const s = await requireRole("student");
  const [subjects, assignments, submissions, { progress }] = await Promise.all([
    listSubjects(),
    listAssignments({ studentId: s.id }),
    listSubmissions({ studentIds: [s.id] }),
    listProgress([s.id]),
  ]);
  const done = new Set(submissions.map((x) => x.assignmentId));
  const fresh = assignments.filter((a) => !done.has(a.id));
  const subjectOf = (id: string) => subjects.find((x) => x.meta.id === id);
  const first = s.name.split(" ")[0];

  return (
    <div className="space-y-8 pt-2">
      <FadeIn className="space-y-1">
        <p className="font-hand text-red-pen text-2xl -rotate-1">salom, {first}!</p>
        <h1 className="text-[2rem] leading-tight font-bold">Bugun nimani örganamiz?</h1>
      </FadeIn>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-ink-soft size-5" />
          <h2 className="text-lg font-semibold">Yangi testlar</h2>
          {fresh.length > 0 && (
            <span className="bg-red-pen-strong rounded-full px-2 py-0.5 text-xs font-bold text-white">{fresh.length}</span>
          )}
        </div>
        {fresh.length === 0 ? (
          <div className="sheet text-muted-foreground flex items-center gap-3 p-4">
            <CheckCircle2 className="text-mastered size-5" /> Hamma testlar bajarilgan. Barakalla!
          </div>
        ) : (
          <Stagger className="grid gap-3 [&>*]:min-w-0">
            {fresh.map((a) => {
              const sub = subjectOf(a.subjectId);
              const lesson = sub?.graph.skills.find((l) => l.id === a.lessonId);
              return (
                <StaggerItem key={a.id}>
                  <Link
                    href={`/student/test/${a.id}`}
                    className="sheet group flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
                  >
                    {sub && <SubjectIcon icon={sub.meta.icon} color={sub.meta.color} />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{a.title}</p>
                      <p className="text-muted-foreground truncate text-sm">
                        {sub?.meta.name} — {lesson?.title ?? "dars"}, {a.questions.length} ta savol
                      </p>
                    </div>
                    <span className="bg-ink flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-white">
                      Boşlaş <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Fanlarim</h2>
        <Stagger className="grid gap-4 sm:grid-cols-2 [&>*]:min-w-0" delay={0.1}>
          {subjects.map((sub, i) => {
            const prog = progress.find((p) => p.subjectId === sub.meta.id);
            const m = subjectMastery(sub, prog);
            const isMath = sub.meta.id === "matematika";
            return (
              <StaggerItem key={sub.meta.id} className={isMath && i === 0 ? "sm:col-span-2" : undefined}>
                <div className="sheet relative flex h-full flex-col gap-4 overflow-hidden p-5">
                  <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: sub.meta.color }} />
                  <div className="flex items-start gap-3">
                    <SubjectIcon icon={sub.meta.icon} color={sub.meta.color} size={isMath ? 52 : 44} />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-bold">{sub.meta.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {lessonsTouched(sub, prog)} / {sub.graph.skills.length} dars boşlangan
                      </p>
                    </div>
                    <MasteryRing p={m} size={54} showValue />
                  </div>
                  {isMath && <p className="text-muted-foreground text-sm">{sub.meta.description}</p>}
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Link
                      href={`/student/subject/${sub.meta.id}`}
                      className="border-input hover:border-ink inline-flex h-10 items-center gap-1.5 rounded-xl border-2 bg-card px-3 text-sm font-semibold"
                    >
                      Bilim xaritasi <ArrowRight className="size-4" />
                    </Link>
                    {isMath && <MathEntry studentId={s.id} name={s.name} classId={s.classId ?? "6a"} />}
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>
    </div>
  );
}
