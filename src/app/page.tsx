import type { Metadata } from "next";
import { headers } from "next/headers";
import { Hero } from "@/components/pitch/hero";
import { HowItWorks } from "@/components/pitch/how-it-works";
import { Problem, Roles, Subjects, TeacherBand, TeamStrip } from "@/components/pitch/sections";
import { subjects } from "@/content/subjects";

export const metadata: Metadata = {
  title: "Ildiz — öqituvçi uçun tayyor SI‑vosita",
  description:
    "Dars materialidan test, sinf xaritasi fanlar böyiça, ota‑onaga bolasining ösişi. Matematikada SI xatoning ildizini topadi.",
};

/** Public origin for QR codes: NEXT_PUBLIC_APP_URL, else the request's own host. */
async function appOrigin(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  if (env && !env.includes("localhost")) return env.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function Home() {
  const origin = await appOrigin();
  const classId = process.env.DEMO_CLASS_ID || "6a";
  return (
    <main className="flex flex-col">
      <Hero studentUrl={`${origin}/start?class=${classId}`} />
      <Subjects subjects={subjects.map((s) => s.meta)} />
      <HowItWorks />
      <Roles />
      <Problem />
      <TeacherBand teacherUrl={`${origin}/teacher`} />
      <TeamStrip />
    </main>
  );
}
