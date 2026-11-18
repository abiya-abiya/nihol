import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { MasteryRing } from "@/components/brand/mastery-ring";
import { FadeIn, Stagger, StaggerItem } from "@/components/brand/motion";
import { SubjectIcon } from "@/components/brand/subject-icon";
import { NewSubjectDialog } from "@/components/lesson/new-subject-dialog";
import { subjectMastery } from "@/components/lesson/snapshot";
import { TeacherShell } from "@/components/lesson/teacher-shell";
import { requireRole } from "@/lib/auth";
import { getUsers, listAssignments, listProgress, listSubjects } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function TeacherSubjects() {
  const s = await requireRole("teacher");
  const classId = s.classId ?? "6a";
  const [subjects, users, assignments] = await Promise.all([listSubjects(), getUsers(), listAssignments({ classId })]);
  const ids = users.filter((u) => u.role === "student" && u.classId === classId).map((u) => u.id);
  const { progress } = await listProgress(ids);

  return (
    <TeacherShell name={s.name}>
      <div className="space-y-6 pt-2">
        <FadeIn className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Fanlar</h1>
            <p className="text-muted-foreground">Darslar, materiallar va testlar. Fanni oçib dars qöşing yoki material yuklang.</p>
          </div>
          <NewSubjectDialog />
        </FadeIn>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
          {subjects.map((sub) => {
            const ps = progress.filter((p) => p.subjectId === sub.meta.id);
            const avg = ps.length ? ps.reduce((a, p) => a + subjectMastery(sub, p), 0) / ids.length : 0;
            const tests = assignments.filter((a) => a.subjectId === sub.meta.id).length;
            return (
              <StaggerItem key={sub.meta.id}>
                <Link
                  href={`/teacher/subjects/${sub.meta.id}`}
                  className="sheet group relative flex h-full flex-col gap-4 overflow-hidden p-5 transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
                >
                  <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: sub.meta.color }} />
                  <div className="flex items-start gap-3">
                    <SubjectIcon icon={sub.meta.icon} color={sub.meta.color} size={48} />
                    <div className="min-w-0 flex-1">
                      <p className="font-display truncate text-lg font-bold">{sub.meta.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {sub.graph.skills.length} dars · {tests} test
                      </p>
                    </div>
                    <MasteryRing p={avg} size={48} showValue={false} />
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-sm">{sub.meta.description || "Darslarni qöşiş uçun oçing."}</p>
                  <span className="text-ink mt-auto flex items-center gap-1 text-sm font-semibold">
                    Fanni oçiş <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </TeacherShell>
  );
}
