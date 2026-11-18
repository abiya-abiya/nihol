import type { Metadata } from "next";
import { TeacherSurface } from "@/components/lesson/teacher-shell";

export const metadata: Metadata = {
  title: "Öqituvçi paneli — Ildiz",
  description: "Sinfning bilim xaritasi, fanlar, testlar va öquvçilar natijalari.",
};

export default function TeacherLayout({ children }: LayoutProps<"/teacher">) {
  return <TeacherSurface>{children}</TeacherSurface>;
}
