# Yoshlar Amaliyot Bot

Telegram bot: amaliyot (stajirovka) dasturi haqida ma'lumot berish, ariza jarayonini yo'naltirish va agentlik haqida umumiy ma'lumot taqdim etish.

## Asosiy imkoniyatlar
- Ko'p tillilik (uz/ru/en/kaa)
- Reply keyboard menyu
- Super Admin va Admin rollari
- Broadcast yuborish (matn, media, fayl)
- Statistika (jami/aktiv/tillar bo'yicha)
- Kontent va tugmalarni real vaqt yangilash
- Yangi bo'lim qo'shish yoki yashirish
- Log yuritish

## Tez boshlash
1. `npm install`
2. `.env` faylini yarating va to'ldiring:
   ```env
   BOT_TOKEN=your_telegram_bot_token_here
   SUPER_ADMIN=123456789
   ```
3. `npm start`

## Super Admin panel
Super Admin uchun bot menyusida `Admin panel` tugmasi ko'rinadi.
Panel orqali quyidagilarni qilasiz:
- Broadcast yuborish
- Statistika ko'rish
- Admin qo'shish/o'chirish
- Kontent yangilash (start/bo'limlar)
- Tugma nomlarini o'zgartirish
- Bo'lim qo'shish/yashirish/tiklash

## Buyruqlar (ixtiyoriy)
Super Admin:
- `/admin` - admin panelni ochish
- `/add_admin user_id`
- `/remove_admin user_id`
- `/broadcast`
- `/stats`
- `/update_content ...`

Admin:
- `/broadcast`

## Ma'lumotlar saqlanishi
Fayllar `data/` ichida:
- `data/users.json` - user_id, til, role, last_active
- `data/content.json` - kontent override, custom bo'limlar
- `data/logs.txt` - admin amallari loglari

## Muhim eslatmalar
- `SUPER_ADMIN` ni to'g'ri user_id bilan yozing va botni qayta ishga tushiring.
- Broadcast yuborishda rate-limit bor (navbat bilan jo'natiladi).
- Foydalanuvchi botni blok qilsa, keyingi broadcastlarda u avtomatik skip qilinadi.

## Talablar
- Node.js 18+ tavsiya etiladi
- Telegram Bot API

