import { GraduationCap, Heart, LayoutDashboard, School } from "lucide-react";
import Link from "next/link";
import { SubjectIcon } from "@/components/brand/subject-icon";
import { Button } from "@/components/ui/button";
import type { SubjectMeta } from "@/lib/types";
import { QrCard } from "./qr-card";

/** Facts used on stage. Every number has a source (docs/pitch/research.md). */
const FACTS = [
  {
    value: "421",
    text: "ball — TIMSS 2023 da 8-sinf öquvçilarimizning matematika natijasi (xalqaro şkala markazi 500). Yuqori darajaga bironta öquvçi çiqmagan.",
    source: { label: "gazeta.uz, TIMSS 2023", href: "https://gazeta.uz/en/2024/12/06/timss-2023" },
  },
  {
    value: "60%+",
    text: "15 yoşli öquvçilar PISA 2022 da minimal 2-darajaga yetmagan.",
    source: { label: "gazeta.uz, PISA 2022", href: "https://gazeta.uz/en/2024/12/06/timss-2023" },
  },
  {
    value: "6,87 mln",
    text: "öquvçi va 245 ming sinf. Sinfda örtaça 25 öquvçi bor, öqituvçi esa xatoni köradi, uning sababini emas.",
    source: {
      label: "Statistika qömitasi, 2025/26",
      href: "https://www.uzdaily.uz/en/number-of-schools-in-uzbekistan-rises-to-11118-students-to-687-million/",
    },
  },
] as const;

export function Subjects({ subjects }: { subjects: SubjectMeta[] }) {
  return (
    <section aria-labelledby="subjects-title" className="mx-auto w-full max-w-[1500px] px-5 pt-4 pb-6 sm:px-8 lg:px-12">
      <h2 id="subjects-title" className="text-[2rem] leading-tight font-bold sm:text-[2.6rem]">
        Tayyor 4 ta fan, har birida 7 ta dars
      </h2>
      <p className="text-ink-soft mt-3 max-w-[40rem] text-[1.1rem] leading-relaxed">
        Hamma narsa birinçi kundan tayyor: darslar, savollar va sinf natijalari. Öqituvçi öz fani va darsini qöşa oladi.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {subjects.map((s) => (
          <li key={s.id} className="sheet relative flex items-center gap-4 overflow-hidden p-5">
            <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: s.color }} aria-hidden />
            <SubjectIcon icon={s.icon} color={s.color} size={52} />
            <div className="min-w-0">
              <p className="font-display truncate text-lg font-bold">{s.name}</p>
              <p className="text-ink-soft text-sm">7 dars · 35 savol</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const ROLES = [
  {
    icon: School,
    title: "Öqituvçi",
    text: "Material yuklaydi, testni tahrirlaydi va yuboradi. Sinf xaritasini fanlar böyiça jonli köradi.",
  },
  {
    icon: GraduationCap,
    title: "Öquvçi",
    text: "Testni telefonda yeçadi, öz bilim xaritasini köradi. Matematikada SI‑tyutor xatoning ildizini tuşuntiradi.",
  },
  {
    icon: Heart,
    title: "Ota‑ona",
    text: "Bolasining har bir fan böyiça xaritasi va vaqt ötişi bilan ösişini köradi.",
  },
] as const;

export function Roles() {
  return (
    <section aria-labelledby="roles-title" className="mx-auto w-full max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12">
      <h2 id="roles-title" className="text-[2rem] leading-tight font-bold sm:text-[2.6rem]">
        Üç rol, bitta xarita
      </h2>
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {ROLES.map((r) => (
          <li key={r.title} className="sheet flex flex-col gap-3 p-6">
            <span className="bg-ink-wash text-ink grid size-12 place-items-center rounded-2xl">
              <r.icon className="size-6" aria-hidden />
            </span>
            <h3 className="font-display text-[1.35rem] font-bold">{r.title}</h3>
            <p className="text-ink-soft text-[1.02rem] leading-relaxed">{r.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Problem() {
  return (
    <section aria-labelledby="problem-title" className="border-border border-y bg-white/75">
      <div className="mx-auto grid w-full max-w-[1500px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-12">
        <div>
          <h2 id="problem-title" className="text-[2rem] leading-tight font-bold sm:text-[2.6rem]">
            Xato köpinça ikki poğona pastda boşlanadi
          </h2>
          <p className="text-ink-soft mt-4 max-w-[34rem] text-[1.1rem] leading-relaxed">
            Öquvçi kasrlarni qöşişda adaşadi, lekin sabab EKUKni topa olmasliqda. Öqituvçi daftarda belgini köradi,
            ildizni emas. Nihol aynan şu yaşirin sababni körsatadi.
          </p>
        </div>
        <ul className="flex flex-col">
          {FACTS.map((f) => (
            <li
              key={f.value}
              className="border-border grid grid-cols-1 items-baseline gap-x-6 gap-y-2 border-t py-5 first:border-t-0 first:pt-0 sm:grid-cols-[12rem_1fr]"
            >
              <span className="font-display tabular text-[2.2rem] leading-none font-bold sm:text-[2.6rem]">{f.value}</span>
              <span>
                <span className="text-[1.05rem] leading-relaxed">{f.text}</span>
                <a
                  href={f.source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-soft mt-1 block text-sm underline decoration-1"
                >
                  Manba: {f.source.label}
                </a>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Deterministic mini heatmap for the teacher band (illustration, not data).
const ROWS = [
  "mmmmgmmsgggg",
  "mmmmgmmmggsg",
  "mmmmsmmmgggs",
  "mmgggggsgggg",
  "mmsggggggsgg",
  "mmmmmmmmmmgg",
  "mmmmmmmmmmmm",
];
const ROOT_COL = [4, 4, 4, 2, 2, 10, -1];
const FILL: Record<string, string> = { m: "var(--mastered)", s: "var(--shaky)", g: "var(--gap)" };

export function TeacherBand({ teacherUrl }: { teacherUrl: string }) {
  return (
    <section aria-labelledby="teacher-title" className="mx-auto w-full max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div>
          <h2 id="teacher-title" className="text-[2rem] leading-tight font-bold sm:text-[2.6rem]">
            Öqituvçi butun sinfni bir qarashda köradi
          </h2>
          <p className="text-ink-soft mt-4 max-w-[34rem] text-[1.1rem] leading-relaxed">
            Fanlar böyiça sinf xaritasi jonli yangilanadi: kim qaysi darsda qolib ketganini va har bir test qançalik
            bajarilganini körasiz. Matematikada «Ildiz tahlili» xatoning asl sababini körsatadi va bir xil ildizli
            öquvçilarni guruhlaydi.
          </p>
          <Button asChild className="mt-7 h-12 rounded-[14px] px-5 text-base font-semibold">
            <Link href="/login">
              <LayoutDashboard aria-hidden />
              Sinf panelini oçiş
            </Link>
          </Button>
        </div>
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-end">
          <div className="sheet w-full flex-1 p-5" aria-hidden>
            <p className="font-hand text-red-pen mb-2 text-[1.4rem] leading-none font-bold">ildiz: EKUK · 3 öquvçi</p>
            <div className="flex flex-col gap-[5px]">
              {ROWS.map((r, i) => (
                <div key={i} className="flex gap-[5px]">
                  <span className="bg-ink-wash mr-2 hidden h-[22px] w-16 rounded-[5px] sm:block" />
                  {[...r].map((c, j) => (
                    <span key={j} className="relative h-[22px] flex-1 rounded-[5px]" style={{ background: FILL[c] }}>
                      {ROOT_COL[i] === j && (
                        <span className="outline-red-pen absolute -inset-[3px] -rotate-6 rounded-[7px] outline-2" />
                      )}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <QrCard
            url={teacherUrl}
            title="Öqituvçi paneli"
            caption="Proyektorda yoki noutbukda oçing"
            size={132}
            className="hidden w-[200px] shrink-0 lg:flex"
          />
        </div>
      </div>
    </section>
  );
}

/** TODO(C): fill in names from the team chat; until then only roles are shown. */
const TEAM: Array<{ name: string; role: string }> = [
  { name: "", role: "Platforma, rollar, öquvçi va ota‑ona sahifalari" },
  { name: "", role: "Kontent: 4 fan, savollar, yangi alifbo" },
  { name: "", role: "Deploy, demo maʼlumotlar, öqituvçi paneli, pitch" },
];

export function TeamStrip() {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-8 px-5 py-12 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12">
        <div>
          <h2 className="text-[1.3rem] font-bold">Jamoa</h2>
          <ul className="mt-4 flex flex-wrap gap-x-10 gap-y-4">
            {TEAM.map((m) => (
              <li key={m.role} className="flex flex-col">
                {m.name ? (
                  <>
                    <span className="font-semibold">{m.name}</span>
                    <span className="text-ink-soft text-sm">{m.role}</span>
                  </>
                ) : (
                  <span className="font-semibold">{m.role}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-ink-soft text-sm lg:text-right">
          Umummilliy AI Xakaton 2026 · Taʼlim yönalişi, 3-muammo
          <br />
          Toşkent, 17–19-noyabr
        </p>
      </div>
    </footer>
  );
}
