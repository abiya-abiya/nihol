import { notFound } from "next/navigation";
import { StudentDetail } from "@/components/teacher/student-detail";
import { ensureDemoClass, getRepo } from "@/lib/db";
import { studentMasteryAvg } from "@/lib/teacher/report";

export const dynamic = "force-dynamic";

export default async function TeacherStudentPage({ params }: PageProps<"/teacher/student/[id]">) {
  const { id } = await params;
  await ensureDemoClass();
  const repo = getRepo();
  const record = await repo.getStudent(id);
  if (!record) notFound();
  const [classRoom, attempts] = await Promise.all([
    repo.getClass(record.student.classId),
    repo.listAttempts({ studentId: id, limit: 8 }),
  ]);
  return (
    <StudentDetail
      record={record}
      className={classRoom?.name ?? record.student.classId}
      attempts={attempts}
      masteryAvg={studentMasteryAvg(record.snapshot)}
      now={new Date().toISOString()}
    />
  );
}
