import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oʻqituvchi paneli — Ildiz",
  description: "Sinfning bilim xaritasi, ildiz muammolari va mashq varaqalari.",
};

export default function TeacherLayout({ children }: LayoutProps<"/teacher">) {
  return <main className="flex min-h-full flex-1 flex-col">{children}</main>;
}
