import { AccountsManager } from "@/components/lesson/accounts-manager";
import { TeacherShell } from "@/components/lesson/teacher-shell";
import { requireRole } from "@/lib/auth";
import { getUsers } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function TeacherAccounts() {
  const s = await requireRole("teacher");
  const classId = s.classId ?? "6a";
  const users = (await getUsers()).filter((u) => u.classId === classId && u.role !== "teacher");
  return (
    <TeacherShell name={s.name}>
      <AccountsManager initial={users} />
    </TeacherShell>
  );
}
