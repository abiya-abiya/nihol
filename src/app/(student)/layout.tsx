import type { ReactNode } from "react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pt-4 pb-10 sm:px-6">{children}</div>;
}
