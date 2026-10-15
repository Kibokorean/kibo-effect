# KIBO Unified — audit va integratsiya hisoboti

## Audit xulosasi

- **KIBO EFFECT:** Google/Firebase autentifikatsiyasi, App Check, server session, himoyalangan test olish/baholash API’lari va foydalanuvchi egasiga cheklangan Firestore qoidalari bor. `firestore.rules` o‘zgartirilmagan.
- **KIBO KOREAN:** 16 ta TOPIK test HTML’i va 331 savol. EFFECT’ning server himoyalangan to‘plamlarida ham 16 test va 331 savol mavjud. 15 testdagi savol matni va variantlari mos; `test-11` ichida ayrim savollar boshqa versiyada.
- **KIBO VOCABULARY:** 3.6 MB HTML, 24 JavaScript inline script, 26 style tag, kartochka/bo‘limlar/xato so‘zlar va takrorlash tizimi. Ma’lumot massivlarida jami 18,470 yozuv hisoblandi; bu manba massivlari yig‘indisi, unikal so‘zlar soni emas.

## Bajarilgan ishlar

- EFFECT bosh sahifasidan dars kartalari, “So‘nggi darslar” va darsga oid launcherlar olib tashlandi. Login, profil, kalendar/statistika va xavfsizlik API’lari saqlandi.
- 16 ta TOPIK testi yagona bosh sahifaga kiritildi. Testlar autentifikatsiyalangan API’dan olinadi va serverdagi mavjud grading oqimidan foydalanadi. Testlar iframe’siz ilova ichida ko‘rsatiladi.
- Lug‘at moduli ilova ichidagi view sifatida qo‘shildi. So‘z kartalari va oraliqli takrorlash saqlandi; progress `users/{uid}/progress/vocabulary` hujjatida saqlanadi. Mavjud Firestore qoidasi bu hujjatni faqat egasiga ochadi. Brauzer cache kalitlari ham UID bo‘yicha ajratilgan.
- Testni davom ettirish yozuvlari foydalanuvchi UID’si bo‘yicha ajratildi. KIBO KOREAN logotipi test sahifalarida ishlatiladi.
- `.env.example`, `firestore.rules`, `vercel.json`, `firebase.json`, xavfsizlik hujjatlari va server API’lari loyihada saqlandi. Dars HTML’lari deploy papkasiga kiritilmadi.

## Tekshiruvlar

- Bosh sahifa va lug‘at JavaScript sintaksisi tekshirildi.
- API JavaScript fayllari Node.js `--check` bilan tekshirildi; `package.json`, `firebase.json` va `vercel.json` JSON sifatida o‘qildi.
- Firestore qoidalari kirishdagi nusxa bilan SHA-256 bo‘yicha bir xil.
- Brauzer smoke sinovi mock Firebase/API bilan bajarildi: login oqimi, 16 test kartasi, TOPIK test sahifasining iframe’siz ko‘rinishi (24 savol), grading so‘rovi, lug‘at, tungi rejim va 390px mobil viewport tekshirildi. Xatolar: 0; gorizontal overflow: yo‘q.

## Deploy uchun ochiq tekshiruvlar

- Bu muhitda haqiqiy Google login, Firebase App Check, Firebase Admin credential’lari, Firestore yozuvi va Vercel deploy tekshirilmagan. `SECURE_TESTS_SETUP.md`, `APP_CHECK_SETUP.md` va `DEPLOY_CHECKLIST.md` bo‘yicha Vercel muhit o‘zgaruvchilarini tasdiqlash kerak.
- `test-11` savol versiyasi ikki yuborilgan loyiha orasida farq qiladi. Hozir EFFECT’ning serverda baholanadigan himoyalangan varianti ishlatiladi; KOREAN arxividagi farqli savollar uchun mos server answer key va grading natijasini tasdiqlash kerak.
- Smoke sinovida Firebase va HTTP endpointlari mock qilindi; bu haqiqiy hisob/credential sinovi emas.


## Firebase project alignment (2026-10-15)

The standalone Korean module Firebase web configuration has been aligned to the `kibo-effect` project used by the main integrated `index.html`. This only changes the client project configuration; deploy-time Firebase Admin environment variables and Firebase Console settings must also point to `kibo-effect`. The destination project must have Google sign-in enabled, `kibo-effect.vercel.app` authorized, the matching App Check site key registered, and the Firestore rules from this repository deployed. Existing data in `kibo-4628d` is not migrated by changing client configuration.
