# Demo ssenariysi — 3 daqiqa (v2)

Kim nima qiladi: **Spiker** (gapiradi, slaydlarni almaştiradi), **Operator** (noutbukda
proyektorda `/teacher`), **Hakam** (öz telefonida). Zaxira: hakam qatnaşmasa,
Operator ikkinçi telefonda `jasur` bölib kiradi.

Hisoblar (parol): `ustoz / ustoz123` (öqituvçi), `jasur / jasur123` (öquvçi), `ona / ona123` (ota‑ona).

Tayyorgarlik (sahnaga çiqiştan 5 daqiqa oldin):
- `/teacher` → «Ildiz tahlili» → ⋯ → **Demo holatini tiklaş** (24 namunaviy öquvçi, testlar tarixi).
- Proyektorda 1‑oyna: landing `/`. 2‑oyna: `ustoz` bilan `/teacher`. Telefon: `jasur` bilan `/student`.
- Internet: telefon hotspoti yoqilgan. AI işlamasa ham demo işlaydi (tayyor matnlar).
- Material fayllari: `public/demo-materials/` (Biologiya PDF, Ona tili DOCX, Matematika PDF).

| Vaqt | Ekranda | Spiker gapiradi | Kim bosadi |
|---|---|---|---|
| 0:00–0:20 | Slayd 1 → 2 (muammo) | «Bitta sinf, 25 öquvçi, bitta surʼat. TIMSS 2023 da 8‑sinf öquvçilarimiz matematikadan 421 ball oldi. Öqituvçi xatoni köradi — sababini emas. Ildiz — öqituvçi uçun tayyor vosita.» | Spiker |
| 0:20–0:40 | Landing `/` → «Kiriş» → login `ustoz` | «Öqituvçi kiradi va butun sinfni fanlar böyiça köradi: 5 ta fan, har birida xarita va testlar.» Fan tablarini almaştirish. | Operator |
| 0:40–1:20 | Biologiya → dars → material yuklaş | PDF ni tortib tuşiradi. Animatsiya: fayl öqildi → betlar → asosiy tuşunçalar → savollar → tekşirildi (~7 s). «Ildiz materialdan beş savollik test tayyorladi.» Bir savolni tahrirlaydi, **«Öquvçilarga yuboriş»**. | Operator |
| 1:20–1:50 | Telefon: `jasur` → yangi test | Hakam/Operator testni yeçadi, oxirida konfetti. «Natija şu zahoti sinf xaritasida.» | Hakam |
| 1:50–2:20 | Proyektor: `/teacher` | Jasurning qatori yangilanadi (sariq yonib‑öçadi). **Matematika → «Ildiz tahlili»**: «Eng köp uçragan ildiz — EKUK». Qatorni bosiş → öquvçi sahifasi: iz va sabab. | Operator |
| 2:20–2:45 | Login `ona` | Ota‑ona Jasurning 5 ta fan böyiça xaritasini va ösiş grafigini köradi. | Operator |
| 2:45–3:00 | Slayd 6–7 | «Diagnoz aniq va tuşuntiriladigan: graf + Bayes modeli; SI faqat tuşuntiradi. Yangi fan = graf + savollar banki. Bizga 2 maktabda pilot kerak.» | Spiker |

## Agar biror narsa işlamasa

- **Internet yöq:** diagnostika brauzerda işlaydi; SI tuşuntirişlari tayyor matnga ötadi. Panel «Aloqa yöq — oxirgi maʼlumot» deb körsatadi va qayta ulanadi.
- **Material yuklaş qotib qolsa:** sahifani yangilang; test baribir tayyor savollar bankidan çiqadi.
- **Hakam telefoni QR ni öqimasa:** QR ostidagi manzilni ayting yoki Operator `jasur` bölib kiradi.
- **Hammasi işlamasa:** zaxira video (`links.md`).
