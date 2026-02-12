const fs = require("fs");
const path = require("path");
const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPER_ADMIN_RAW = process.env.SUPER_ADMIN || "";

if (!BOT_TOKEN) {
  console.error(
    "BOT_TOKEN is not set. Add it to your environment or .env file.",
  );
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const LOG_FILE = path.join(DATA_DIR, "logs.txt");

const SUPER_ADMINS = new Set(
  SUPER_ADMIN_RAW.split(/[, ]+/)
    .map((value) => value.trim())
    .filter(Boolean),
);

const LANG_CODES = ["uz", "ru", "en", "kaa"];
const BASE_SECTIONS = ["apply", "agency", "internship", "contact"];
const ALLOWED_BUTTON_KEYS = [
  "apply",
  "agency",
  "internship",
  "contact",
  "settings",
  "language",
  "back",
  "lang_uz",
  "lang_ru",
  "lang_en",
  "lang_kaa",
  "admin_panel",
];

const ACTIVE_DAYS = 30;
const BROADCAST_DELAY_MS = 40;
const MAX_STATS_MESSAGE = 3500;

const DEFAULT_I18N = {
  uz: {
    start:
      "Yoshlar ishlari agentligida biz bilan birga faoliyatingizni boshlashga tayyormisiz?",
    apply_text: "Amaliyot uchun arizalarni qabul qilish yakunlangan.",
    agency_text:
      "Yoshlar ishlari agentligi — yoshlarni qo‘llab-quvvatlash, ularning salohiyatini ro‘yobga chiqarish va jamiyatdagi faolligini oshirishga qaratilgan davlat tashkilotidir.\n\nAgentlik yoshlar bandligi, ta’limi, startap va tashabbuslarini rivojlantirish, shuningdek, ijtimoiy loyihalarni qo‘llab-quvvatlash yo‘nalishlarida faoliyat olib boradi.\n\nBizning jamoada zamonaviy boshqaruv tizimi, ochiq muloqot muhiti va har bir amaliyotchining o‘sishiga xizmat qiladigan imkoniyatlar mavjud.",
    internship_text:
      "🔹 Davomiyligi: 3 oy\n🔹 Ish joyi: Yoshlar ishlari agentligi hududiy yoki markaziy ofisi\n🔹 Ish vaqti: O‘qishdan bo‘sh vaqtga mos ravishda\n🔹 Amaliyotchilar real loyihalarda ishtirok etadi\n🔹 Har bir amaliyotchiga mas’ul mentor biriktiriladi\n🔹 Agentlik tadbir va loyihalarida qatnashish imkoniyati mavjud\n🔹 Yakunda sertifikat va tavsiyanoma beriladi\n🔹 Eng faol amaliyotchilar keyinchalik ish faoliyatini davom ettirish imkoniga ega bo‘lishi mumkin\n\nTanlov jarayoni:\n1. Ariza topshirish\n2. Saralash bosqichi\n3. Suhbat",
    contact_text:
      "Savollar yoki xatolar yuzaga kelsa, biz bilan bog‘laning:\n@AbdugaffarovAbubakr",
    settings_text: "Sozlamalar:",
    choose_lang_text: "Tilni tanlang:",
    lang_set_text: "Til tanlandi.",
    unknown_text:
      "Kechirasiz, bu buyruq tushunarsiz. Iltimos, menyudan foydalaning.",
    error_text: "Xatolik yuz berdi. Iltimos, keyinroq urinib ko‘ring.",
    admin_only: "Faqat Admin yoki Super Admin uchun.",
    super_admin_only: "Faqat Super Admin uchun.",
    action_in_progress: "Avvalgi jarayon yakunlanmagan. /cancel orqali bekor qiling.",
    action_cancelled: "Jarayon bekor qilindi.",
    broadcast_prompt: "Xabar matnini yuboring:",
    broadcast_done: "Broadcast yakunlandi. Yuborildi: {ok}, Xatolar: {fail}",
    stats_title: "Statistika:",
    stats_total: "Jami foydalanuvchilar: {count}",
    stats_active: "Aktiv foydalanuvchilar (30 kun): {count}",
    stats_lang: "Tillar bo‘yicha: {list}",
    stats_users_title: "Foydalanuvchilar ro‘yxati:",
    stats_users_header:
      "ID | Ism | Username | Til | Rol | Oxirgi faollik | Blok",
    add_admin_usage: "/add_admin user_id yoki foydalanuvchi xabariga reply qiling.",
    add_admin_done: "Admin tayinlandi: {id}",
    remove_admin_done: "Admin o‘chirildi: {id}",
    user_not_found: "Foydalanuvchi topilmadi.",
    cannot_change_super: "Super Admin rolini o‘zgartirib bo‘lmaydi.",
    update_usage:
      "Foydalanish:\n/update_content start\n/update_content agency\n/update_content internship\n/update_content contact\n/update_content apply\n/update_content button <key>\n/update_content add_section <key>\n/update_content delete_section <key>\n/update_content restore_section <key>\nEslatma: o‘zgarishlar joriy tilga qo‘llanadi.",
    update_prompt_text: "Yangi matnni yuboring:",
    update_prompt_button: "Yangi tugma nomini yuboring:",
    update_prompt_section_label: "Bo‘lim tugma nomini yuboring:",
    update_prompt_section_text: "Bo‘lim matnini yuboring:",
    update_done: "Yangilandi.",
    section_added: "Bo‘lim qo‘shildi: {key}",
    section_deleted: "Bo‘lim o‘chirildi: {key}",
    section_hidden: "Bo‘lim yashirildi: {key}",
    section_restored: "Bo‘lim tiklandi: {key}",
    section_not_found: "Bo‘lim topilmadi: {key}",
    invalid_section_key:
      "Bo‘lim kaliti noto‘g‘ri. Faqat harf, raqam va _ ishlatish mumkin.",
    button_key_invalid: "Noto‘g‘ri tugma kaliti.",
    admin_panel_title: "🛠 Admin panel",
    admin_panel_prompt: "Amalni tanlang:",
    admin_panel_broadcast: "📣 Broadcast",
    admin_panel_stats: "📊 Statistika",
    admin_panel_admins: "👥 Adminlar",
    admin_panel_content: "📝 Kontent",
    admin_panel_sections: "🧩 Bo‘limlar",
    admin_panel_buttons: "🔤 Tugmalar",
    admin_panel_back: "◀️ Orqaga",
    admin_panel_close: "✖️ Yopish",
    admin_panel_add_admin: "➕ Admin qo‘shish",
    admin_panel_remove_admin: "➖ Admin o‘chirish",
    admin_panel_choose_content: "Qaysi kontentni o‘zgartiramiz?",
    admin_panel_choose_button: "Qaysi tugmani o‘zgartiramiz?",
    admin_panel_choose_section: "Bo‘limni tanlang:",
    admin_panel_add_section: "➕ Bo‘lim qo‘shish",
    admin_panel_delete_section: "🗑 Bo‘lim o‘chirish",
    admin_panel_restore_section: "♻️ Bo‘lim tiklash",
    admin_panel_enter_section_key:
      "Bo‘lim kalitini yuboring (faqat harf/raqam/_).",
    admin_panel_enter_user_id:
      "Foydalanuvchi ID yuboring yoki xabariga reply qiling.",
    admin_panel_enter_user_id_remove:
      "O‘chirish uchun user ID yuboring yoki xabariga reply qiling.",
    admin_panel_start: "Start xabari",
    admin_panel_no_sections: "Bo‘limlar topilmadi.",
    buttons: {
      apply: "📝 Ariza yuborish",
      agency: "🏢 Agentlik haqida",
      internship: "🎓 Amaliyot haqida",
      contact: "📞 Bog‘lanish",
      settings: "⚙️ Sozlamalar",
      language: "Tilni tanlash",
      back: "Orqaga",
      admin_panel: "🛠 Admin panel",
      lang_uz: "🇺🇿 O‘zbek tili",
      lang_ru: "🇷🇺 Rus tili",
      lang_en: "🇬🇧 Ingliz tili",
      lang_kaa: "🇰🇿 Qoraqalpoq tili",
    },
  },

  ru: {
    start:
      "Готовы начать свою деятельность вместе с Агентством по делам молодежи?",
    apply_text: "Прием заявок на стажировку завершен.",
    agency_text:
      "Агентство по делам молодежи — государственная организация, направленная на поддержку молодежи, раскрытие их потенциала и повышение их социальной активности.\n\nАгентство работает в сферах занятости молодежи, образования, развития стартапов и инициатив, а также поддержки социальных проектов.\n\nВ нашей команде действует современная система управления, открытая коммуникационная среда и возможности для профессионального роста каждого стажера.",
    internship_text:
      "🔹 Длительность: 3 месяца\n🔹 Место: центральный или региональный офис Агентства\n🔹 График: в свободное от учебы время\n🔹 Стажеры участвуют в реальных проектах\n🔹 За каждым закрепляется наставник\n🔹 Возможность участия во всех мероприятиях агентства\n🔹 По окончании выдается сертификат и рекомендация\n🔹 Лучшие стажеры могут получить возможность дальнейшей работы\n\nЭтапы отбора:\n1. Подача заявки\n2. Отборочный этап\n3. Собеседование",
    contact_text:
      "Если возникли вопросы или ошибки, свяжитесь с нами:\n@AbdugaffarovAbubakr",
    settings_text: "Настройки:",
    choose_lang_text: "Выберите язык:",
    lang_set_text: "Язык выбран.",
    unknown_text:
      "Извините, команда не распознана. Пожалуйста, используйте меню.",
    error_text: "Произошла ошибка. Попробуйте позже.",
    admin_only: "Только для админа или супер админа.",
    super_admin_only: "Только для супер админа.",
    action_in_progress: "Предыдущий процесс не завершен. Отмените через /cancel.",
    action_cancelled: "Процесс отменен.",
    broadcast_prompt: "Отправьте текст сообщения:",
    broadcast_done: "Рассылка завершена. Отправлено: {ok}, Ошибки: {fail}",
    stats_title: "Статистика:",
    stats_total: "Всего пользователей: {count}",
    stats_active: "Активные пользователи (30 дней): {count}",
    stats_lang: "По языкам: {list}",
    stats_users_title: "Список пользователей:",
    stats_users_header:
      "ID | Имя | Username | Язык | Роль | Последняя активность | Блок",
    add_admin_usage: "/add_admin user_id или ответьте на сообщение пользователя.",
    add_admin_done: "Админ назначен: {id}",
    remove_admin_done: "Админ удален: {id}",
    user_not_found: "Пользователь не найден.",
    cannot_change_super: "Нельзя изменить роль супер админа.",
    update_usage:
      "Использование:\n/update_content start\n/update_content agency\n/update_content internship\n/update_content contact\n/update_content apply\n/update_content button <key>\n/update_content add_section <key>\n/update_content delete_section <key>\n/update_content restore_section <key>\nПримечание: изменения применяются к текущему языку.",
    update_prompt_text: "Отправьте новый текст:",
    update_prompt_button: "Отправьте новое название кнопки:",
    update_prompt_section_label: "Отправьте название кнопки раздела:",
    update_prompt_section_text: "Отправьте текст раздела:",
    update_done: "Обновлено.",
    section_added: "Раздел добавлен: {key}",
    section_deleted: "Раздел удален: {key}",
    section_hidden: "Раздел скрыт: {key}",
    section_restored: "Раздел восстановлен: {key}",
    section_not_found: "Раздел не найден: {key}",
    invalid_section_key:
      "Неверный ключ раздела. Используйте только буквы, цифры и _.",
    button_key_invalid: "Неверный ключ кнопки.",
    admin_panel_title: "🛠 Админ-панель",
    admin_panel_prompt: "Выберите действие:",
    admin_panel_broadcast: "📣 Рассылка",
    admin_panel_stats: "📊 Статистика",
    admin_panel_admins: "👥 Админы",
    admin_panel_content: "📝 Контент",
    admin_panel_sections: "🧩 Разделы",
    admin_panel_buttons: "🔤 Кнопки",
    admin_panel_back: "◀️ Назад",
    admin_panel_close: "✖️ Закрыть",
    admin_panel_add_admin: "➕ Добавить админа",
    admin_panel_remove_admin: "➖ Удалить админа",
    admin_panel_choose_content: "Что обновить?",
    admin_panel_choose_button: "Какую кнопку изменить?",
    admin_panel_choose_section: "Выберите раздел:",
    admin_panel_add_section: "➕ Добавить раздел",
    admin_panel_delete_section: "🗑 Удалить раздел",
    admin_panel_restore_section: "♻️ Восстановить раздел",
    admin_panel_enter_section_key:
      "Отправьте ключ раздела (только буквы/цифры/_).",
    admin_panel_enter_user_id:
      "Отправьте ID пользователя или ответьте на сообщение.",
    admin_panel_enter_user_id_remove:
      "Для удаления отправьте ID пользователя или ответьте на сообщение.",
    admin_panel_start: "Стартовое сообщение",
    admin_panel_no_sections: "Разделы не найдены.",
    buttons: {
      apply: "📝 Подать заявку",
      agency: "🏢 Об агентстве",
      internship: "🎓 О стажировке",
      contact: "📞 Связаться",
      settings: "⚙️ Настройки",
      language: "Выбрать язык",
      back: "Назад",
      admin_panel: "🛠 Админ-панель",
      lang_uz: "🇺🇿 O‘zbek tili",
      lang_ru: "🇷🇺 Rus tili",
      lang_en: "🇬🇧 Ingliz tili",
      lang_kaa: "🇰🇿 Qoraqalpoq tili",
    },
  },

  en: {
    start: "Ready to start your journey with the Youth Affairs Agency?",
    apply_text: "Internship applications are closed.",
    agency_text:
      "The Youth Affairs Agency is a government organization dedicated to supporting young people, unlocking their potential, and increasing their social engagement.\n\nThe agency operates in youth employment, education, startup and initiative development, and support of social projects.\n\nOur team offers a modern management system, open communication culture, and growth opportunities for every intern.",
    internship_text:
      "🔹 Duration: 3 months\n🔹 Location: Central or regional offices of the Agency\n🔹 Schedule: Flexible, based on study time\n🔹 Interns participate in real projects\n🔹 Each intern is assigned a mentor\n🔹 Opportunity to join agency events and programs\n🔹 Certificate and recommendation letter provided\n🔹 Top interns may get a chance for future employment\n\nSelection stages:\n1. Application submission\n2. Screening stage\n3. Interview",
    contact_text:
      "If you have questions or errors, contact us:\n@AbdugaffarovAbubakr",
    settings_text: "Settings:",
    choose_lang_text: "Choose a language:",
    lang_set_text: "Language selected.",
    unknown_text: "Sorry, command not recognized. Please use the menu.",
    error_text: "An error occurred. Please try again later.",
    admin_only: "Admins only.",
    super_admin_only: "Super admin only.",
    action_in_progress: "Previous process is not finished. Cancel with /cancel.",
    action_cancelled: "Process cancelled.",
    broadcast_prompt: "Send the message text:",
    broadcast_done: "Broadcast completed. Sent: {ok}, Failed: {fail}",
    stats_title: "Statistics:",
    stats_total: "Total users: {count}",
    stats_active: "Active users (30 days): {count}",
    stats_lang: "By languages: {list}",
    stats_users_title: "Users list:",
    stats_users_header:
      "ID | Name | Username | Language | Role | Last active | Blocked",
    add_admin_usage: "/add_admin user_id or reply to a user message.",
    add_admin_done: "Admin assigned: {id}",
    remove_admin_done: "Admin removed: {id}",
    user_not_found: "User not found.",
    cannot_change_super: "Cannot change super admin role.",
    update_usage:
      "Usage:\n/update_content start\n/update_content agency\n/update_content internship\n/update_content contact\n/update_content apply\n/update_content button <key>\n/update_content add_section <key>\n/update_content delete_section <key>\n/update_content restore_section <key>\nNote: updates apply to the current language.",
    update_prompt_text: "Send the new text:",
    update_prompt_button: "Send the new button label:",
    update_prompt_section_label: "Send the section button label:",
    update_prompt_section_text: "Send the section text:",
    update_done: "Updated.",
    section_added: "Section added: {key}",
    section_deleted: "Section deleted: {key}",
    section_hidden: "Section hidden: {key}",
    section_restored: "Section restored: {key}",
    section_not_found: "Section not found: {key}",
    invalid_section_key: "Invalid section key. Use only letters, numbers, and _.",
    button_key_invalid: "Invalid button key.",
    admin_panel_title: "🛠 Admin panel",
    admin_panel_prompt: "Choose an action:",
    admin_panel_broadcast: "📣 Broadcast",
    admin_panel_stats: "📊 Stats",
    admin_panel_admins: "👥 Admins",
    admin_panel_content: "📝 Content",
    admin_panel_sections: "🧩 Sections",
    admin_panel_buttons: "🔤 Buttons",
    admin_panel_back: "◀️ Back",
    admin_panel_close: "✖️ Close",
    admin_panel_add_admin: "➕ Add admin",
    admin_panel_remove_admin: "➖ Remove admin",
    admin_panel_choose_content: "What do you want to update?",
    admin_panel_choose_button: "Which button to change?",
    admin_panel_choose_section: "Choose a section:",
    admin_panel_add_section: "➕ Add section",
    admin_panel_delete_section: "🗑 Delete section",
    admin_panel_restore_section: "♻️ Restore section",
    admin_panel_enter_section_key:
      "Send section key (letters/numbers/_ only).",
    admin_panel_enter_user_id: "Send user ID or reply to a message.",
    admin_panel_enter_user_id_remove:
      "To remove, send user ID or reply to a message.",
    admin_panel_start: "Start message",
    admin_panel_no_sections: "No sections found.",
    buttons: {
      apply: "📝 Submit application",
      agency: "🏢 About the agency",
      internship: "🎓 About internship",
      contact: "📞 Contact",
      settings: "⚙️ Settings",
      language: "Choose language",
      back: "Back",
      admin_panel: "🛠 Admin panel",
      lang_uz: "🇺🇿 O‘zbek tili",
      lang_ru: "🇷🇺 Rus tili",
      lang_en: "🇬🇧 Ingliz tili",
      lang_kaa: "🇰🇿 Qoraqalpoq tili",
    },
  },

  kaa: {
    start:
      "Jaslar isleri agentliginde biz benen birge is baslawǵa tayyarmısız?",
    apply_text: "Ameliyat ushın arizalar qabıllaw tamamlandı.",
    agency_text:
      "Jaslar isleri agentligi — jaslardı qollap-quwatlaw, olardıń álewetin ashıw hám jámiyettegi belsendiligin arttırıwǵa qaratılǵan mámleketlik shólkem.\n\nAgentlik jaslar jumıssızlıǵı, bilim alıwı, startap hám bastamaların rawajlandırıw, sonday-aq social loyihalardı qollap-quwatlaw menen aynalısadı.\n\nBizde zamaniy basqarıw tizimi, ashıq muloqat muhiti hám hár bir ameliyatchiniń rawajlanıwına imkaniyat bar.",
    internship_text:
      "🔹 Dawamlıǵı: 3 ay\n🔹 Is ornı: Agentliktiń ortalıq yamasa aymaqlıq ofisi\n🔹 Waqtı: Oqıwdan bos waqıtta\n🔹 Ameliyatchilar haqıyqıy loyihalarda qatnasadı\n🔹 Hár birine mentor biriktiriledi\n🔹 Agentlik is-sharalarında qatnasıw múmkinligi bar\n🔹 Ayaǵında sertifikat hám usınıs xatı beriledi\n🔹 Eń belsendi qatnasıwshılar jumısın dawam ettiriwi múmkin\n\nTanlaw basqıshları:\n1. Ariza tapsırıw\n2. Saralaw\n3. Súhbet",
    contact_text:
      "Súraq yamasa qatelik bolsa, baylanısıń:\n@AbdugaffarovAbubakr",
    settings_text: "Sazlawlar:",
    choose_lang_text: "Tildi tańlań:",
    lang_set_text: "Til tańlandı.",
    unknown_text: "Buyruq túsiniksiz. Menyudan paydalanıń.",
    error_text: "Qatelik boldı. Keyinirek qayta urınıń.",
    admin_only: "Tek Admin yamasa Super Admin ushın.",
    super_admin_only: "Tek Super Admin ushın.",
    action_in_progress:
      "Aldıńǵı jarayan ayaqtalǵan joq. /cancel arqalı bekar qılıń.",
    action_cancelled: "Jarayan bekar qılındı.",
    broadcast_prompt: "Xabar mátinin jiberiń:",
    broadcast_done: "Broadcast ayaqtaldı. Jiberildi: {ok}, Qatelik: {fail}",
    stats_title: "Statistika:",
    stats_total: "Jami paydalanıwshılar: {count}",
    stats_active: "Aktiv paydalanıwshılar (30 kún): {count}",
    stats_lang: "Tiller boyınsha: {list}",
    stats_users_title: "Paydalanıwshılar tizimi:",
    stats_users_header:
      "ID | Atı | Username | Til | Rol | Aqırǵı aktivlik | Blok",
    add_admin_usage:
      "/add_admin user_id yamasa paydalanıwshı xabarına reply qılıń.",
    add_admin_done: "Admin tayınlandı: {id}",
    remove_admin_done: "Admin o‘shirildi: {id}",
    user_not_found: "Paydalanıwshı tabılmadı.",
    cannot_change_super: "Super Admin rolın ózgertiw múmkin emes.",
    update_usage:
      "Paydalanıw:\n/update_content start\n/update_content agency\n/update_content internship\n/update_content contact\n/update_content apply\n/update_content button <key>\n/update_content add_section <key>\n/update_content delete_section <key>\n/update_content restore_section <key>\nEslatma: ózgerisler ázirgi tilge qollanadı.",
    update_prompt_text: "Jańa mátindi jiberiń:",
    update_prompt_button: "Jańa túyme atın jiberiń:",
    update_prompt_section_label: "Bólim túyme atın jiberiń:",
    update_prompt_section_text: "Bólim mátinin jiberiń:",
    update_done: "Jańalandı.",
    section_added: "Bólim qósıldı: {key}",
    section_deleted: "Bólim óshirildi: {key}",
    section_hidden: "Bólim jasırıldı: {key}",
    section_restored: "Bólim tiklendi: {key}",
    section_not_found: "Bólim tabılmadı: {key}",
    invalid_section_key: "Bólim kiltí qáte. Tek hárip, san hám _ qollanıń.",
    button_key_invalid: "Túyme kiltí qáte.",
    admin_panel_title: "🛠 Admin panel",
    admin_panel_prompt: "Amaldı tańlań:",
    admin_panel_broadcast: "📣 Broadcast",
    admin_panel_stats: "📊 Statistika",
    admin_panel_admins: "👥 Adminlar",
    admin_panel_content: "📝 Kontent",
    admin_panel_sections: "🧩 Bólimler",
    admin_panel_buttons: "🔤 Túymeler",
    admin_panel_back: "◀️ Artqa",
    admin_panel_close: "✖️ Jabıw",
    admin_panel_add_admin: "➕ Admin qósıw",
    admin_panel_remove_admin: "➖ Admin óshiriw",
    admin_panel_choose_content: "Qaysı kontent ózgeredi?",
    admin_panel_choose_button: "Qaysı túyme ózgeredi?",
    admin_panel_choose_section: "Bólimdi tańlań:",
    admin_panel_add_section: "➕ Bólim qósıw",
    admin_panel_delete_section: "🗑 Bólim óshiriw",
    admin_panel_restore_section: "♻️ Bólim tiklew",
    admin_panel_enter_section_key:
      "Bólim kiltin jiberiń (hárip/san/_ gana).",
    admin_panel_enter_user_id:
      "Paydalanıwshı ID jiberiń yamasa xabarına reply qılıń.",
    admin_panel_enter_user_id_remove:
      "Óshiriw ushın user ID jiberiń yamasa xabarına reply qılıń.",
    admin_panel_start: "Start xabari",
    admin_panel_no_sections: "Bólimler tabılmadı.",
    buttons: {
      apply: "📝 Ariza tapsırıw",
      agency: "🏢 Agentlik haqqında",
      internship: "🎓 Ameliyat haqqında",
      contact: "📞 Baylanıs",
      settings: "⚙️ Sazlawlar",
      language: "Tildi saylaw",
      back: "Artqa",
      admin_panel: "🛠 Admin panel",
      lang_uz: "🇺🇿 O‘zbek tili",
      lang_ru: "🇷🇺 Rus tili",
      lang_en: "🇬🇧 Ingliz tili",
      lang_kaa: "🇰🇿 Qoraqalpoq tili",
    },
  },
};

const CONTENT_FIELDS = {
  start: "start",
  agency: "agency_text",
  internship: "internship_text",
  contact: "contact_text",
  apply: "apply_text",
};

const pendingActions = new Map();

let contentState = loadContent();
let i18n = mergeI18n(DEFAULT_I18N, contentState.i18n);

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(target, source) {
  if (!isPlainObject(source)) {
    return target;
  }
  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value)) {
      if (!isPlainObject(target[key])) {
        target[key] = {};
      }
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function mergeI18n(base, overrides) {
  const clone = JSON.parse(JSON.stringify(base));
  return deepMerge(clone, overrides || {});
}

function loadJsonFile(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw.trim()) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function loadContent() {
  const content = loadJsonFile(CONTENT_FILE, {
    i18n: {},
    custom_sections: {},
    hidden_sections: [],
  });
  if (!content || typeof content !== "object") {
    return { i18n: {}, custom_sections: {}, hidden_sections: [] };
  }
  if (!content.i18n || typeof content.i18n !== "object") {
    content.i18n = {};
  }
  if (!content.custom_sections || typeof content.custom_sections !== "object") {
    content.custom_sections = {};
  }
  if (!Array.isArray(content.hidden_sections)) {
    content.hidden_sections = [];
  }
  return content;
}

function saveContent() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(contentState, null, 2), "utf8");
}

function rebuildI18n() {
  i18n = mergeI18n(DEFAULT_I18N, contentState.i18n);
}

function loadUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return {};
    }
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    if (!raw.trim()) {
      return {};
    }
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      const mapped = {};
      for (const user of data) {
        if (user && user.user_id !== undefined) {
          mapped[String(user.user_id)] = user;
        }
      }
      return mapped;
    }
    if (data && typeof data === "object") {
      return data;
    }
    return {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function normalizeUserId(userId) {
  return String(userId);
}

function buildFullName(from) {
  const parts = [from.first_name, from.last_name].filter(Boolean);
  if (parts.length) {
    return parts.join(" ");
  }
  return from.username || "";
}

function upsertUser(ctx) {
  const users = loadUsers();
  const key = normalizeUserId(ctx.from.id);
  const existing = users[key] || {};
  const fullname = buildFullName(ctx.from);
  const username = ctx.from.username || existing.username || "";
  const language = existing.language || existing.lang || "uz";
  const role =
    existing.role || (SUPER_ADMINS.has(key) ? "super_admin" : "user");
  const user = {
    ...existing,
    user_id: Number(key),
    fullname: fullname || existing.fullname || "",
    username,
    language,
    role,
    last_active: new Date().toISOString(),
  };
  if (SUPER_ADMINS.has(key)) {
    user.role = "super_admin";
  }
  users[key] = user;
  saveUsers(users);
  return user;
}

function setLang(userId, lang) {
  const users = loadUsers();
  const key = normalizeUserId(userId);
  const existing = users[key] || {};
  const role =
    existing.role || (SUPER_ADMINS.has(key) ? "super_admin" : "user");
  const updated = {
    ...existing,
    user_id: Number(key),
    language: lang,
    role,
    last_active: new Date().toISOString(),
  };
  if (SUPER_ADMINS.has(key)) {
    updated.role = "super_admin";
  }
  users[key] = updated;
  saveUsers(users);
}

function setUserRole(userId, role) {
  const users = loadUsers();
  const key = normalizeUserId(userId);
  const existing = users[key] || {};
  const language = existing.language || existing.lang || "uz";
  const updated = {
    ...existing,
    user_id: Number(key),
    language,
    role,
  };
  if (SUPER_ADMINS.has(key)) {
    updated.role = "super_admin";
  }
  users[key] = updated;
  saveUsers(users);
  return updated;
}

function isSuperAdmin(user) {
  if (!user) {
    return false;
  }
  const key = normalizeUserId(user.user_id || user.id);
  return user.role === "super_admin" || SUPER_ADMINS.has(key);
}

function isAdmin(user) {
  if (!user) {
    return false;
  }
  return isSuperAdmin(user) || user.role === "admin";
}

function getUserLang(user) {
  const lang = user?.language || user?.lang;
  return i18n[lang] ? lang : "uz";
}

function getHiddenSections() {
  return new Set((contentState.hidden_sections || []).filter(Boolean));
}

function getLocalizedValue(obj, lang) {
  if (!obj || typeof obj !== "object") {
    return "";
  }
  return obj[lang] || obj.uz || obj.ru || obj.en || obj.kaa || "";
}

function mainMenu(lang, user) {
  const t = i18n[lang];
  const hidden = getHiddenSections();
  const rows = [];

  if (!hidden.has("apply")) {
    rows.push([t.buttons.apply]);
  }

  const row2 = [];
  if (!hidden.has("agency")) {
    row2.push(t.buttons.agency);
  }
  if (!hidden.has("internship")) {
    row2.push(t.buttons.internship);
  }
  if (row2.length) {
    rows.push(row2);
  }

  const row3 = [];
  if (!hidden.has("contact")) {
    row3.push(t.buttons.contact);
  }
  row3.push(t.buttons.settings);
  rows.push(row3);

  for (const [, section] of Object.entries(
    contentState.custom_sections || {},
  )) {
    if (!section || section.enabled === false) {
      continue;
    }
    const label = getLocalizedValue(section.buttons || {}, lang);
    if (label) {
      rows.push([label]);
    }
  }

  if (isSuperAdmin(user)) {
    rows.push([t.buttons.admin_panel]);
  }

  return Markup.keyboard(rows).resize();
}

function menuFor(ctx, lang) {
  return mainMenu(lang, ctx?.state?.user);
}

function settingsMenu(lang) {
  const t = i18n[lang];
  return Markup.keyboard([[t.buttons.language], [t.buttons.back]]).resize();
}

function languageMenu(lang) {
  const t = i18n[lang];
  return Markup.keyboard([
    [t.buttons.lang_uz],
    [t.buttons.lang_ru],
    [t.buttons.lang_en],
    [t.buttons.lang_kaa],
  ]).resize();
}

function adminPanelText(lang) {
  const t = i18n[lang];
  return `${t.admin_panel_title}\n${t.admin_panel_prompt}`;
}

function adminPanelKeyboard(lang) {
  const t = i18n[lang];
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(t.admin_panel_broadcast, "admin:broadcast"),
      Markup.button.callback(t.admin_panel_stats, "admin:stats"),
    ],
    [
      Markup.button.callback(t.admin_panel_admins, "admin:admins"),
      Markup.button.callback(t.admin_panel_content, "admin:content"),
    ],
    [
      Markup.button.callback(t.admin_panel_sections, "admin:sections"),
      Markup.button.callback(t.admin_panel_buttons, "admin:buttons"),
    ],
    [Markup.button.callback(t.admin_panel_close, "admin:close")],
  ]);
}

function adminAdminsKeyboard(lang) {
  const t = i18n[lang];
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(t.admin_panel_add_admin, "admin:admins:add"),
      Markup.button.callback(t.admin_panel_remove_admin, "admin:admins:remove"),
    ],
    [Markup.button.callback(t.admin_panel_back, "admin:main")],
  ]);
}

function adminContentKeyboard(lang) {
  const t = i18n[lang];
  return Markup.inlineKeyboard([
    [Markup.button.callback(t.admin_panel_start, "admin:content:start")],
    [Markup.button.callback(t.buttons.agency, "admin:content:agency")],
    [Markup.button.callback(t.buttons.internship, "admin:content:internship")],
    [Markup.button.callback(t.buttons.contact, "admin:content:contact")],
    [Markup.button.callback(t.buttons.apply, "admin:content:apply")],
    [Markup.button.callback(t.admin_panel_back, "admin:main")],
  ]);
}

function buttonLabel(lang, key) {
  const t = i18n[lang];
  const map = {
    apply: t.buttons.apply,
    agency: t.buttons.agency,
    internship: t.buttons.internship,
    contact: t.buttons.contact,
    settings: t.buttons.settings,
    language: t.buttons.language,
    back: t.buttons.back,
    lang_uz: t.buttons.lang_uz,
    lang_ru: t.buttons.lang_ru,
    lang_en: t.buttons.lang_en,
    lang_kaa: t.buttons.lang_kaa,
    admin_panel: t.buttons.admin_panel,
  };
  return map[key] || key;
}

function adminButtonsKeyboard(lang) {
  const t = i18n[lang];
  const rows = ALLOWED_BUTTON_KEYS.map((key) => [
    Markup.button.callback(`${buttonLabel(lang, key)} (${key})`, `admin:button:${key}`),
  ]);
  rows.push([Markup.button.callback(t.admin_panel_back, "admin:main")]);
  return Markup.inlineKeyboard(rows);
}

function sectionLabel(lang, key) {
  const t = i18n[lang];
  const baseMap = {
    agency: t.buttons.agency,
    internship: t.buttons.internship,
    contact: t.buttons.contact,
    apply: t.buttons.apply,
  };
  if (key === "start") {
    return t.admin_panel_start;
  }
  return baseMap[key] || key;
}

function adminSectionsKeyboard(lang) {
  const t = i18n[lang];
  return Markup.inlineKeyboard([
    [Markup.button.callback(t.admin_panel_add_section, "admin:sections:add")],
    [Markup.button.callback(t.admin_panel_delete_section, "admin:sections:delete")],
    [Markup.button.callback(t.admin_panel_restore_section, "admin:sections:restore")],
    [Markup.button.callback(t.admin_panel_back, "admin:main")],
  ]);
}

function getSectionKeysForAction(action) {
  const custom = Object.keys(contentState.custom_sections || {});
  if (action === "restore") {
    const hidden = getHiddenSections();
    const keys = BASE_SECTIONS.filter((key) => hidden.has(key));
    for (const key of custom) {
      if (contentState.custom_sections[key]?.enabled === false) {
        keys.push(key);
      }
    }
    return keys;
  }
  return [...BASE_SECTIONS, ...custom];
}

function adminSectionListKeyboard(lang, action) {
  const t = i18n[lang];
  const keys = getSectionKeysForAction(action);
  if (!keys.length) {
    return {
      text: t.admin_panel_no_sections,
      keyboard: Markup.inlineKeyboard([
        [Markup.button.callback(t.admin_panel_back, "admin:sections")],
      ]),
    };
  }
  const rows = keys.map((key) => [
    Markup.button.callback(sectionLabel(lang, key), `admin:sections:${action}:${key}`),
  ]);
  rows.push([Markup.button.callback(t.admin_panel_back, "admin:sections")]);
  return { text: t.admin_panel_choose_section, keyboard: Markup.inlineKeyboard(rows) };
}

function buildStatsMessage(lang) {
  const t = i18n[lang];
  const users = loadUsers();
  const entries = Object.values(users);
  const total = entries.length;
  const cutoff = Date.now() - ACTIVE_DAYS * 24 * 60 * 60 * 1000;
  const active = entries.filter((item) => {
    const last = Date.parse(item.last_active || 0);
    return Number.isFinite(last) && last >= cutoff;
  }).length;

  const counts = { uz: 0, ru: 0, en: 0, kaa: 0, other: 0 };
  for (const item of entries) {
    const code = item.language || item.lang || "uz";
    if (counts[code] !== undefined) {
      counts[code] += 1;
    } else {
      counts.other += 1;
    }
  }

  const labelMap = {
    uz: t.buttons.lang_uz,
    ru: t.buttons.lang_ru,
    en: t.buttons.lang_en,
    kaa: t.buttons.lang_kaa,
  };

  const listParts = LANG_CODES.map(
    (code) => `${labelMap[code] || code}: ${formatNumber(counts[code])}`,
  );
  if (counts.other) {
    listParts.push(`other: ${formatNumber(counts.other)}`);
  }

  return [
    t.stats_title,
    formatText(t.stats_total, { count: formatNumber(total) }),
    formatText(t.stats_active, { count: formatNumber(active) }),
    formatText(t.stats_lang, { list: listParts.join(", ") }),
  ].join("\n");
}

function buildUsersReport(lang) {
  const t = i18n[lang];
  const users = loadUsers();
  const entries = Object.values(users);
  const sorted = entries.sort((a, b) => {
    const aTime = Date.parse(a.last_active || 0) || 0;
    const bTime = Date.parse(b.last_active || 0) || 0;
    return bTime - aTime;
  });
  const lines = [t.stats_users_title, t.stats_users_header];
  for (const item of sorted) {
    const id = item.user_id ?? "";
    const name = item.fullname || "";
    const usernameRaw = item.username || "";
    const username =
      usernameRaw && !String(usernameRaw).startsWith("@")
        ? `@${usernameRaw}`
        : usernameRaw;
    const language = item.language || item.lang || "";
    const role = item.role || "user";
    const lastActive = item.last_active || "";
    const blocked = item.blocked ? "yes" : "no";
    lines.push(
      [id, name, username, language, role, lastActive, blocked].join(" | "),
    );
  }
  return lines.join("\n");
}

async function sendStats(ctx, lang, keyboard) {
  const summary = buildStatsMessage(lang);
  const report = buildUsersReport(lang);
  const combined = `${summary}\n\n${report}`;

  if (combined.length <= MAX_STATS_MESSAGE) {
    if (ctx.updateType === "callback_query") {
      return editOrReply(ctx, combined, keyboard);
    }
    return ctx.reply(combined, keyboard);
  }

  if (ctx.updateType === "callback_query") {
    await editOrReply(ctx, summary, keyboard);
  } else {
    await ctx.reply(summary, keyboard);
  }

  const buffer = Buffer.from(report, "utf8");
  return ctx.replyWithDocument({
    source: buffer,
    filename: "users.txt",
  });
}

async function editOrReply(ctx, text, keyboard) {
  if (ctx.updateType === "callback_query") {
    try {
      return await ctx.editMessageText(text, keyboard);
    } catch {
      // fall back to reply
    }
  }
  return ctx.reply(text, keyboard);
}

function sendStart(ctx, lang) {
  return ctx.reply(i18n[lang].start, menuFor(ctx, lang));
}

function sendAdminPanel(ctx, lang) {
  return ctx.reply(adminPanelText(lang), adminPanelKeyboard(lang));
}

function formatText(template, params = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(params, key)
      ? params[key]
      : match;
  });
}

function formatNumber(value) {
  const number = Number(value) || 0;
  return number.toLocaleString("en-US");
}

function formatLogTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${day}.${month}.${year} | ${hours}:${minutes}`;
}

function logAction(adminId, action, details = []) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const lines = [
      `[${formatLogTimestamp()}]`,
      `Admin: ${adminId}`,
      `Action: ${action}`,
    ];
    for (const line of details) {
      lines.push(line);
    }
    fs.appendFileSync(LOG_FILE, `${lines.join("\n")}\n\n`, "utf8");
  } catch {
    // ignore logging errors
  }
}

function parseArgs(text = "") {
  return text.trim().split(/\s+/).slice(1);
}

function extractTargetUserId(ctx, args) {
  if (args && args.length > 0 && /^\d+$/.test(args[0])) {
    return args[0];
  }
  const reply = ctx.message?.reply_to_message;
  if (reply?.forward_from?.id) {
    return String(reply.forward_from.id);
  }
  if (reply?.from?.id) {
    return String(reply.from.id);
  }
  return null;
}

function extractUserIdFromMessage(ctx) {
  const text = ctx.message?.text?.trim();
  if (text && /^\d+$/.test(text)) {
    return text;
  }
  const reply = ctx.message?.reply_to_message;
  if (reply?.forward_from?.id) {
    return String(reply.forward_from.id);
  }
  if (reply?.from?.id) {
    return String(reply.from.id);
  }
  return null;
}

function isBlockedError(err) {
  const code = err?.response?.error_code || err?.code;
  const desc = err?.response?.description || err?.description || "";
  return (
    code === 403 ||
    /blocked by the user/i.test(desc) ||
    /bot was blocked/i.test(desc)
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getLangButtonLabels() {
  const map = {};
  for (const code of LANG_CODES) {
    map[code] = [];
    for (const lang of Object.keys(i18n)) {
      const label = i18n[lang]?.buttons?.[`lang_${code}`];
      if (label && !map[code].includes(label)) {
        map[code].push(label);
      }
    }
  }
  return map;
}

function langFromButton(text) {
  const map = getLangButtonLabels();
  for (const [code, labels] of Object.entries(map)) {
    if (labels.includes(text)) {
      return code;
    }
  }
  return null;
}

function matchesButton(text, key) {
  return Object.values(i18n).some(
    (langData) => langData?.buttons?.[key] === text,
  );
}

function findCustomSectionByLabel(text) {
  const sections = contentState.custom_sections || {};
  for (const [, section] of Object.entries(sections)) {
    if (!section || section.enabled === false) {
      continue;
    }
    const labels = section.buttons || {};
    if (Object.values(labels).includes(text)) {
      return { section };
    }
  }
  return null;
}

function isValidSectionKey(key) {
  return /^[a-zA-Z0-9_]+$/.test(key);
}

bot.use((ctx, next) => {
  if (ctx.from) {
    ctx.state.user = upsertUser(ctx);
  }
  return next();
});

bot.start((ctx) => {
  const lang = getUserLang(ctx.state.user);
  return sendStart(ctx, lang);
});

bot.command("cancel", (ctx) => {
  const lang = getUserLang(ctx.state.user);
  const userId = normalizeUserId(ctx.from.id);
  if (pendingActions.has(userId)) {
    pendingActions.delete(userId);
    return ctx.reply(i18n[lang].action_cancelled, menuFor(ctx, lang));
  }
  return ctx.reply(i18n[lang].unknown_text, menuFor(ctx, lang));
});

bot.command("add_admin", (ctx) => {
  const user = ctx.state.user;
  const lang = getUserLang(user);
  const t = i18n[lang];
  if (!isSuperAdmin(user)) {
    return ctx.reply(t.super_admin_only, menuFor(ctx, lang));
  }
  const args = parseArgs(ctx.message.text);
  const targetId = extractTargetUserId(ctx, args);
  if (!targetId) {
    return ctx.reply(t.add_admin_usage, menuFor(ctx, lang));
  }
  const users = loadUsers();
  const isSuper =
    SUPER_ADMINS.has(targetId) || users[targetId]?.role === "super_admin";
  if (isSuper) {
    return ctx.reply(t.cannot_change_super, menuFor(ctx, lang));
  }
  setUserRole(targetId, "admin");
  logAction(user.user_id, "AddAdmin", [`Target: ${targetId}`]);
  return ctx.reply(
    formatText(t.add_admin_done, { id: targetId }),
    menuFor(ctx, lang),
  );
});

bot.command("remove_admin", (ctx) => {
  const user = ctx.state.user;
  const lang = getUserLang(user);
  const t = i18n[lang];
  if (!isSuperAdmin(user)) {
    return ctx.reply(t.super_admin_only, menuFor(ctx, lang));
  }
  const args = parseArgs(ctx.message.text);
  const targetId = extractTargetUserId(ctx, args);
  if (!targetId) {
    return ctx.reply(t.add_admin_usage, menuFor(ctx, lang));
  }
  const users = loadUsers();
  const isSuper =
    SUPER_ADMINS.has(targetId) || users[targetId]?.role === "super_admin";
  if (isSuper) {
    return ctx.reply(t.cannot_change_super, menuFor(ctx, lang));
  }
  setUserRole(targetId, "user");
  logAction(user.user_id, "RemoveAdmin", [`Target: ${targetId}`]);
  return ctx.reply(
    formatText(t.remove_admin_done, { id: targetId }),
    menuFor(ctx, lang),
  );
});

bot.command("broadcast", (ctx) => {
  const user = ctx.state.user;
  const lang = getUserLang(user);
  const t = i18n[lang];
  if (!isAdmin(user)) {
    return ctx.reply(t.admin_only, menuFor(ctx, lang));
  }
  const userId = normalizeUserId(ctx.from.id);
  if (pendingActions.has(userId)) {
    return ctx.reply(t.action_in_progress, menuFor(ctx, lang));
  }
  pendingActions.set(userId, { type: "broadcast" });
  return ctx.reply(t.broadcast_prompt);
});

bot.command("admin", (ctx) => {
  const user = ctx.state.user;
  const lang = getUserLang(user);
  const t = i18n[lang];
  if (!isSuperAdmin(user)) {
    return ctx.reply(t.super_admin_only, menuFor(ctx, lang));
  }
  return sendAdminPanel(ctx, lang);
});

bot.command("stats", (ctx) => {
  const user = ctx.state.user;
  const lang = getUserLang(user);
  const t = i18n[lang];
  if (!isSuperAdmin(user)) {
    return ctx.reply(t.super_admin_only, menuFor(ctx, lang));
  }
  return sendStats(ctx, lang, menuFor(ctx, lang));
});

bot.command("update_content", (ctx) => {
  const user = ctx.state.user;
  const lang = getUserLang(user);
  const t = i18n[lang];
  if (!isSuperAdmin(user)) {
    return ctx.reply(t.super_admin_only, menuFor(ctx, lang));
  }
  const userId = normalizeUserId(ctx.from.id);
  if (pendingActions.has(userId)) {
    return ctx.reply(t.action_in_progress, menuFor(ctx, lang));
  }

  const args = parseArgs(ctx.message.text);
  if (!args.length) {
    return ctx.reply(t.update_usage, menuFor(ctx, lang));
  }

  const subcommand = args[0];

  if (CONTENT_FIELDS[subcommand]) {
    pendingActions.set(userId, {
      type: "update",
      mode: "text",
      field: CONTENT_FIELDS[subcommand],
      lang,
    });
    return ctx.reply(t.update_prompt_text);
  }

  if (subcommand === "button") {
    const key = args[1];
    if (!key || !ALLOWED_BUTTON_KEYS.includes(key)) {
      return ctx.reply(t.button_key_invalid, menuFor(ctx, lang));
    }
    pendingActions.set(userId, {
      type: "update",
      mode: "button",
      buttonKey: key,
      lang,
    });
    return ctx.reply(t.update_prompt_button);
  }

  if (subcommand === "add_section") {
    const key = args[1];
    if (!key || !isValidSectionKey(key)) {
      return ctx.reply(t.invalid_section_key, menuFor(ctx, lang));
    }
    pendingActions.set(userId, {
      type: "update",
      mode: "add_section",
      step: "label",
      sectionKey: key,
      lang,
    });
    return ctx.reply(t.update_prompt_section_label);
  }

  if (subcommand === "delete_section") {
    const key = args[1];
    if (!key) {
      return ctx.reply(t.update_usage, menuFor(ctx, lang));
    }
    if (contentState.custom_sections && contentState.custom_sections[key]) {
      delete contentState.custom_sections[key];
      saveContent();
      rebuildI18n();
      logAction(user.user_id, "DeleteSection", [`Section: ${key}`]);
      return ctx.reply(formatText(t.section_deleted, { key }), menuFor(ctx, lang));
    }
    if (BASE_SECTIONS.includes(key)) {
      const hidden = new Set(contentState.hidden_sections || []);
      hidden.add(key);
      contentState.hidden_sections = Array.from(hidden);
      saveContent();
      rebuildI18n();
      logAction(user.user_id, "HideSection", [`Section: ${key}`]);
      return ctx.reply(formatText(t.section_hidden, { key }), menuFor(ctx, lang));
    }
    return ctx.reply(formatText(t.section_not_found, { key }), menuFor(ctx, lang));
  }

  if (subcommand === "restore_section") {
    const key = args[1];
    if (!key) {
      return ctx.reply(t.update_usage, menuFor(ctx, lang));
    }
    let restored = false;
    if (contentState.custom_sections && contentState.custom_sections[key]) {
      contentState.custom_sections[key].enabled = true;
      restored = true;
    }
    if (BASE_SECTIONS.includes(key)) {
      contentState.hidden_sections = (
        contentState.hidden_sections || []
      ).filter((item) => item !== key);
      restored = true;
    }
    if (!restored) {
      return ctx.reply(
        formatText(t.section_not_found, { key }),
        menuFor(ctx, lang),
      );
    }
    saveContent();
    rebuildI18n();
    logAction(user.user_id, "RestoreSection", [`Section: ${key}`]);
    return ctx.reply(formatText(t.section_restored, { key }), menuFor(ctx, lang));
  }

  return ctx.reply(t.update_usage, menuFor(ctx, lang));
});

bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery?.data || "";
  if (!data.startsWith("admin:")) {
    return;
  }
  const user = ctx.state.user;
  const lang = getUserLang(user);
  const t = i18n[lang];
  if (!isSuperAdmin(user)) {
    await ctx.answerCbQuery(t.super_admin_only, { show_alert: true });
    return;
  }

  await ctx.answerCbQuery();

  const parts = data.split(":");
  const action = parts[1];
  const userId = normalizeUserId(ctx.from.id);

  if (action === "close") {
    try {
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    } catch {
      // ignore
    }
    return;
  }

  if (action === "main") {
    return editOrReply(ctx, adminPanelText(lang), adminPanelKeyboard(lang));
  }

  if (action === "stats") {
    const backKeyboard = Markup.inlineKeyboard([
      [Markup.button.callback(t.admin_panel_back, "admin:main")],
    ]);
    return sendStats(ctx, lang, backKeyboard);
  }

  if (action === "broadcast") {
    if (pendingActions.has(userId)) {
      return ctx.reply(t.action_in_progress, menuFor(ctx, lang));
    }
    pendingActions.set(userId, { type: "broadcast" });
    return ctx.reply(t.broadcast_prompt);
  }

  if (action === "admins") {
    const sub = parts[2];
    if (!sub) {
      return editOrReply(
        ctx,
        t.admin_panel_prompt,
        adminAdminsKeyboard(lang),
      );
    }
    if (pendingActions.has(userId)) {
      return ctx.reply(t.action_in_progress, menuFor(ctx, lang));
    }
    if (sub === "add") {
      pendingActions.set(userId, { type: "admin_add" });
      return ctx.reply(t.admin_panel_enter_user_id);
    }
    if (sub === "remove") {
      pendingActions.set(userId, { type: "admin_remove" });
      return ctx.reply(t.admin_panel_enter_user_id_remove);
    }
  }

  if (action === "content") {
    const fieldKey = parts[2];
    if (!fieldKey) {
      return editOrReply(
        ctx,
        t.admin_panel_choose_content,
        adminContentKeyboard(lang),
      );
    }
    if (!CONTENT_FIELDS[fieldKey]) {
      return editOrReply(
        ctx,
        t.admin_panel_choose_content,
        adminContentKeyboard(lang),
      );
    }
    if (pendingActions.has(userId)) {
      return ctx.reply(t.action_in_progress, menuFor(ctx, lang));
    }
    pendingActions.set(userId, {
      type: "update",
      mode: "text",
      field: CONTENT_FIELDS[fieldKey],
      lang,
    });
    return ctx.reply(t.update_prompt_text);
  }

  if (action === "buttons") {
    return editOrReply(ctx, t.admin_panel_choose_button, adminButtonsKeyboard(lang));
  }

  if (action === "button") {
    const key = parts[2];
    if (!key || !ALLOWED_BUTTON_KEYS.includes(key)) {
      return ctx.reply(t.button_key_invalid, menuFor(ctx, lang));
    }
    if (pendingActions.has(userId)) {
      return ctx.reply(t.action_in_progress, menuFor(ctx, lang));
    }
    pendingActions.set(userId, {
      type: "update",
      mode: "button",
      buttonKey: key,
      lang,
    });
    return ctx.reply(t.update_prompt_button);
  }

  if (action === "sections") {
    const sub = parts[2];
    if (!sub) {
      return editOrReply(ctx, t.admin_panel_prompt, adminSectionsKeyboard(lang));
    }
    if (sub === "add") {
      if (pendingActions.has(userId)) {
        return ctx.reply(t.action_in_progress, menuFor(ctx, lang));
      }
      pendingActions.set(userId, {
        type: "update",
        mode: "add_section",
        step: "key",
        lang,
      });
      return ctx.reply(t.admin_panel_enter_section_key);
    }
    if (sub === "delete") {
      const key = parts[3];
      if (!key) {
        const view = adminSectionListKeyboard(lang, "delete");
        return editOrReply(ctx, view.text, view.keyboard);
      }
      if (contentState.custom_sections && contentState.custom_sections[key]) {
        delete contentState.custom_sections[key];
        saveContent();
        rebuildI18n();
        logAction(user.user_id, "DeleteSection", [`Section: ${key}`]);
        const view = adminSectionListKeyboard(lang, "delete");
        return editOrReply(ctx, formatText(t.section_deleted, { key }), view.keyboard);
      }
      if (BASE_SECTIONS.includes(key)) {
        const hidden = new Set(contentState.hidden_sections || []);
        hidden.add(key);
        contentState.hidden_sections = Array.from(hidden);
        saveContent();
        rebuildI18n();
        logAction(user.user_id, "HideSection", [`Section: ${key}`]);
        const view = adminSectionListKeyboard(lang, "delete");
        return editOrReply(ctx, formatText(t.section_hidden, { key }), view.keyboard);
      }
      return ctx.reply(formatText(t.section_not_found, { key }), menuFor(ctx, lang));
    }
    if (sub === "restore") {
      const key = parts[3];
      if (!key) {
        const view = adminSectionListKeyboard(lang, "restore");
        return editOrReply(ctx, view.text, view.keyboard);
      }
      let restored = false;
      if (contentState.custom_sections && contentState.custom_sections[key]) {
        contentState.custom_sections[key].enabled = true;
        restored = true;
      }
      if (BASE_SECTIONS.includes(key)) {
        contentState.hidden_sections = (contentState.hidden_sections || []).filter(
          (item) => item !== key,
        );
        restored = true;
      }
      if (!restored) {
        return ctx.reply(formatText(t.section_not_found, { key }), menuFor(ctx, lang));
      }
      saveContent();
      rebuildI18n();
      logAction(user.user_id, "RestoreSection", [`Section: ${key}`]);
      const view = adminSectionListKeyboard(lang, "restore");
      return editOrReply(ctx, formatText(t.section_restored, { key }), view.keyboard);
    }
  }
});

bot.on("message", async (ctx, next) => {
  const user = ctx.state.user;
  if (!user) {
    return next();
  }
  const userId = normalizeUserId(ctx.from.id);
  const pending = pendingActions.get(userId);
  if (!pending) {
    return next();
  }

  const lang = getUserLang(user);
  const t = i18n[lang];

  if (pending.type === "admin_add" || pending.type === "admin_remove") {
    const targetId = extractUserIdFromMessage(ctx);
    if (!targetId) {
      const prompt =
        pending.type === "admin_add"
          ? t.admin_panel_enter_user_id
          : t.admin_panel_enter_user_id_remove;
      return ctx.reply(prompt);
    }
    const users = loadUsers();
    const isSuper =
      SUPER_ADMINS.has(targetId) || users[targetId]?.role === "super_admin";
    if (isSuper) {
      pendingActions.delete(userId);
      return ctx.reply(t.cannot_change_super, menuFor(ctx, lang));
    }
    if (pending.type === "admin_add") {
      setUserRole(targetId, "admin");
      logAction(user.user_id, "AddAdmin", [`Target: ${targetId}`]);
      pendingActions.delete(userId);
      return ctx.reply(
        formatText(t.add_admin_done, { id: targetId }),
        menuFor(ctx, lang),
      );
    }
    setUserRole(targetId, "user");
    logAction(user.user_id, "RemoveAdmin", [`Target: ${targetId}`]);
    pendingActions.delete(userId);
    return ctx.reply(
      formatText(t.remove_admin_done, { id: targetId }),
      menuFor(ctx, lang),
    );
  }

  if (pending.type === "broadcast") {
    if (ctx.message?.text && ctx.message.text.startsWith("/")) {
      return ctx.reply(t.action_in_progress, menuFor(ctx, lang));
    }

    pendingActions.delete(userId);
    const users = loadUsers();
    const entries = Object.entries(users);
    let sent = 0;
    let failed = 0;
    let blockedChanged = false;

    for (const [id, record] of entries) {
      if (record?.blocked) {
        continue;
      }
      try {
        await ctx.telegram.copyMessage(id, ctx.chat.id, ctx.message.message_id);
        sent += 1;
      } catch (err) {
        failed += 1;
        if (isBlockedError(err)) {
          users[id] = { ...(record || {}), blocked: true };
          blockedChanged = true;
        }
      }
      await delay(BROADCAST_DELAY_MS);
    }

    if (blockedChanged) {
      saveUsers(users);
    }

    logAction(user.user_id, "Broadcast", [
      `Users: ${formatNumber(sent + failed)}`,
    ]);
    return ctx.reply(
      formatText(t.broadcast_done, {
        ok: formatNumber(sent),
        fail: formatNumber(failed),
      }),
      menuFor(ctx, lang),
    );
  }

  if (pending.type === "update") {
    if (pending.mode === "add_section" && pending.step === "key") {
      if (!ctx.message?.text || ctx.message.text.startsWith("/")) {
        return ctx.reply(t.admin_panel_enter_section_key);
      }
      const key = ctx.message.text.trim();
      if (!isValidSectionKey(key)) {
        return ctx.reply(t.invalid_section_key);
      }
      pending.sectionKey = key;
      pending.step = "label";
      pendingActions.set(userId, pending);
      return ctx.reply(t.update_prompt_section_label);
    }
    if (!ctx.message?.text || ctx.message.text.startsWith("/")) {
      return ctx.reply(t.update_prompt_text);
    }

    if (pending.mode === "text") {
      const langKey = pending.lang || lang;
      contentState.i18n = contentState.i18n || {};
      contentState.i18n[langKey] = contentState.i18n[langKey] || {};
      contentState.i18n[langKey][pending.field] = ctx.message.text;
      saveContent();
      rebuildI18n();
      pendingActions.delete(userId);
      logAction(user.user_id, "UpdateContent", [
        `Field: ${pending.field}`,
        `Lang: ${langKey}`,
      ]);
      return ctx.reply(t.update_done, menuFor(ctx, lang));
    }

    if (pending.mode === "button") {
      const langKey = pending.lang || lang;
      contentState.i18n = contentState.i18n || {};
      contentState.i18n[langKey] = contentState.i18n[langKey] || {};
      contentState.i18n[langKey].buttons =
        contentState.i18n[langKey].buttons || {};
      contentState.i18n[langKey].buttons[pending.buttonKey] = ctx.message.text;
      saveContent();
      rebuildI18n();
      pendingActions.delete(userId);
      logAction(user.user_id, "UpdateButton", [
        `Button: ${pending.buttonKey}`,
        `Lang: ${langKey}`,
      ]);
      return ctx.reply(t.update_done, menuFor(ctx, lang));
    }

    if (pending.mode === "add_section") {
      if (pending.step === "label") {
        pending.label = ctx.message.text;
        pending.step = "text";
        pendingActions.set(userId, pending);
        return ctx.reply(t.update_prompt_section_text);
      }

      const langKey = pending.lang || lang;
      const sectionKey = pending.sectionKey;
      contentState.custom_sections = contentState.custom_sections || {};
      const section = contentState.custom_sections[sectionKey] || {
        buttons: {},
        text: {},
      };
      section.buttons = section.buttons || {};
      section.text = section.text || {};
      section.enabled = true;
      section.buttons[langKey] = pending.label || "";
      section.text[langKey] = ctx.message.text;
      contentState.custom_sections[sectionKey] = section;
      saveContent();
      rebuildI18n();
      pendingActions.delete(userId);
      logAction(user.user_id, "AddSection", [
        `Section: ${sectionKey}`,
        `Lang: ${langKey}`,
      ]);
      return ctx.reply(
        formatText(t.section_added, { key: sectionKey }),
        menuFor(ctx, lang),
      );
    }
  }

  return next();
});

bot.on("text", (ctx) => {
  const user = ctx.state.user;
  const lang = getUserLang(user);
  const t = i18n[lang];
  const text = ctx.message.text;
  const hidden = getHiddenSections();
  if (text.startsWith("/")) {
    return;
  }

  const selected = langFromButton(text);
  if (selected) {
    setLang(ctx.from.id, selected);
    return ctx.reply(i18n[selected].lang_set_text, menuFor(ctx, selected));
  }

  if (!hidden.has("apply") && matchesButton(text, "apply")) {
    return ctx.reply(t.apply_text, menuFor(ctx, lang));
  }

  if (!hidden.has("agency") && matchesButton(text, "agency")) {
    return ctx.reply(t.agency_text, menuFor(ctx, lang));
  }

  if (!hidden.has("internship") && matchesButton(text, "internship")) {
    return ctx.reply(t.internship_text, menuFor(ctx, lang));
  }

  if (!hidden.has("contact") && matchesButton(text, "contact")) {
    return ctx.reply(t.contact_text, menuFor(ctx, lang));
  }

  if (matchesButton(text, "settings")) {
    return ctx.reply(t.settings_text, settingsMenu(lang));
  }

  if (matchesButton(text, "language")) {
    return ctx.reply(t.choose_lang_text, languageMenu(lang));
  }

  if (matchesButton(text, "admin_panel")) {
    if (!isSuperAdmin(user)) {
      return ctx.reply(t.super_admin_only, menuFor(ctx, lang));
    }
    return sendAdminPanel(ctx, lang);
  }

  if (matchesButton(text, "back")) {
    return sendStart(ctx, lang);
  }

  const customSection = findCustomSectionByLabel(text);
  if (customSection) {
    const content = getLocalizedValue(customSection.section.text || {}, lang);
    if (content) {
      return ctx.reply(content, menuFor(ctx, lang));
    }
  }

  return ctx.reply(t.unknown_text, menuFor(ctx, lang));
});

bot.catch((err, ctx) => {
  console.error("Bot error:", err);
  try {
    const lang = ctx?.state?.user ? getUserLang(ctx.state.user) : "uz";
    if (ctx?.reply) {
      ctx.reply(i18n[lang].error_text, menuFor(ctx, lang));
    }
  } catch {
    // ignore secondary errors
  }
});

bot.launch();
console.log("Bot is running...");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
