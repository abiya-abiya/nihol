import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MasteryRing } from "@/components/brand/mastery-ring";
import { FadeIn } from "@/components/brand/motion";
import { SubjectIcon } from "@/components/brand/subject-icon";
import { subjectMastery } from "@/components/lesson/snapshot";
import { SubjectMap } from "@/components/lesson/subject-map";
import { requireRole } from "@/lib/auth";
import { getSubject, listProgress } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function StudentSubject({ params }: PageProps<"/student/subject/[id]">) {
  const s = await requireRole("student");
  const subject = await getSubject((await params).id);
  if (!subject) notFound();
  const { progress } = await listProgress([s.id]);
  const prog = progress.find((p) => p.subjectId === subject.meta.id) ?? null;
  return (
    <div className="space-y-5 pt-2">
      <Link href="/student" className="text-muted-foreground hover:text-ink inline-flex items-center gap-1 text-sm">
        <ChevronLeft className="size-4" /> Boş sahifa
      </Link>
      <FadeIn className="flex items-center gap-4">
        <SubjectIcon icon={subject.meta.icon} color={subject.meta.color} size={56} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-bold">{subject.meta.name}</h1>
          <p className="text-muted-foreground text-sm">Bilim xaritang: pastda — asos, yuqorida — murakkab darslar</p>
        </div>
        <MasteryRing p={subjectMastery(subject, prog)} size={60} showValue />
      </FadeIn>
      <SubjectMap subject={subject} progress={prog} studentId={s.id} />
    </div>
  );
}
