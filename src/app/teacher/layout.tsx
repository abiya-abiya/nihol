import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Öqituvçi paneli — Ildiz",
  description: "Sinfning bilim xaritasi, fanlar, testlar va öquvçilar natijalari.",
};

export default function TeacherLayout({ children }: LayoutProps<"/teacher">) {
  return <main className="flex min-h-full flex-1 flex-col">{children}</main>;
}
