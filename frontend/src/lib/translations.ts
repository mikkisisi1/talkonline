export type Language = 'ru' | 'en' | 'uk' | 'kk' | 'uz' | 'be' | 'fr' | 'de' | 'id' | 'pt' | 'es';

export const languageNames: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
  uk: 'Українська',
  kk: 'Қазақша',
  uz: "O'zbek",
  be: 'Беларуская',
  fr: 'Français',
  de: 'Deutsch',
  id: 'Indonesia',
  pt: 'Português',
  es: 'Español',
};

export const languageFlags: Record<Language, string> = {
  en: '🇬🇧',
  ru: '🇷🇺',
  uk: '🇺🇦',
  kk: '🇰🇿',
  uz: '🇺🇿',
  be: '🇧🇾',
  fr: '🇫🇷',
  de: '🇩🇪',
  id: '🇮🇩',
  pt: '🇧🇷',
  es: '🇲🇽',
};

// Dynamic welcome message generator (displayed in chat bubble)
export const getWelcomeMessage = (language: Language, agentName: string): string => {
  // Check if it's a default agent (Lucas/Sofia) or an idol
  const isDefaultAgent = agentName === 'Лукас' || agentName === 'София' || agentName === 'Lucas' || agentName === 'Sofia';
  
  const messages: Record<Language, { default: string; idol: string }> = {
    ru: {
      default: `Привет! 😊 Я ${agentName}, твой компаньон, друг или партнёр. ❤️ Нажми + для перехода в настройки или на знак Сатурна для общения с твоими кумирами. Или можем сразу продолжить здесь. Видишь, внизу маленькая кнопка с микрофоном. Просто нажми и отпусти её и начни говорить. Сообщение само отправится мне ✨`,
      idol: `Я ${agentName}, хочешь что-нибудь обсудить? Говори, я весь во внимании.`
    },
    en: {
      default: `Hi! 😊 I'm ${agentName}, your companion, friend or partner. ❤️ Tap + to open settings or the Saturn icon to chat with your idols. Or we can just continue here. See the microphone button below? Just tap and release it and start talking ✨`,
      idol: `I'm ${agentName}, want to discuss something? Go ahead, I'm all ears.`
    },
    uk: {
      default: `Привіт! 😊 Я ${agentName}, твій компаньйон, друг або партнер. ❤️ Натисни + для налаштувань або знак Сатурна для спілкування з кумирами ✨`,
      idol: `Я ${agentName}, хочеш щось обговорити? Кажи, я весь у увазі.`
    },
    kk: {
      default: `Сәлем! 😊 Мен ${agentName}, сенің компаньонің, досың немесе серіктесің. ❤️ Параметрлер үшін + басыңыз ✨`,
      idol: `Мен ${agentName}, бір нәрсені талқылағың келе ме?`
    },
    uz: {
      default: `Salom! 😊 Men ${agentName}, sening hamrohingman, do'sting yoki sherigingman. ❤️ Sozlamalar uchun + bosing ✨`,
      idol: `Men ${agentName}, biror narsa muhokama qilmoqchimisiz?`
    },
    be: {
      default: `Прывітанне! 😊 Я ${agentName}, твой кампаньён, сябар ці партнёр. ❤️ Націсні + для наладак ✨`,
      idol: `Я ${agentName}, хочаш нешта абмеркаваць?`
    },
    fr: {
      default: `Salut ! 😊 Je suis ${agentName}, ton compagnon, ami ou partenaire. ❤️ Appuie sur + pour les paramètres ✨`,
      idol: `Je suis ${agentName}, tu veux discuter de quelque chose ?`
    },
    de: {
      default: `Hi! 😊 Ich bin ${agentName}, dein Begleiter, Freund oder Partner. ❤️ Tippe auf + für Einstellungen ✨`,
      idol: `Ich bin ${agentName}, möchtest du etwas besprechen?`
    },
    id: {
      default: `Hai! 😊 Aku ${agentName}, temanmu, sahabat atau pasanganmu. ❤️ Ketuk + untuk pengaturan ✨`,
      idol: `Aku ${agentName}, mau diskusi sesuatu?`
    },
    pt: {
      default: `Oi! 😊 Eu sou ${agentName}, seu companheiro, amigo ou parceiro. ❤️ Toque em + para configurações ✨`,
      idol: `Eu sou ${agentName}, quer conversar sobre algo?`
    },
    es: {
      default: `¡Hola! 😊 Soy ${agentName}, tu compañero, amigo o pareja. ❤️ Toca + para ajustes ✨`,
      idol: `Soy ${agentName}, ¿quieres hablar de algo?`
    }
  };
  
  const langMessages = messages[language] || messages['en'];
  return isDefaultAgent ? langMessages.default : langMessages.idol;
};

// TTS-optimized welcome text — clean of emoji, with punctuation for natural rhythm
export const getWelcomeSpeechText = (language: Language, agentName: string): string => {
  const isDefaultAgent = agentName === 'Лукас' || agentName === 'София' || agentName === 'Lucas' || agentName === 'Sofia';
  
  const messages: Record<Language, { default: string; idol: string }> = {
    ru: {
      default: `Привет! Я ${agentName}, твой компаньон, друг или партнёр. Нажми плюс для настроек или Сатурн для кумиров. Или продолжим здесь. Внизу кнопка микрофона, нажми и говори.`,
      idol: `Я ${agentName}, хочешь что-нибудь обсудить?`
    },
    en: {
      default: `Hi! I'm ${agentName}, your companion, friend or partner. Tap plus for settings or Saturn for idols. Or let's continue here. See the mic button below? Tap and talk.`,
      idol: `I'm ${agentName}, want to discuss something?`
    },
    uk: {
      default: `Привіт! Я ${agentName}, твій компаньйон. Натисни плюс для налаштувань.`,
      idol: `Я ${agentName}, хочеш щось обговорити?`
    },
    kk: {
      default: `Сәлем! Мен ${agentName}, сенің компаньонің. Параметрлер үшін плюс басыңыз.`,
      idol: `Мен ${agentName}, бір нәрсені талқылағың келе ме?`
    },
    uz: {
      default: `Salom! Men ${agentName}, sening hamrohingman. Sozlamalar uchun plyusni bosing.`,
      idol: `Men ${agentName}, biror narsa muhokama qilmoqchimisiz?`
    },
    be: {
      default: `Прывітанне! Я ${agentName}, твой кампаньён. Націсні плюс для наладак.`,
      idol: `Я ${agentName}, хочаш нешта абмеркаваць?`
    },
    fr: {
      default: `Salut! Je suis ${agentName}, ton compagnon. Appuie sur plus pour les paramètres.`,
      idol: `Je suis ${agentName}, tu veux discuter?`
    },
    de: {
      default: `Hi! Ich bin ${agentName}, dein Begleiter. Tippe auf plus für Einstellungen.`,
      idol: `Ich bin ${agentName}, möchtest du etwas besprechen?`
    },
    id: {
      default: `Hai! Aku ${agentName}, temanmu. Ketuk plus untuk pengaturan.`,
      idol: `Aku ${agentName}, mau diskusi sesuatu?`
    },
    pt: {
      default: `Oi! Eu sou ${agentName}, seu companheiro. Toque em mais para configurações.`,
      idol: `Eu sou ${agentName}, quer conversar?`
    },
    es: {
      default: `Hola! Soy ${agentName}, tu compañero. Toca más para ajustes.`,
      idol: `Soy ${agentName}, quieres hablar de algo?`
    }
  };
  
  const langMessages = messages[language] || messages['en'];
  return isDefaultAgent ? langMessages.default : langMessages.idol;
};

export const translations: Record<Language, {
  appName: string;
  friend: string;
  friendStatus: string;
  friendDescription: string;
  typeMessage: string;
  settings: string;
  language: string;
  learningMode: string;
  learningModeDescription: string;
  voiceEnabled: string;
  theme: string;
  themeTeal: string;
  themePurple: string;
  themeBlue: string;
  themeRose: string;
  themeDark: string;
  clearMemory: string;
  clearChat: string;
  clearMemoryConfirm: string;
  clearChatConfirm: string;
  cancel: string;
  confirm: string;
  back: string;
  today: string;
  yesterday: string;
  russian: string;
  english: string;
  listening: string;
  tapToSpeak: string;
  memoryCleared: string;
  chatCleared: string;
  home: string;
  idols: string;
  selectIdol: string;
}> = {
  ru: {
    appName: 'Talkspase',
    friend: 'Лукас',
    friendStatus: 'онлайн',
    friendDescription: 'Всегда рядом, когда нужно',
    typeMessage: '...',
    settings: 'Настройки',
    language: 'Язык',
    learningMode: 'Режим билингва',
    learningModeDescription: 'Агент говорит на двух языках',
    voiceEnabled: 'Голосовые сообщения',
    theme: 'Тема оформления',
    themeTeal: 'Бирюзовая',
    themePurple: 'Фиолетовая',
    themeBlue: 'Синяя',
    themeRose: 'Розовая',
    themeDark: 'Тёмная',
    clearMemory: 'Очистить память',
    clearChat: 'Очистить чат',
    clearMemoryConfirm: 'Вы уверены, что хотите очистить память агента?',
    clearChatConfirm: 'Вы уверены, что хотите удалить все сообщения?',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    back: 'Назад',
    today: 'Сегодня',
    yesterday: 'Вчера',
    russian: 'Русский',
    english: 'English',
    listening: 'Слушаю...',
    tapToSpeak: 'Нажмите для голосового ввода',
    memoryCleared: 'Память очищена',
    chatCleared: 'Чат очищен',
    home: 'Дом',
    idols: 'Кумиры',
    selectIdol: 'Выберите кумира',
  },
  en: {
    appName: 'Talkspase',
    friend: 'Lucas',
    friendStatus: 'online',
    friendDescription: 'Always here when you need',
    typeMessage: '...',
    settings: 'Settings',
    language: 'Language',
    learningMode: 'Bilingual mode',
    learningModeDescription: 'Agent speaks in both languages',
    voiceEnabled: 'Voice messages',
    theme: 'Theme',
    themeTeal: 'Teal',
    themePurple: 'Purple',
    themeBlue: 'Blue',
    themeRose: 'Rose',
    themeDark: 'Dark',
    clearMemory: 'Clear memory',
    clearChat: 'Clear chat',
    clearMemoryConfirm: 'Are you sure you want to clear agent memory?',
    clearChatConfirm: 'Are you sure you want to delete all messages?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    back: 'Back',
    today: 'Today',
    yesterday: 'Yesterday',
    russian: 'Русский',
    english: 'English',
    listening: 'Listening...',
    tapToSpeak: 'Tap to speak',
    memoryCleared: 'Memory cleared',
    chatCleared: 'Chat cleared',
    home: 'Home',
    idols: 'Idols',
    selectIdol: 'Select an idol',
  },
  uk: {
    appName: 'Talkspase',
    friend: 'Лукас',
    friendStatus: 'онлайн',
    friendDescription: 'Завжди поруч',
    typeMessage: '...',
    settings: 'Налаштування',
    language: 'Мова',
    learningMode: 'Двомовний режим',
    learningModeDescription: 'Агент говорить двома мовами',
    voiceEnabled: 'Голосові повідомлення',
    theme: 'Тема',
    themeTeal: 'Бірюзова',
    themePurple: 'Фіолетова',
    themeBlue: 'Синя',
    themeRose: 'Рожева',
    themeDark: 'Темна',
    clearMemory: 'Очистити пам\'ять',
    clearChat: 'Очистити чат',
    clearMemoryConfirm: 'Ви впевнені?',
    clearChatConfirm: 'Видалити всі повідомлення?',
    cancel: 'Скасувати',
    confirm: 'Підтвердити',
    back: 'Назад',
    today: 'Сьогодні',
    yesterday: 'Вчора',
    russian: 'Русский',
    english: 'English',
    listening: 'Слухаю...',
    tapToSpeak: 'Натисніть щоб говорити',
    memoryCleared: 'Пам\'ять очищено',
    chatCleared: 'Чат очищено',
    home: 'Дім',
    idols: 'Кумири',
    selectIdol: 'Оберіть кумира',
  },
  kk: {
    appName: 'Talkspase',
    friend: 'Лукас',
    friendStatus: 'онлайн',
    friendDescription: 'Әрқашан жаныңда',
    typeMessage: '...',
    settings: 'Параметрлер',
    language: 'Тіл',
    learningMode: 'Екі тілді режим',
    learningModeDescription: 'Агент екі тілде сөйлейді',
    voiceEnabled: 'Дауыстық хабарламалар',
    theme: 'Тақырып',
    themeTeal: 'Көгілдір',
    themePurple: 'Күлгін',
    themeBlue: 'Көк',
    themeRose: 'Қызғылт',
    themeDark: 'Қараңғы',
    clearMemory: 'Жадты тазалау',
    clearChat: 'Чатты тазалау',
    clearMemoryConfirm: 'Сенімдісіз бе?',
    clearChatConfirm: 'Барлық хабарламаларды жою керек пе?',
    cancel: 'Бас тарту',
    confirm: 'Растау',
    back: 'Артқа',
    today: 'Бүгін',
    yesterday: 'Кеше',
    russian: 'Русский',
    english: 'English',
    listening: 'Тыңдаймын...',
    tapToSpeak: 'Сөйлеу үшін басыңыз',
    memoryCleared: 'Жад тазаланды',
    chatCleared: 'Чат тазаланды',
    home: 'Үй',
    idols: 'Жұлдыздар',
    selectIdol: 'Таңдаңыз',
  },
  uz: {
    appName: 'Talkspase',
    friend: 'Lukas',
    friendStatus: 'onlayn',
    friendDescription: 'Har doim yoningda',
    typeMessage: '...',
    settings: 'Sozlamalar',
    language: 'Til',
    learningMode: 'Ikki tilli rejim',
    learningModeDescription: 'Agent ikki tilda gaplashadi',
    voiceEnabled: 'Ovozli xabarlar',
    theme: 'Mavzu',
    themeTeal: 'Zangori',
    themePurple: 'Binafsha',
    themeBlue: "Ko'k",
    themeRose: 'Pushti',
    themeDark: 'Qorong\'i',
    clearMemory: 'Xotirani tozalash',
    clearChat: 'Chatni tozalash',
    clearMemoryConfirm: 'Ishonchingiz komilmi?',
    clearChatConfirm: 'Barcha xabarlarni o\'chirish?',
    cancel: 'Bekor qilish',
    confirm: 'Tasdiqlash',
    back: 'Orqaga',
    today: 'Bugun',
    yesterday: 'Kecha',
    russian: 'Русский',
    english: 'English',
    listening: 'Tinglayman...',
    tapToSpeak: 'Gapirish uchun bosing',
    memoryCleared: 'Xotira tozalandi',
    chatCleared: 'Chat tozalandi',
    home: 'Uy',
    idols: 'Yulduzlar',
    selectIdol: 'Tanlang',
  },
  be: {
    appName: 'Talkspase',
    friend: 'Лукас',
    friendStatus: 'анлайн',
    friendDescription: 'Заўсёды побач',
    typeMessage: '...',
    settings: 'Налады',
    language: 'Мова',
    learningMode: 'Двухмоўны рэжым',
    learningModeDescription: 'Агент гаворыць на дзвюх мовах',
    voiceEnabled: 'Галасавыя паведамленні',
    theme: 'Тэма',
    themeTeal: 'Бірузовая',
    themePurple: 'Фіялетавая',
    themeBlue: 'Сіняя',
    themeRose: 'Ружовая',
    themeDark: 'Цёмная',
    clearMemory: 'Ачысціць памяць',
    clearChat: 'Ачысціць чат',
    clearMemoryConfirm: 'Вы ўпэўнены?',
    clearChatConfirm: 'Выдаліць усе паведамленні?',
    cancel: 'Адмена',
    confirm: 'Пацвердзіць',
    back: 'Назад',
    today: 'Сёння',
    yesterday: 'Учора',
    russian: 'Русский',
    english: 'English',
    listening: 'Слухаю...',
    tapToSpeak: 'Націсніце каб гаварыць',
    memoryCleared: 'Памяць ачышчана',
    chatCleared: 'Чат ачышчаны',
    home: 'Дом',
    idols: 'Куміры',
    selectIdol: 'Абярыце',
  },
  fr: {
    appName: 'Talkspase',
    friend: 'Lucas',
    friendStatus: 'en ligne',
    friendDescription: 'Toujours là pour toi',
    typeMessage: '...',
    settings: 'Paramètres',
    language: 'Langue',
    learningMode: 'Mode bilingue',
    learningModeDescription: 'L\'agent parle deux langues',
    voiceEnabled: 'Messages vocaux',
    theme: 'Thème',
    themeTeal: 'Turquoise',
    themePurple: 'Violet',
    themeBlue: 'Bleu',
    themeRose: 'Rose',
    themeDark: 'Sombre',
    clearMemory: 'Effacer la mémoire',
    clearChat: 'Effacer le chat',
    clearMemoryConfirm: 'Êtes-vous sûr ?',
    clearChatConfirm: 'Supprimer tous les messages ?',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    back: 'Retour',
    today: 'Aujourd\'hui',
    yesterday: 'Hier',
    russian: 'Русский',
    english: 'English',
    listening: 'J\'écoute...',
    tapToSpeak: 'Appuyez pour parler',
    memoryCleared: 'Mémoire effacée',
    chatCleared: 'Chat effacé',
    home: 'Accueil',
    idols: 'Idoles',
    selectIdol: 'Choisir une idole',
  },
  de: {
    appName: 'Talkspase',
    friend: 'Lucas',
    friendStatus: 'online',
    friendDescription: 'Immer für dich da',
    typeMessage: '...',
    settings: 'Einstellungen',
    language: 'Sprache',
    learningMode: 'Zweisprachiger Modus',
    learningModeDescription: 'Agent spricht zwei Sprachen',
    voiceEnabled: 'Sprachnachrichten',
    theme: 'Thema',
    themeTeal: 'Türkis',
    themePurple: 'Lila',
    themeBlue: 'Blau',
    themeRose: 'Rosa',
    themeDark: 'Dunkel',
    clearMemory: 'Speicher löschen',
    clearChat: 'Chat löschen',
    clearMemoryConfirm: 'Sind Sie sicher?',
    clearChatConfirm: 'Alle Nachrichten löschen?',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    back: 'Zurück',
    today: 'Heute',
    yesterday: 'Gestern',
    russian: 'Русский',
    english: 'English',
    listening: 'Ich höre...',
    tapToSpeak: 'Tippen zum Sprechen',
    memoryCleared: 'Speicher gelöscht',
    chatCleared: 'Chat gelöscht',
    home: 'Start',
    idols: 'Idole',
    selectIdol: 'Idol auswählen',
  },
  id: {
    appName: 'Talkspase',
    friend: 'Lucas',
    friendStatus: 'online',
    friendDescription: 'Selalu ada untukmu',
    typeMessage: '...',
    settings: 'Pengaturan',
    language: 'Bahasa',
    learningMode: 'Mode bilingual',
    learningModeDescription: 'Agen berbicara dua bahasa',
    voiceEnabled: 'Pesan suara',
    theme: 'Tema',
    themeTeal: 'Teal',
    themePurple: 'Ungu',
    themeBlue: 'Biru',
    themeRose: 'Merah muda',
    themeDark: 'Gelap',
    clearMemory: 'Hapus memori',
    clearChat: 'Hapus chat',
    clearMemoryConfirm: 'Anda yakin?',
    clearChatConfirm: 'Hapus semua pesan?',
    cancel: 'Batal',
    confirm: 'Konfirmasi',
    back: 'Kembali',
    today: 'Hari ini',
    yesterday: 'Kemarin',
    russian: 'Русский',
    english: 'English',
    listening: 'Mendengarkan...',
    tapToSpeak: 'Ketuk untuk bicara',
    memoryCleared: 'Memori dihapus',
    chatCleared: 'Chat dihapus',
    home: 'Beranda',
    idols: 'Idola',
    selectIdol: 'Pilih idola',
  },
  pt: {
    appName: 'Talkspase',
    friend: 'Lucas',
    friendStatus: 'online',
    friendDescription: 'Sempre aqui para você',
    typeMessage: '...',
    settings: 'Configurações',
    language: 'Idioma',
    learningMode: 'Modo bilíngue',
    learningModeDescription: 'Agente fala dois idiomas',
    voiceEnabled: 'Mensagens de voz',
    theme: 'Tema',
    themeTeal: 'Turquesa',
    themePurple: 'Roxo',
    themeBlue: 'Azul',
    themeRose: 'Rosa',
    themeDark: 'Escuro',
    clearMemory: 'Limpar memória',
    clearChat: 'Limpar chat',
    clearMemoryConfirm: 'Tem certeza?',
    clearChatConfirm: 'Excluir todas as mensagens?',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    back: 'Voltar',
    today: 'Hoje',
    yesterday: 'Ontem',
    russian: 'Русский',
    english: 'English',
    listening: 'Ouvindo...',
    tapToSpeak: 'Toque para falar',
    memoryCleared: 'Memória limpa',
    chatCleared: 'Chat limpo',
    home: 'Início',
    idols: 'Ídolos',
    selectIdol: 'Escolher ídolo',
  },
  es: {
    appName: 'Talkspase',
    friend: 'Lucas',
    friendStatus: 'en línea',
    friendDescription: 'Siempre aquí para ti',
    typeMessage: '...',
    settings: 'Ajustes',
    language: 'Idioma',
    learningMode: 'Modo bilingüe',
    learningModeDescription: 'El agente habla dos idiomas',
    voiceEnabled: 'Mensajes de voz',
    theme: 'Tema',
    themeTeal: 'Turquesa',
    themePurple: 'Púrpura',
    themeBlue: 'Azul',
    themeRose: 'Rosa',
    themeDark: 'Oscuro',
    clearMemory: 'Borrar memoria',
    clearChat: 'Borrar chat',
    clearMemoryConfirm: '¿Estás seguro?',
    clearChatConfirm: '¿Eliminar todos los mensajes?',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    back: 'Atrás',
    today: 'Hoy',
    yesterday: 'Ayer',
    russian: 'Русский',
    english: 'English',
    listening: 'Escuchando...',
    tapToSpeak: 'Toca para hablar',
    memoryCleared: 'Memoria borrada',
    chatCleared: 'Chat borrado',
    home: 'Inicio',
    idols: 'Ídolos',
    selectIdol: 'Elegir ídolo',
  },
};

export const getTranslation = (lang: Language) => translations[lang] || translations['en'];
