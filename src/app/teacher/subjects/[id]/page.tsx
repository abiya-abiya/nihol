import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FadeIn } from "@/components/brand/motion";
import { SubjectIcon } from "@/components/brand/subject-icon";
import { TeacherShell } from "@/components/lesson/teacher-shell";
import { TeacherSubject } from "@/components/lesson/teacher-subject";
import { requireRole } from "@/lib/auth";
import { getSubject, getUsers, listAssignments, listProgress } from "@/lib/store";
import type { SkillState, StudentSnapshot } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TeacherSubjectPage({ params }: PageProps<"/teacher/subjects/[id]">) {
  const s = await requireRole("teacher");
  const subject = await getSubject((await params).id);
  if (!subject) notFound();
  const classId = s.classId ?? "6a";
  const users = await getUsers();
  const ids = users.filter((u) => u.role === "student" && u.classId === classId).map((u) => u.id);
  const { progress } = await listProgress(ids);
  const assignments = await listAssignments({ classId });

  // class average per lesson, shaped like a student's skills so KnowledgeMap can colour it
  const skills: Record<string, SkillState> = {};
  for (const l of subject.graph.skills) {
    const states = progress.filter((p) => p.subjectId === subject.meta.id).map((p) => p.skills[l.id]).filter(Boolean);
    if (!states.length) continue;
    const p = states.reduce((a, x) => a + x.p, 0) / ids.length;
    skills[l.id] = { skillId: l.id, p, attempts: states.length, correct: 0, inferred: false, misconceptions: {} };
  }
  const classSnap: StudentSnapshot = {
    studentId: "class",
    skills,
    rootGaps: [],
    traces: [],
    path: [],
    diagnosticDone: true,
    updatedAt: new Date().toISOString(),
  };
  const testsByLesson: Record<string, number> = {};
  for (const a of assignments.filter((x) => x.subjectId === subject.meta.id)) testsByLesson[a.lessonId] = (testsByLesson[a.lessonId] ?? 0) + 1;

  return (
    <TeacherShell name={s.name} wide>
      <div className="space-y-5 pt-2">
        <Link href="/teacher/subjects" className="text-muted-foreground hover:text-ink inline-flex items-center gap-1 text-sm">
          <ChevronLeft className="size-4" /> Fanlar
        </Link>
        <FadeIn className="flex items-center gap-4">
          <SubjectIcon icon={subject.meta.icon} color={subject.meta.color} size={56} />
          <div>
            <h1 className="text-3xl leading-tight font-bold">{subject.meta.name}</h1>
            <p className="text-muted-foreground">{subject.graph.skills.length} dars · material yuklang — SI test tuzib beradi</p>
          </div>
        </FadeIn>
        <TeacherSubject subject={subject} classSnap={classSnap} testsByLesson={testsByLesson} />
      </div>
    </TeacherShell>
  );
}
