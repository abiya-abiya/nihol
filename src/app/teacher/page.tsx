import { ClassOverview, type OverviewAssignment } from "@/components/teacher/class-overview";
import { TeacherDashboard } from "@/components/teacher/dashboard";
import { TeacherShell } from "@/components/lesson/teacher-shell";
import { requireRole } from "@/lib/auth";
import { DEMO_CLASS_ID, ensureDemoClass, getRepo } from "@/lib/db";
import { getClassGroup, getUsers, listAssignments, listProgress, listSubjects, listSubmissions } from "@/lib/store";
import { buildClassReport } from "@/lib/teacher/report";

export const dynamic = "force-dynamic";

export default async function TeacherPage({ searchParams }: PageProps<"/teacher">) {
  const session = await requireRole("teacher");
  const sp = await searchParams;
  const classId = session.classId ?? DEMO_CLASS_ID;

  // Matematika root-cause view (the v1 class dashboard).
  if (sp.view === "ildiz") {
    await ensureDemoClass();
    const repo = getRepo();
    const report = await buildClassReport(repo, (await repo.getClass(classId)) ? classId : DEMO_CLASS_ID);
    return <TeacherDashboard initial={report} backHref="/teacher" />;
  }

  const [subjects, users, assignments, cls] = await Promise.all([
    listSubjects(),
    getUsers(),
    listAssignments({ classId }),
    getClassGroup(classId),
  ]);
  const students = users
    .filter((u) => u.role === "student" && u.classId === classId)
    .map((u) => ({ id: u.id, name: u.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "uz"));
  const ids = students.map((s) => s.id);
  const [{ progress }, submissions] = await Promise.all([listProgress(ids), listSubmissions({ studentIds: ids })]);

  const light: OverviewAssignment[] = assignments.map((a) => ({
    id: a.id,
    subjectId: a.subjectId,
    lessonId: a.lessonId,
    title: a.title,
    createdAt: a.createdAt,
    studentIds: a.studentIds,
  }));
  const subject = typeof sp.subject === "string" ? sp.subject : undefined;

  return (
    <TeacherShell name={session.name} wide>
      <ClassOverview
        key={classId}
        classId={classId}
        className={cls?.name ?? classId}
        subjects={subjects.map((s) => ({ meta: s.meta, graph: s.graph }))}
        students={students}
        initial={{ progress, submissions, assignments: light }}
        initialSubject={subject}
      />
    </TeacherShell>
  );
}
