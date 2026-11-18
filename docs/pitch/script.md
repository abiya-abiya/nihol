# Demo ssenariysi — 3 daqiqa (Nihol)

Kim nima qiladi: **Spiker** (gapiradi, slaydlarni almaştiradi), **Operator** (noutbukda,
proyektorda), **Hakam** (öz telefonida). Zaxira: hakam qatnaşmasa, Operator ikkinçi
telefonda `jasur` bölib kiradi.

Sayt: **https://niholsi.netlify.app**. Hisoblar (parol): `ustoz / ustoz123` (öqituvçi),
`jasur / jasur123` (öquvçi), `ona / ona123` (ota‑ona).

Tayyorgarlik (sahnaga çiqiştan 5 daqiqa oldin):
- `ustoz` bilan `/teacher` → ⋯ → **Demo holatini tiklaş**: 4 ta sinf (6‑A, 6‑B, 5‑A, 7‑A),
  5 ta fan, çorak davomidagi testlar va natijalar qaytadi.
- Proyektorda 1‑oyna: landing `/`. 2‑oyna: `ustoz` bilan `/teacher` (6‑A sinf). Telefon: `jasur` bilan `/student`.
- Internet: telefon hotspoti yoqilgan. SI işlamasa ham demo işlaydi (tayyor tuşuntirişlar).
- Material fayllari `public/demo-materials/` da: Biologiya, Ingliz tili, Kimyo, Matematika (PDF), Ona tili (DOCX).

| Vaqt | Ekranda | Spiker gapiradi | Kim bosadi |
|---|---|---|---|
| 0:00–0:20 | Slayd 1 → 2 (muammo) | «Bitta sinf, 25 öquvçi, bitta surʼat. TIMSS 2023 da 8‑sinf öquvçilarimiz matematikadan 421 ball oldi. Öqituvçi xatoni köradi — sababini emas. Nihol — öqituvçi uçun tayyor vosita.» | Spiker |
| 0:20–0:40 | Landing `/` → «Kiriş» → `ustoz` | «Öqituvçi kiradi va sinfini 5 ta fan böyiça köradi: har bir fan — bilim xaritasi, hafta, oy va çorak statistikasi.» Fan tablarini va «Hafta / Oy / Çorak» ni almaştirish. | Operator |
| 0:40–1:20 | Fanlar → Biologiya → dars → material yuklaş | PDF ni tortib tuşiradi. Animatsiya: fayl öqildi → sahifalar → asosiy tuşunçalar → savollar → tekşirildi (~7 s). «Materialdan beş savollik test tayyor.» Bir savolni tahrirlaydi, **«Öquvçilarga yuboriş»**. | Operator |
| 1:20–1:50 | Telefon: `jasur` → yangi test | Hakam/Operator testni yeçadi, oxirida konfetti. «Natija şu zahoti öqituvçida va ota‑onada.» | Hakam |
| 1:50–2:20 | Proyektor: `/teacher` → Matematika → **«Ildiz tahlili»** | «Eng köp uçragan ildiz — EKUK: muammo kasrlarni qöşişda emas, EKUK da.» Öquvçi qatorini bosiş → bilim xaritasida qizil iz. | Operator |
| 2:20–2:45 | Login `ona` | Ota‑ona Jasurning 5 ta fan böyiça xaritasini (yaşil — özlaştirilgan, qizil — böşliq), ösiş grafigini va oxirgi natijalarni köradi. | Operator |
| 2:45–3:00 | Slayd 6–7 | «Diagnoz aniq va tuşuntiriladigan: graf + Bayes modeli; SI faqat tuşuntiradi. Yangi fan = graf + savollar banki. Bir oy bepul, keyin maktab obunasi. Bizga 2 maktabda pilot kerak.» | Spiker |

## Agar biror narsa işlamasa

- **Internet yöq:** diagnostika va maşq brauzerda işlaydi; SI tuşuntirişlari tayyor matnga ötadi, javoblar internet qaytganda yuboriladi.
- **Material yuklaş qotib qolsa:** sahifani yangilang; test baribir savollar bankidan çiqadi.
- **Hakam telefoni QR ni öqimasa:** QR ostidagi manzilni ayting (`niholsi.netlify.app/start?class=6a`) yoki Operator `jasur` bölib kiradi.
- **Hammasi işlamasa:** zaxira video (`links.md`).
