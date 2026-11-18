import type { Metadata } from "next";
import { headers } from "next/headers";
import { Backdrop } from "@/components/brand/backdrop";
import { Hero } from "@/components/pitch/hero";
import { HowItWorks } from "@/components/pitch/how-it-works";
import { Pricing, Problem, Roles, Subjects, TeacherBand, TeamStrip } from "@/components/pitch/sections";
import { subjects } from "@/content/subjects";

export const metadata: Metadata = {
  title: "Nihol — öqituvçi, öquvçi va ota‑ona uçun eng yaxşi SI‑vosita",
  description:
    "Öqituvçi, öquvçi va ota‑ona uçun eng yaxşi SI asosidagi taʼlim vositasi: dars materialidan bir zumda test tuzadi, har bir xatoning ildizini topadi va bilimni niholdek östiradi.",
};

/** Public origin for QR codes: NEXT_PUBLIC_APP_URL, else the request's own host. */
async function appOrigin(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  if (env && !env.includes("localhost")) return env.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (/(^|\.)localhost(:|$)/.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function Home() {
  const origin = await appOrigin();
  const classId = process.env.DEMO_CLASS_ID || "6a";
  return (
    <main className="theme-doska flex flex-col overflow-x-clip">
      <Backdrop variant="doska" formulas={false} />
      <Hero studentUrl={`${origin}/start?class=${classId}`} />
      <Subjects subjects={subjects.map((s) => s.meta)} />
      <HowItWorks />
      <Roles />
      <Problem />
      <TeacherBand teacherUrl={`${origin}/teacher`} />
      <Pricing />
      <TeamStrip />
    </main>
  );
}
