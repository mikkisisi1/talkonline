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

export const translations = {
  ru: {
    appName: 'TalkMe',
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
  },
  en: {
    appName: 'TalkMe',
    friend: 'Ivan',
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
  },
} as const;

export const getTranslation = (lang: Language) => translations[lang];
