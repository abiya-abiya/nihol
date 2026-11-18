import { AccountsManager } from "@/components/lesson/accounts-manager";
import { TeacherShell } from "@/components/lesson/teacher-shell";
import { requireRole } from "@/lib/auth";
import { getClassGroup, getUsers } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function TeacherAccounts() {
  const s = await requireRole("teacher");
  const classId = s.classId ?? "6a";
  const [all, cls] = await Promise.all([getUsers(), getClassGroup(classId)]);
  const users = all.filter((u) => u.classId === classId && u.role !== "teacher");
  return (
    <TeacherShell name={s.name}>
      <AccountsManager key={classId} initial={users} classLabel={cls?.name ?? classId} />
    </TeacherShell>
  );
}
