import { FadeIn } from "@/components/brand/motion";
import { ParentDashboard } from "@/components/parent/parent-dashboard";
import { requireRole } from "@/lib/auth";
import { getClassGroup, getUser, listProgress, listSubjects, listSubmissions } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ParentHome() {
  const s = await requireRole("parent");
  const childId = s.childId ?? "";
  const [child, subjects, { progress, history }, submissions] = await Promise.all([
    getUser(childId),
    listSubjects(),
    listProgress([childId]),
    listSubmissions({ studentIds: [childId] }),
  ]);
  const first = child?.name.split(" ")[0] ?? "Farzandingiz";
  const cls = await getClassGroup(child?.classId);
  return (
    <div className="space-y-6 pt-2">
      <FadeIn className="space-y-1">
        <p className="font-hand text-red-pen text-2xl -rotate-1">assalomu alaykum!</p>
        <h1 className="text-[2rem] leading-tight font-bold">{first} qanday öqiyapti</h1>
        <p className="text-muted-foreground">
          {child?.name}
          {cls ? `, ${cls.name}` : ""}. Har bir fan — bilim xaritasi: yaşil — özlaştirilgan, sariq — mustahkamlaş kerak, qizil — böşliq.
        </p>
      </FadeIn>
      <ParentDashboard
        childId={childId}
        childName={first}
        subjects={subjects}
        progress={progress}
        history={history}
        submissions={submissions}
      />
    </div>
  );
}
