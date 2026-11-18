# Demo ssenariysi — 3 daqiqa (Nihol)

Kim nima qiladi: **Spiker** (gapiradi, slaydlarni almaştiradi), **Operator** (noutbukda,
proyektorda), **Hakam** (öz telefonida). Zaxira: hakam qatnaşmasa, Operator ikkinçi
telefonda `jasur` bölib kiradi.

Sayt: **https://niholsi.netlify.app**. Hisoblar (parol):

| Rol | Login / parol | Nima köradi |
|---|---|---|
| Maktab (taşkilot) | `maktab / maktab123` | 45‑maktab: 3 öqituvçining samaradorligi, yangi öqituvçi hisobi |
| Öqituvçi | `ustoz / ustoz123` | Dilnoza Karimova: 6‑A va 6‑B sinflar, 5 fan |
| Öqituvçi | `bobur / bobur123`, `nodira / nodira123` | 7‑A va 5‑A sinflar |
| Öquvçi | `jasur / jasur123` | Jasur, 6‑A |
| Ota‑ona | `ona / ona123` | Jasurning onasi |

Tayyorgarlik (sahnaga çiqiştan 5 daqiqa oldin):
- `ustoz` bilan `/teacher` → ⋯ → **Demo holatini tiklaş**: sinflar, 5 fan, çorak davomidagi
  testlar va natijalar qaytadi (sinab körilgan testlar öçadi).
- Proyektorda 1‑oyna: landing `/`. 2‑oyna: `ustoz` bilan `/teacher` (6‑A sinf).
  3‑oyna: `maktab` bilan `/org`. Telefon: `jasur` bilan `/student`.
- Internet: telefon hotspoti yoqilgan. SI işlamasa ham demo işlaydi (tayyor tuşuntirişlar).
- Material fayllari `public/demo-materials/` da: Biologiya, Ingliz tili, Kimyo, Matematika (PDF), Ona tili (DOCX).

| Vaqt | Ekranda | Spiker gapiradi | Kim bosadi |
|---|---|---|---|
| 0:00–0:20 | Slayd 1 → 2 (muammo) | «Bitta sinf, 25 öquvçi, bitta surʼat. TIMSS 2023 da 8‑sinf öquvçilarimiz matematikadan 421 ball oldi. Öqituvçi xatoni köradi — sababini emas. Nihol — maktab va öqituvçi uçun tayyor vosita.» | Spiker |
| 0:20–0:35 | Landing `/` | Hakamga: «QR ni skanerlang — Nihol telefoningizda oçiladi.» Heroda misol fanlar böyiça aylanadi: biologiyada xato javob «Hujayra tuzilişi»gaça, kimyoda «Atom va kimyoviy element»gaça kuzatiladi. «Istalgan fan uçun bitta platforma.» | Operator |
| 0:35–1:10 | `ustoz` → Fanlar → Biologiya → dars → material yuklaş | PDF ni tortib tuşiradi. Animatsiya: fayl öqildi → asosiy tuşunçalar → savollar (~7 s). «Materialdan beş savollik test tayyor.» Bir savolni tahrirlaydi, **«Öquvçilarga yuboriş»**. | Operator |
| 1:10–1:35 | Telefon: `jasur` → yangi test | Hakam/Operator testni yeçadi, oxirida konfetti. «Natija şu zahoti öqituvçida, ota‑onada va maktabda.» | Hakam |
| 1:35–1:55 | `/teacher` → Matematika → **«Ildiz tahlili»** | «Eng köp uçragan ildiz — EKUK: muammo kasrlarni qöşişda emas, EKUK da.» Öquvçi qatorini bosiş → bilim xaritasida qizil iz. | Operator |
| 1:55–2:15 | Login `ona` | Ota‑ona Jasurning 5 ta fan böyiça xaritasini, ösiş grafigini va oxirgi natijalarni köradi. | Operator |
| 2:15–2:45 | `maktab` → `/org` | «Maktab ma'muriyati har bir öqituvçining samaradorligini öquvçilari natijasi orqali köradi: örtaça özlaştiriş, test bali, yuborilgan testlar, hafta / oy / çorak.» Reytingni körsatiş, keyin **«Yangi öqituvçi»** → ism → login va parol çiqadi. | Operator |
| 2:45–3:00 | Slayd 6–7 | «Diagnoz aniq va tuşuntiriladigan: graf + Bayes modeli; SI faqat tuşuntiradi. Maktabsiz öqituvçi ham özi röyxatdan ötadi. Bir oy bepul, keyin maktab obunasi. Bizga 2 maktabda pilot kerak.» | Spiker |

## Agar biror narsa işlamasa

- **Internet yöq:** diagnostika va maşq brauzerda işlaydi; SI tuşuntirişlari tayyor matnga ötadi, javoblar internet qaytganda yuboriladi.
- **Material yuklaş qotib qolsa:** sahifani yangilang; test baribir savollar bankidan çiqadi.
- **Hakam telefoni QR ni öqimasa:** QR ostidagi manzilni ayting (`niholsi.netlify.app`) yoki Operator `jasur` bölib kiradi.
- **`ustoz` da 5‑A yoki 7‑A sinfi yöq:** bu töğri — har öqituvçi faqat öz sinflarini köradi; 7‑A uçun `bobur`, 5‑A uçun `nodira`.
- **Hammasi işlamasa:** zaxira video (`links.md`).
