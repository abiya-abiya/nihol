# Nihol — istalgan fan uçun bitta platforma

Maktab, öqituvçi, öquvçi va ota‑ona uçun sunʼiy intellekt asosidagi taʼlim vositasi:
dars materialidan test tayyorlaydi, har bir xatoning ildizini topadi va bilimni niholdek östiradi.

- Sayt: https://niholsi.netlify.app
- Lokal: http://localhost:3000 (`npm run dev` yoki `npx next build && npx next start`)

Umummilliy AI Xakaton 2026 (Toşkent, 17–19 noyabr), Taʼlim yönalişi, 3‑muammo.

## Nima qiladi

| Rol | Imkoniyatlar |
|---|---|
| Maktab | Öqituvçilarga login va parol beradi; har bir öqituvçining samaradorligini öquvçilari natijasi orqali köradi (özlaştiriş, test bali, hafta / oy / çorak). |
| Öqituvçi | Sinflar va hisoblar yaratadi, fan va dars qöşadi, material yuklaydi va test yuboradi, sinf xaritasi va statistikasini köradi. Maktabsiz ham röyxatdan ötadi. |
| Öquvçi | Testni telefonda yeçadi, öz bilim xaritasini köradi; matematikada SI‑tyutor xatoning ildizini tuşuntiradi. |
| Ota‑ona | Bolasining har bir fan böyiça xaritasi, ösiş grafigi va oxirgi natijalari. |

Tayyor fanlar: Matematika (5–6‑sinf «Kasrlar», 17 könikma), Ona tili, Ingliz tili,
Biologiya, Kimyo (har birida 7 dars). Interfeys yangi özbek alifbosida (Ö Ğ Ş Ç, tutuq ʼ).

## Demo hisoblar

`maktab / maktab123` · `ustoz / ustoz123` · `nodira / nodira123` · `bobur / bobur123` ·
`jasur / jasur123` · `ona / ona123`

## Jamoa va rollar

| Rol | Kim | Nima qildi |
|---|---|---|
| A | _ism_ | platforma, rollar, maktab paneli, öquvçi / ota‑ona / öqituvçi sahifalari, SI‑tyutor |
| B | _ism_ | kontent: 5 fan, bilim grafi, savollar, yangi alifbo, statistika |
| C | _ism_ | deploy, demo maʼlumotlar, öqituvçi paneli, landing, pitch |

## Qanday boşlaş

```
git clone https://github.com/abiya-abiya/si-tyutor.git
cd si-tyutor
npm install
# .env.local (gitga qöşilmaydi): GEMINI_API_KEYS=..., AUTH_SECRET=..., ixtiyoriy DATABASE_URL=...
npm run dev
npm run check   # typecheck + kontent + testlar
```

## Hujjatlar

- `docs/plan/HANDOFF.md` — hozirgi holat va oçiq işlar
- `docs/plan/00-overview.md`, `A.md`, `B.md`, `C.md` — reja va rollar
- `docs/pitch/` — demo ssenariysi, slaydlar rejasi, hakamlar savollari, havolalar, tadqiqot
- `PRODUCT.md`, `DESIGN.md` — mahsulot va dizayn yönalişi
- `src/lib/types.ts` — umumiy kontraktlar
