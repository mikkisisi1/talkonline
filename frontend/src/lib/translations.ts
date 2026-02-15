export type Language = 'ru' | 'en';

// Dynamic welcome message generator (displayed in chat bubble)
export const getWelcomeMessage = (language: Language, agentName: string): string => {
  // Check if it's a default agent (Lucas/Sofia) or an idol
  const isDefaultAgent = agentName === 'Лукас' || agentName === 'София' || agentName === 'Lucas' || agentName === 'Sofia';
  
  if (language === 'ru') {
    if (isDefaultAgent) {
      return `Привет! 😊 Я ${agentName}, твой личный ИИ агент, друг ❤️ или партнёр. Нажми + для перехода в настройки или на знак Сатурна для общения с твоими кумирами. Или можем сразу продолжить здесь. Видишь, внизу маленькая кнопка с микрофоном. Просто нажми и отпусти её и начни говорить. Сообщение само отправится мне ✨`;
    }
    return `Я ${agentName}, хочешь что-нибудь обсудить? Говори, я весь во внимании.`;
  }
  if (isDefaultAgent) {
    return `Hi! 😊 I'm ${agentName}, your personal AI agent, friend ❤️ or partner. Tap + to open settings or the Saturn icon to chat with your idols. Or we can just continue here. See the small microphone button below? Just tap and release it and start talking. The message will send automatically ✨`;
  }
  return `I'm ${agentName}, want to discuss something? Go ahead, I'm all ears.`;
};

// TTS-optimized welcome text — clean of emoji, with punctuation for natural rhythm
export const getWelcomeSpeechText = (language: Language, agentName: string): string => {
  // Check if it's a default agent (Lucas/Sofia) or an idol
  const isDefaultAgent = agentName === 'Лукас' || agentName === 'София' || agentName === 'Lucas' || agentName === 'Sofia';
  
  if (language === 'ru') {
    if (isDefaultAgent) {
      return `Привет! Я ${agentName}, твой личный ИИ агент, друг или партнёр. Нажми плюс, для перехода в настройки, или на значок Сатурна, для общения с твоими кумирами. Или можем сразу продолжить здесь. Видишь, внизу маленькая кнопка с микрофоном. Просто нажми и отпусти её и начни говорить. Сообщение само отправится мне.`;
    }
    return `Я ${agentName}, хочешь что-нибудь обсудить? Говори, я весь во внимании.`;
  }
  if (isDefaultAgent) {
    return `Hi! I'm ${agentName}, your personal AI agent, friend or partner. Tap plus to open settings, or the Saturn icon to chat with your idols. Or we can just continue here. See the small microphone button below? Just tap and release it and start talking. The message will send automatically.`;
  }
  return `I'm ${agentName}, want to discuss something? Go ahead, I'm all ears.`;
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
