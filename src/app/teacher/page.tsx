import { TeacherDashboard } from "@/components/teacher/dashboard";
import { DEMO_CLASS_ID, ensureDemoClass, getRepo } from "@/lib/db";
import { buildClassReport } from "@/lib/teacher/report";

export const dynamic = "force-dynamic";

export default async function TeacherPage({ searchParams }: PageProps<"/teacher">) {
  const { classId } = await searchParams;
  const id = typeof classId === "string" && classId ? classId : DEMO_CLASS_ID;
  await ensureDemoClass();
  const repo = getRepo();
  const report = await buildClassReport(repo, (await repo.getClass(id)) ? id : DEMO_CLASS_ID);
  return <TeacherDashboard initial={report} />;
}
