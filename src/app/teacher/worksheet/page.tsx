import { WorksheetView } from "@/components/teacher/worksheet-sheet";
import { skillsById } from "@/lib/content";
import { DEMO_CLASS_ID, ensureDemoClass, getRepo } from "@/lib/db";
import type { WorksheetRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v.join(",") : (v ?? ""))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export default async function WorksheetPage({ searchParams }: PageProps<"/teacher/worksheet">) {
  const sp = await searchParams;
  const classId = typeof sp.class === "string" && sp.class ? sp.class : DEMO_CLASS_ID;
  const skillIds = list(sp.skills).filter((id) => skillsById[id]);
  const group = typeof sp.group === "string" ? sp.group : skillIds[0];
  if (group && skillsById[group] && !skillIds.includes(group)) skillIds.unshift(group);
  if (!skillIds.length) skillIds.push("lcm", "frac-common-denom");

  await ensureDemoClass();
  const repo = getRepo();
  const [classRoom, students] = await Promise.all([repo.getClass(classId), repo.listClassStudents(classId)]);
  const groupSize = students.filter((s) => s.snapshot?.rootGaps.includes(skillIds[0])).length || null;

  const request: WorksheetRequest = {
    classId,
    skillIds: skillIds.slice(0, 3),
    misconceptionIds: list(sp.mis),
    count: 8,
  };
  return <WorksheetView request={request} className={classRoom?.name ?? classId} groupSize={groupSize} />;
}
