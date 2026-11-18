import { GraduationCap, School, Users } from "lucide-react";
import { MasteryRing } from "@/components/brand/mastery-ring";
import { FadeIn, Stagger, StaggerItem } from "@/components/brand/motion";
import { subjectMastery } from "@/components/lesson/snapshot";
import { NewTeacher } from "@/components/org/new-teacher";
import { PeriodStats } from "@/components/teacher/period-stats";
import { DEMO_ORG } from "@/lib/auth-demo";
import { requireRole } from "@/lib/auth";
import { listAssignments, listProgress, listSubjects, listSubmissions } from "@/lib/store";
import { orgTeachers } from "@/lib/teachers";
import type { ProgressPoint, Submission } from "@/lib/types";

export const dynamic = "force-dynamic";

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const pct = (x: number | null) => (x === null ? "—" : `${Math.round(x * 100)}%`);

export default async function OrgHome() {
  const s = await requireRole("org");
  const orgId = s.orgId ?? DEMO_ORG.id;
  const teachers = await orgTeachers(orgId);
  const allIds = teachers.flatMap((t) => t.studentIds);
  const [subjects, { progress, history }, submissions, assignments] = await Promise.all([
    listSubjects(),
    listProgress(allIds),
    listSubmissions({ studentIds: allIds }),
    listAssignments({}),
  ]);

  // Effectiveness of a teacher = how their students are doing.
  const studentMastery = (id: string) =>
    mean(
      progress
        .filter((p) => p.studentId === id)
        .flatMap((p) => {
          const sub = subjects.find((x) => x.meta.id === p.subjectId);
          return sub ? [subjectMastery(sub, p)] : [];
        }),
    );
  const cards = teachers
    .map((t) => {
      const ids = new Set(t.studentIds);
      const classIds = new Set(t.classes.map((c) => c.id));
      return {
        t,
        mastery: mean(t.studentIds.flatMap((id) => (studentMastery(id) === null ? [] : [studentMastery(id)!]))),
        score: mean(submissions.filter((x) => ids.has(x.studentId)).map((x) => x.score)),
        tests: assignments.filter((a) => classIds.has(a.classId)).length,
      };
    })
    .sort((a, b) => (b.mastery ?? -1) - (a.mastery ?? -1));

  // Reuse the class statistics block with teachers as rows: map every student event to their teacher.
  const teacherOf = new Map(teachers.flatMap((t) => t.studentIds.map((id) => [id, t.user.id] as const)));
  const asTeacher: Submission[] = submissions.flatMap((x) =>
    teacherOf.has(x.studentId) ? [{ ...x, studentId: teacherOf.get(x.studentId)!, subjectId: "all" }] : [],
  );
  const byKey = new Map<string, number[]>();
  for (const h of history) {
    const tid = teacherOf.get(h.studentId);
    if (!tid) continue;
    const k = `${tid}|${h.date}`;
    byKey.set(k, [...(byKey.get(k) ?? []), h.avg]);
  }
  const teacherHistory: ProgressPoint[] = [...byKey.entries()].map(([k, v]) => {
    const [studentId, date] = k.split("|");
    return { studentId, subjectId: "all", date, avg: mean(v) ?? 0 };
  });

  const orgMastery = mean(cards.flatMap((c) => (c.mastery === null ? [] : [c.mastery])));

  return (
    <div className="space-y-6 pt-2">
      <FadeIn className="space-y-1">
        <p className="font-hand text-red-pen text-2xl -rotate-1">{DEMO_ORG.id === orgId ? DEMO_ORG.name : "Taşkilot"}</p>
        <h1 className="text-[2rem] leading-tight font-bold">Öqituvçilar samaradorligi</h1>
        <p className="text-muted-foreground">Har bir öqituvçining natijasi — uning öquvçilari qanday özlaştirayotgani böyiça.</p>
      </FadeIn>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: School, label: "Öqituvçilar", value: String(teachers.length) },
          { icon: GraduationCap, label: "Öquvçilar", value: String(allIds.length) },
          { icon: Users, label: "Sinflar", value: String(teachers.reduce((a, t) => a + t.classes.length, 0)) },
          { icon: GraduationCap, label: "Örtaça özlaştiriş", value: pct(orgMastery) },
        ].map((k) => (
          <div key={k.label} className="sheet space-y-1 p-4">
            <k.icon className="text-ink-soft size-5" />
            <p className="text-muted-foreground text-sm">{k.label}</p>
            <p className="font-display text-2xl font-bold">{k.value}</p>
          </div>
        ))}
      </div>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
        {cards.map((c, i) => (
          <StaggerItem key={c.t.user.id}>
            <div className="sheet relative flex h-full flex-col gap-3 p-5">
              {i === 0 && c.mastery !== null && (
                <span className="bg-highlight text-ink absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-xs font-bold">Eng yaxşi natija</span>
              )}
              <div className="flex items-center gap-3">
                <MasteryRing p={c.mastery ?? 0} size={64} showValue />
                <div className="min-w-0">
                  <p className="font-display truncate text-lg font-bold">{c.t.user.name}</p>
                  <p className="text-muted-foreground truncate text-sm">{c.t.classes.map((x) => x.name).join(", ") || "Sinf yöq"}</p>
                </div>
              </div>
              <dl className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-ink-wash rounded-xl p-2">
                  <dt className="text-muted-foreground text-xs">Öquvçi</dt>
                  <dd className="font-display font-bold">{c.t.studentIds.length}</dd>
                </div>
                <div className="bg-ink-wash rounded-xl p-2">
                  <dt className="text-muted-foreground text-xs">Test</dt>
                  <dd className="font-display font-bold">{c.tests}</dd>
                </div>
                <div className="bg-ink-wash rounded-xl p-2">
                  <dt className="text-muted-foreground text-xs">Örtaça ball</dt>
                  <dd className="font-display font-bold">{pct(c.score)}</dd>
                </div>
              </dl>
              <p className="text-muted-foreground text-xs">
                Login: <span className="font-mono">{c.t.user.login}</span>
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        <PeriodStats
          subject={{ id: "all", name: "barça fanlar", short: "Barça", color: "#1d2b64", icon: "book", order: 0, description: "" }}
          students={teachers.map((t) => ({ id: t.user.id, name: t.user.name }))}
          submissions={asTeacher}
          history={teacherHistory}
          labels={{ entity: "Öqituvçi", active: "Faol öqituvçilar", table: "Öqituvçilar statistikasi" }}
        />
        <NewTeacher />
      </div>
    </div>
  );
}
