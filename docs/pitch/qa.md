# Hakamlar savollari — qisqa javoblar (Nihol)

Har javob 20–30 soniyada aytiladi. Raqamlar manbasi: `research.md`.

**1. Bolalarning şaxsiy maʼlumotlari-çi?**
Hisoblarni öqituvçi yaratadi; öquvçidan telefon va hujjat raqami söralmaydi, faqat ism,
login va sinf. Saqlanadigani — javoblar va bilim holati. SI ga ism yuborilmaydi: faqat savol
va tanlangan javob. Demoda parollar oddiy matn; işlab çiqarişda xeşlanadi va maʼlumotlar
Özbekistondagi serverda saqlanadi (bazamiz istalgan Postgresʼga köçadi).

**2. Diagnoz qançalik aniq? Tasodif emasmi?**
Diagnozni SI emas, deterministik model qiladi: bilim grafi (Matematikada 17 könikma,
oldingi şartlari bilan) + Bayes bilim kuzatuvi (BKT). Har xato javob qaysi notöğri fikrni
bildirişi oldindan belgilangan. Bir xil javoblar — bir xil natija. Dvigatelning unit testlari
bor. Keyingi qadam: pilotda öqituvçi bahosi bilan soliştiriş.

**3. Bitta öquvçiga qança turadi?**
Diagnostika va xarita bepul — brauzerda hisoblanadi. SI faqat tuşuntiriş va maşq matnida
işlaydi (Gemini). Bitta tuşuntiriş ~1,5 ming kiriş + ~300 çiqiş tokeni. Gemini 3.5 Flash‑Lite
narxida ($0,30 / $2,50 har 1 mln token) bu ≈ $0,0012; eng qimmat Flash (3.6, $1,50 / $7,50)
da ≈ $0,0045. Haftasiga 20 ta tuşuntiriş ≈ $0,02–0,09 / öquvçi. Hosting pilot uçun bepul
tarifda. Manba: [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing).

**4. Davlat dasturiga mosmi?**
Matematika — 5–6‑sinf «Kasrlar» (EKUK, EKUB, qisqartiriş, umumiy maxraj, aralaş sonlar,
amallar, matnli masalalar), atamalar darslikdagidek. Ona tili, Ingliz tili, Biologiya va Kimyo
6‑sinf böyiça 7 tadan dars bilan tayyor (jami 5 fan). Öqituvçi öz fani va darsini qöşa oladi.

**5. Dars materialidan test — bu haqiqiy SI-mi?**
Demoda test tayyorlaş animatsiyasi körsatiladi, savollar esa tayyor savollar bankidan
çiqadi, öqituvçi baribir tahrirlaydi. Keyingi qadam: haqiqiy PDF/Word materialdan Gemini
bilan savol yaratiş; öqituvçi tahriri va deterministik baholaş şu yerda saqlanib qoladi.

**6. Internet bölmasa-çi?**
Diagnostika va maşqlar telefonda oflayn işlaydi, javoblar internet qaytganda yuboriladi.
SI örniga tayyor tuşuntirişlar çiqadi. Panel oxirgi maʼlumotni saqlaydi.

**7. Öqituvçilar buni işlatadimi?**
Öqituvçiga yangi iş qöşmaydi: material yuklaydi, test tayyor böladi. Öqituvçi 10 soniyada
«kim qaysi darsda yoki ildizda» ekanini köradi va bir bosişda guruhga çop etiladigan
varaqa oladi — u buni hozir qölda soatlab qiladi.

**8. Ota‑ona nimani köradi?**
Bolasining 5 ta fan böyiça bilim xaritasini va vaqt ötişi bilan ösiş grafigini, oxirgi
test natijalarini. Bu ota‑onaga «baho nega şunday» degan savolga javob beradi.

**9. Biznes model?**
Birinçi oy bepul sinov: barça fanlar, çeksiz sinf, öquvçi va test, karta talab qilinmaydi.
Ikkinçi oydan maktab obunasi: obunani maktab oladi, öqituvçi öz çöntagidan tölamaydi,
narx sinflar va öqituvçilar soniga qarab kelişiladi; sinov davridagi maʼlumotlar saqlanadi.
Keyingi bosqich — tuman taʼlim bölimi yoki davlat dasturi doirasida. PQ‑358 (SI strategiyasi 2030)
maktablarga SI joriy etişni közda tutadi.

**10. Nega şunçaki ChatGPT emas?**
Chatbot javobni beradi, sababni topmaydi; matematikada adaşişi mumkin va sinfni körmaydi.
Bizda baholaş va diagnoz — deterministik; SI faqat tuşuntiradi, töğri javobni hech qaçon
özi «öylab topmaydi». Hammasi özbek tilida, darslik atamalari bilan.

**11. Jamoa kim?**
Uç kişi: platforma va SI (A), kontent — fanlar, savollar, yangi alifbo (B), deploy,
öqituvçi paneli va pitch (C). Ismlar: `links.md` dagi jamoa bölimiga qarang.

**12. Bir öqituvçi bir neça sinfni yuritadimi?**
Ha. Öqituvçi sinflarni özi yaratadi, nomini özgartiradi va yuqoridagi almaştirgiç bilan
sinfdan sinfga ötadi; har bir sinf uçun hisoblarni (öquvçi + ota‑ona) bir bosişda yaratadi.
Demoda 4 ta sinf bor: 6‑A, 6‑B, 5‑A, 7‑A.

**13. Nega yangi alifbo?**
2026‑yil 21‑oktabrda imzolangan qonun böyiça Oʻ, Gʻ, Sh, Ch örniga Ö, Ğ, Ş, Ç keladi
(2027‑yil apreldan kuçga kiradi, darsliklar 2031‑yilgaça ötadi). Nihol bugundan yangi
alifboda — maktablar ötişga tayyor.
