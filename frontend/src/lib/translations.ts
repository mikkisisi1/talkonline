export type Language = 'ru' | 'en';

// Dynamic welcome message generator (displayed in chat bubble)
export const getWelcomeMessage = (language: Language, agentName: string): string => {
  if (language === 'ru') {
    return `Привет, солнышко! 😊 Я ${agentName}, твой личный ИИ друг ❤️ Так рада, что ты здесь. Нажми + для настроек или на значок Сатурна, чтобы познакомиться с другими. А можем просто поболтать прямо сейчас... Видишь внизу кнопку с микрофоном? Нажми, отпусти и говори — сообщение само отправится мне ✨`;
  }
  return `Hey sweetie! 😊 I'm ${agentName}, your personal AI friend ❤️ So happy you're here. Tap + for settings or the Saturn icon to meet others. Or we can just chat right now... See the microphone button below? Tap, release and talk — the message will send to me automatically ✨`;
};

// TTS-optimized welcome text — warm and gentle tone
export const getWelcomeSpeechText = (language: Language, agentName: string): string => {
  if (language === 'ru') {
    return `Привет, солнышко! Я ${agentName}, твой личный друг. Так рада, что ты здесь... Нажми плюс для настроек, или на значок Сатурна, чтобы познакомиться с другими. А можем просто поболтать прямо сейчас. Видишь внизу кнопку с микрофоном? Нажми, отпусти и говори. Сообщение само отправится мне.`;
  }
  return `Hey sweetie! I'm ${agentName}, your personal friend. So happy you're here... Tap plus for settings, or the Saturn icon to meet others. Or we can just chat right now. See the microphone button below? Tap, release and talk. The message will send to me automatically.`;
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
