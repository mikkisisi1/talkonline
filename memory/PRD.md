# Talkspase - AI Companions App

## Оригинальное описание
Приложение для общения с AI-персонажами (кумирами) с уникальными голосами, личностями и характерами. Пользователи могут разговаривать с Лукасом, Софией и множеством знаменитостей.

## Технологии
- **Frontend**: React (Vite, TypeScript, Tailwind CSS, Zustand)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI/LLM**: OpenRouter (бесплатные модели)
- **TTS**: Fish Audio API
- **STT**: Web Speech API

## Что сделано

### Кумиры (всего 30+):
- Лукас, София (основные)
- Сердючка, Солонин, Масяня
- Познер, Дудь, Ефремов, Ларри Кинг, Ельцин, Борат
- Гаврилов, Колмановский, Комаровский, Понасенков (новые - аватары скачаны)
- И другие из предыдущих сессий

### Голоса Fish Audio добавлены:
- fish_pozner, fish_dud, fish_efremov, fish_larryking, fish_yeltsin, fish_borat
- fish_gavrilov, fish_kolmanovsky, fish_komarovsky, fish_panasenkov

### UI/UX:
- Лимит 4 агента в шапке (было 5)
- Кнопка выбора языка (11 языков) - графитовый полупрозрачный фон
- PWA установка с окном "Установить"
- Видео заставка 4 сек
- Минималистичный дизайн

### SEO:
- Мультиязычные метатеги (11 языков)
- Hreflang теги
- Open Graph, Twitter Cards
- Название: Talkspase

### Агенты:
- Тёплый дружелюбный тон голоса
- Запрет фантазий и английских слов
- Запрет скобок и технических пометок
- Максимум 12 строк ответа
- Крафтовые эмодзи

## НЕ ЗАВЕРШЕНО (приоритеты):

### 1. Видео-приветствие Лукаса
- Видео скачано: `/app/frontend/public/welcome/lucas-welcome.mp4`
- Нужно: при клике на Лукаса - видео на весь экран, потом сворачивается, агент онлайн

### 2. Добавить новых кумиров в IdolsPage.tsx
- Гаврилов, Колмановский, Комаровский, Понасенков
- Аватары скачаны, голоса добавлены в backend
- VoiceId добавлен в storage.ts
- Осталось добавить в массив idols с personality

### 3. Переключение языков
- Меню сделано (графитовый фон)
- Имена агентов должны меняться при переключении
- Проверить что работает

### 4. Домен talkspase.online
- Пользователь хочет подключить через GoDaddy

### 5. Выход агентов в интернет
- Для обсуждения текущих новостей
- Нужна интеграция web search

## Ключевые файлы
- `/app/backend/server.py` - API, голоса, промпты
- `/app/frontend/src/pages/IdolsPage.tsx` - список кумиров
- `/app/frontend/src/lib/storage.ts` - VoiceId типы
- `/app/frontend/src/lib/translations.ts` - 11 языков
- `/app/frontend/src/components/ChatHeader.tsx` - шапка с языками
- `/app/frontend/public/welcome/lucas-welcome.mp4` - видео Лукаса
- `/app/frontend/public/splash/intro.mp4` - заставка 4 сек

## Fish Audio голоса (ID):
```
fish_pozner: a23a7b1e5fdb472bba2afdd821cf6f4f
fish_dud: e197abdfd36c4a079a8cb31ba3a1d077
fish_efremov: 6d493a05f8ac48d28a3d01a076e5d6db
fish_larryking: 45394a3dd3df4dce8ff04eaf36825d97
fish_yeltsin: d50331ee8c0747d5bfd86aa334b10577
fish_borat: 1a7f24f8d3534bec9dbd53617990e3c9
fish_gavrilov: 41b81c5f95554900a84df6879f780767
fish_kolmanovsky: 025ac65b3b75407888cfc7c054e0d597
fish_komarovsky: 5047789e3f844112b993ab47110df965
fish_panasenkov: bb875372d3944c14abe31266d9eab4eb
```

## Важно для следующего агента
- Пользователь общается ТОЛЬКО на русском
- Не ждать - сразу делать и билдить
- Минималистичный дизайн, графитовые/бирюзовые цвета
- Кумиры должны знать ВСЁ о своей личности, привычках, фразах
