# Hakamlar savollari — qisqa javoblar

Har javob 20–30 soniyada aytiladi. Raqamlar manbasi: `research.md`.

**1. Bolalarning shaxsiy maʼlumotlari-chi?**
Parol, telefon, familiya soʻralmaydi: faqat ism va sinf kodi. Saqlanadigani —
javoblar va bilim holati. Pilotda taxallus ishlatsa ham boʻladi. Ishlab chiqarishda
maʼlumotlar Oʻzbekistondagi serverda saqlanadi (fuqarolar shaxsiy maʼlumotlarini
mahalliylashtirish talabi); bazamiz istalgan Postgres'ga koʻchadi. SI ga ism yuborilmaydi
— faqat savol va tanlangan javob.

**2. Diagnoz qanchalik aniq? Tasodif emasmi?**
Diagnozni SI emas, deterministik model qiladi: bilim grafi (17 koʻnikma, oldingi
shartlar bilan) + Bayes bilim kuzatuvi (BKT). Har xato javob qaysi notoʻgʻri fikrni
bildirishi oldindan belgilangan. Bir xil javoblar — bir xil natija, har xulosani
tushuntirib berish mumkin. Dvigatelning unit testlari bor. Keyingi qadam: pilotda
oʻqituvchi bahosi bilan solishtirish.

**3. Bitta oʻquvchiga qancha turadi?**
Diagnostika va xarita bepul — brauzerda hisoblanadi. SI faqat tushuntirishda ishlaydi:
bitta tushuntirish ~1,5 ming kirish + ~300 chiqish tokeni ≈ $0,012 (Claude Opus 5.5
narxida). Haftasiga 20 ta tushuntirish ≈ $0,25 / oʻquvchi. Arzonroq model yoki
tayyor matnlar bilan bundan ham kam. Hosting pilot uchun bepul tarifda.

**4. Davlat dasturiga mosmi?**
Mavzu — 5–6-sinf «Kasrlar»: EKUK, EKUB, qisqartirish, umumiy maxraj, aralash sonlar,
amallar, matnli masalalar. Atamalar maktab darsligidagidek (surat, maxraj, EKUK).
Koʻnikmalar grafini darslik tartibiga qarab tuzdik.

**5. Internet boʻlmasa-chi?**
Diagnostika va mashqlar telefonda oflayn ishlaydi, javoblar internet qaytganda
yuboriladi. SI oʻrniga tayyor tushuntirishlar chiqadi. Oʻqituvchi paneli oxirgi
maʼlumotni saqlaydi.

**6. Oʻqituvchilar buni ishlatadimi?**
Oʻqituvchiga yangi ish qoʻshmaydi: oʻquvchilar QR orqali kiradi, panel oʻzi toʻladi.
Oʻqituvchi 10 soniyada «kim qaysi ildizda» ekanini koʻradi va bir bosishda guruhga
chop etiladigan varaqa oladi — u buni hozir qoʻlda soatlab qiladi.

**7. Boshqa fanlar va tillarga kengayadimi?**
Dvigatel mavzuga bogʻliq emas: yangi mavzu = koʻnikmalar grafi + xato turlari +
savollar banki (JSON). Interfeys matnlari bir joyda — rus va qoraqalpoq tillari
qoʻshiladi.

**8. Biznes model?**
Oʻquvchi va oʻqituvchi uchun bepul; litsenziya maktab / tuman taʼlim boʻlimi
darajasida (sinf boshiga yillik toʻlov) yoki davlat dasturi doirasida. PQ-358
(SI strategiyasi 2030) maktablarga SI joriy etishni koʻzda tutadi.

**9. Nega shunchaki ChatGPT emas?**
Chatbot javobni beradi, sababni topmaydi; matematikada adashishi mumkin va sinfni
koʻrmaydi. Bizda baholash va diagnoz — deterministik; SI faqat tushuntiradi, toʻgʻri
javobni hech qachon oʻzi «oʻylab topmaydi». Va hammasi oʻzbek tilida, darslik atamalari bilan.

**10. Jamoa kim?**
Uch kishi: ilova va SI (A), kontent — graf va savollar (B), oʻqituvchi paneli, deploy
va pitch (C). Ismlar va tajriba: `links.md` dagi jamoa boʻlimiga qarang.
