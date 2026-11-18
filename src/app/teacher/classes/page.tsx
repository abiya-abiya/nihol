import { ClassesManager } from "@/components/lesson/classes-manager";
import { TeacherShell } from "@/components/lesson/teacher-shell";
import { requireRole } from "@/lib/auth";
import { teacherOfClass } from "@/lib/auth-demo";
import { classStats, getUsers, listAssignments, listClasses, resolveClassId } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function TeacherClasses() {
  const s = await requireRole("teacher");
  const [classes, users, assignments, activeId] = await Promise.all([
    listClasses(),
    getUsers(),
    listAssignments({}),
    resolveClassId(s.classId),
  ]);
  const rows = classes.filter((c) => (teacherOfClass(c) ?? s.id) === s.id).map((c) => ({ ...c, ...classStats(c.id, users, assignments) }));
  return (
    <TeacherShell name={s.name}>
      <ClassesManager initial={rows} activeId={activeId} />
    </TeacherShell>
  );
}
