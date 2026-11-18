import { existsSync } from "node:fs";
import { join } from "node:path";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SubjectBackdrop } from "@/components/brand/subject-backdrop";
import { TeacherShell } from "@/components/lesson/teacher-shell";
import { UploadWizard } from "@/components/lesson/upload-wizard";
import { requireRole } from "@/lib/auth";
import { getClassGroup, getSubject } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LessonUpload({ params }: PageProps<"/teacher/lessons/[subjectId]/[lessonId]">) {
  const s = await requireRole("teacher");
  const { subjectId, lessonId } = await params;
  const subject = await getSubject(subjectId);
  const lesson = subject?.graph.skills.find((l) => l.id === lessonId);
  if (!subject || !lesson) notFound();
  const bank = subject.questions.filter((q) => q.skillId === lessonId);
  const material = subject.materials.find((m) => m.lessonId === lessonId);
  const cls = await getClassGroup(s.classId);
  const sampleUrl =
    material && existsSync(join(process.cwd(), "public", "demo-materials", material.fileName))
      ? `/demo-materials/${encodeURIComponent(material.fileName)}`
      : undefined;
  return (
    <TeacherShell name={s.name}>
      <SubjectBackdrop subjectId={subject.meta.id} color={subject.meta.color} tone="board" />
      <div className="space-y-4 pt-2">
        <Link href={`/teacher/subjects/${subjectId}`} className="text-muted-foreground hover:text-ink inline-flex items-center gap-1 text-sm">
          <ChevronLeft className="size-4" /> {subject.meta.name}
        </Link>
        <UploadWizard subject={subject.meta} lesson={lesson} bank={bank} material={material} classLabel={cls?.name} sampleUrl={sampleUrl} />
      </div>
    </TeacherShell>
  );
}
