# Ildiz — xatoning ildizini topadigan SI-tyutor

Umummilliy AI Xakaton 2026 (Toshkent, 17–19 noyabr), Ta'lim yo'nalishi, 3-muammo.
O'zbek tilida ishlaydi, 5–6-sinf "Kasrlar" mavzusida o'quvchining bilimidagi
bo'shliqni ildizigacha topadi, shaxsiy o'quv yo'lini tuzadi, o'qituvchiga sinfni
jonli ko'rsatadi.

## Jamoa va rollar

| Rol | Ulush | Kim | Nima qiladi |
|---|---|---|---|
| A | 60% | _ism_ | ilova, diagnostika dvigateli, AI tyutor, ma'lumotlar bazasi, dizayn tizimi |
| B | 20% | _ism_ | kontent: bilim grafi, savollar, xato turlari, generatorlar, matematik va til sifati |
| C | 20% | _ism_ | deploy, o'qituvchi paneli, landing sahifa, pitch va demo |

## Qanday boshlash (har bir a'zo)

1. GitHub taklifini qabul qiling, keyin:
   ```
   git clone https://github.com/abiya-abiya/si-tyutor.git
   cd si-tyutor
   npm install
   claude
   ```
2. Claude'ga yozing: **"Men B rolidaman, ishni boshla"** (o'z rolingizni yozing).
   Claude `CLAUDE.md` va `docs/plan/` ni o'qib, birinchi vazifadan ishni boshlaydi.
3. Kalitlar (`ANTHROPIC_API_KEY`, `DATABASE_URL`) jamoa chatida beriladi,
   `.env.local` fayliga yoziladi. Git'ga hech qachon qo'shilmaydi.

## Reja

- `docs/plan/00-overview.md` — umumiy spetsifikatsiya, arxitektura, kontraktlar, vaqt jadvali
- `docs/plan/A.md`, `B.md`, `C.md` — har bir rolning vazifalari
- `PRODUCT.md`, `DESIGN.md` — mahsulot va dizayn yo'nalishi
- `src/lib/types.ts` — hamma uchun umumiy kontraktlar
