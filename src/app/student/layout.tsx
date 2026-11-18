import type { ReactNode } from "react";
import { Backdrop } from "@/components/brand/backdrop";
import { UserBar } from "@/components/brand/user-bar";
import { requireRole } from "@/lib/auth";
import { getClassGroup } from "@/lib/store";

export default async function StudentArea({ children }: { children: ReactNode }) {
  const s = await requireRole("student");
  const cls = await getClassGroup(s.classId);
  return (
    <div className="flex flex-1 flex-col">
      <Backdrop variant="bolak" />
      <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-1 flex-col overflow-x-clip px-4 pb-12 sm:px-6">
        <UserBar name={s.name} role={cls ? `Öquvçi · ${cls.name}` : "Öquvçi"} home="/student" />
        {children}
      </div>
    </div>
  );
}
