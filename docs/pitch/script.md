# Demo ssenariysi — 3 daqiqa

Kim nima qiladi: **Spiker** (gapiradi, slaydlarni almashtiradi), **Operator** (noutbukda
`/teacher` proyektorda), **Hakam** (oʻz telefonida). Zaxira: agar hakam
qatnashmasa, Operator ikkinchi telefonda «Jasur» boʻlib oʻtadi.

Tayyorgarlik (sahnaga chiqishdan 5 daqiqa oldin):
- `/teacher` → ⋯ → **Demo holatini tiklash** (24 namunaviy oʻquvchi, «Jasur» yoʻq).
- Proyektorda 1-oyna: landing `/` (QR koʻrinib turadi). 2-oyna: `/teacher`.
- Internet: telefon hotspoti yoqilgan. AI ishlamasa ham demo ishlaydi (tayyor matnlar).

| Vaqt | Ekranda | Spiker gapiradi | Kim bosadi |
|---|---|---|---|
| 0:00–0:20 | Slayd 1 → 2 (muammo) | «Bitta sinf, 25 oʻquvchi, bitta sur'at. TIMSS 2023 da 8-sinf oʻquvchilarimiz matematikadan 421 ball oldi, bironta oʻquvchi yuqori darajaga chiqmadi. Oʻqituvchi xatoni koʻradi — sababini emas.» | Spiker |
| 0:20–0:30 | Landing `/` | «Ildiz xatoning sababini topadi. Iltimos, QR kodni skanerlang.» | Hakam skanerlaydi |
| 0:30–1:35 | Hakam telefoni (agar ekran ulashilsa) / proyektorda `/teacher` | Hakam ismini yozadi va 8–10 savolga javob beradi. Spiker: «Har javob keyingi savolni tanlaydi: xato boʻlsa, bilim grafida bir pogʻona pastga tushamiz.» Natija ekrani: xarita chiziladi, qizil iz pastga tushadi: **«Kasrlarni qoʻshishdagi xatoning ildizi — EKUK»**. Shaxsiy yoʻl ildizdan oʻsadi. | Hakam |
| 1:35–2:05 | Telefon: `/learn/lcm` | Mashq savoli, ataylab xato javob (24). SI-tyutor oʻzbek tilida *aynan shu xato fikrni* tushuntiradi (koʻpaytma — umumiy karrali, lekin eng kichigi emas). «Nega?» → chatda savol. | Hakam / Operator |
| 2:05–2:45 | Proyektor: `/teacher` | «Hakamning qatori hozirgina paydo boʻldi» (sariq yonib-oʻchadi). «Eng koʻp uchragan ildiz — EKUK, 7 (endi 8) oʻquvchi.» Qatorni bosish → oʻquvchi sahifasi: iz va sabab. Orqaga → **Mashq varaqasi** → A4 varaqa: 1-bet topshiriqlar, 2-bet javoblar kaliti. | Operator |
| 2:45–3:00 | Slayd 6–7 | «Diagnoz aniq va tushuntiriladigan: graf + Bayes modeli; SI faqat tushuntiradi. Yangi mavzu = graf + savollar banki. Bizga 2 maktabda pilot kerak.» | Spiker |

## «Jasur» uchun javoblar (zaxira oʻquvchi)

> B ning `docs/pitch/demo-answers.md` fayli tayyor boʻlganda shu boʻlimni almashtiring.
> Hozirgi vaqtinchalik savollar banki (A fixture) uchun:

Maqsad: ildiz **EKUK** chiqishi. Qoida: quyidagi mavzulardagi savollarga **notoʻgʻri**,
qolgan hammasiga **toʻgʻri** javob bering.

| Savol mavzusi | Javob |
|---|---|
| Matnli masala (30 oʻquvchi, [[2/5]] qismi qizlar) | **12** (xato: qolgan qism oʻrniga ulush) |
| [[1/2]] + [[1/3]] | **[[2/5]]** (xato: suratlar va maxrajlarni alohida qoʻshish) |
| [[1/4]] va [[1/6]] ni umumiy maxrajga | **[[6/24]] va [[4/24]]** (xato: maxrajlar koʻpaytmasi) |
| EKUK(4, 6) | **24** (xato: koʻpaytma) |
| Qolgan barcha savollar | toʻgʻri javob |

Kutilgan natija: iz «Matnli masala → Har xil maxraj → Umumiy maxraj → EKUK».

## Agar biror narsa ishlamasa

- **Internet yoʻq:** diagnostika brauzerda ishlaydi; SI tushuntirishlar tayyor matnga oʻtadi. Oʻqituvchi paneli «Aloqa yoʻq — oxirgi maʼlumot» deb koʻrsatadi va qayta ulanadi.
- **Hakam telefoni QR ni oʻqimaydi:** QR ostidagi manzilni aytib bering yoki Operator «Jasur» boʻlib oʻtadi.
- **Hammasi ishlamasa:** zaxira video (`links.md`).
