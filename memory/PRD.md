# TalkMe - AI Chat Platform PRD

## Original Problem Statement
Пользователь хочет запустить свой GitHub проект "Talkmee" (repo: `talkonline`). Это чат-платформа где пользователи общаются с AI-агентами, каждый со своей уникальной личностью. Ключевые функции:
- AI-агенты с романтичными/флиртующими разговорами
- Интеграция FishAudio для голоса
- Агенты могут делиться контентом: фото и видео
- DeepSeek API для минимальных фильтров контента

## Tech Stack
- **Frontend**: Vite + React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (память агентов + история чата)
- **AI/LLM**: OpenRouter API (бесплатные модели с автоматическим fallback)
- **TTS**: Fish Audio API
- **Font**: JetBrains Mono (ЗАКРЕПЛЁН, НЕ МЕНЯТЬ)

## Architecture
```
/app
├── backend/
│   ├── .env (OPENROUTER_API_KEY, FISH_AUDIO_API_KEY, MONGO_URL)
│   ├── requirements.txt
│   └── server.py           # FastAPI: /api/friend-chat, /api/fish-audio-tts, /api/chat-history/*
├── frontend/
│   ├── public/
│   │   ├── images/sofia/   # Фото агента София
│   │   ├── videos/ivan/    # Видео агента Иван
│   │   └── videos/sofia/   # Видео агента София
│   ├── src/
│   │   ├── lib/
│   │   │   ├── agents.ts      # Профили агентов
│   │   │   ├── chatHistoryApi.ts # API для синхронизации истории чата
│   │   │   ├── videoScenes.ts # Метаданные для всех фото и видео
│   │   │   └── talk/          # API логика (stream, tts)
│   │   ├── components/        # UI компоненты
│   │   ├── hooks/             # useAppState с синхронизацией истории
│   │   ├── pages/             # Страницы (Index, IdolsPage, AdminPortal)
│   │   └── App.tsx
│   └── vite.config.ts
```

## Key API Endpoints
- `POST /api/friend-chat` - Streaming chat с OpenRouter API
- `POST /api/fish-audio-tts` - Text-to-Speech с Fish Audio
- `POST /api/chat-history/save` - Сохранить историю чата в MongoDB
- `GET /api/chat-history/{user_id}/{agent_id}` - Загрузить историю чата
- `DELETE /api/chat-history/{user_id}/{agent_id}` - Очистить историю чата

## DB Schema
- `chat_history` collection: `{ user_id, agent_id, messages: [{id, role, content, timestamp, imageUrl}], created_at, updated_at }`
- `agent_memories` collection: `{ user_id, agent_id, user_name, location, hobbies, personal_traits, important_facts, created_at, updated_at }`

## What's Implemented ✅
- [x] Миграция проекта с Supabase на FastAPI
- [x] Chat с AI-агентами (Лукас, София)
- [x] Streaming ответы через OpenRouter API
- [x] TTS через Fish Audio API
- [x] Видео контент для агентов (33+ видео Ивана, 5 видео Софии)
- [x] Секретный альбом Софии (10 фото)
- [x] Страница Settings (фон чата, язык, PWA)
- [x] Страница Idols (18 персонажей + 14 новых = 32 персонажа)
- [x] PWA поддержка
- [x] Адаптивный дизайн для всех устройств
- [x] Память агентов в MongoDB
- [x] Автоматическая тема (день/ночь)
- [x] OpenRouter интеграция с fallback на 7 моделей
- [x] **ПОЛНАЯ ИСТОРИЯ ЧАТА В MongoDB** - 14.02.2026
- [x] **UI/UX ДИЗАЙН ЗАКРЕПЛЁН** - НЕ МЕНЯТЬ без запроса
- [x] **15.02.2026 - НОВЫЕ ГОЛОСА В IDOLS**:
  - Саша Гудков, Илья Варламов, Алиса Фрейндлих, Новосельцев
  - Гарик Харламов, Гарик Мартиросян, Сергей Светлаков, Юрий Стоянов
  - Семён Слепаков, Артемий Лебедев, Артемий Троицкий, Леонид Парфёнов, Земфира
  - Сергей Бурунов получил свой голос (fish_burunov)
  - Добавлен скролл на страницу Idols

## Not Implemented / Backlog ❌
- [ ] **P1**: Vision capabilities - агент видит фото пользователя
- [ ] **P2**: Уникальные личности для Idols
- [ ] **P2**: Улучшение памяти агентов (LLM-суммаризация)
- [ ] **P3**: Фото для новых кумиров (ожидаем от пользователя)

## Known Issues
- ⚠️ Fish Audio TTS - INSUFFICIENT BALANCE (402). Пользователю нужно пополнить баланс API ключа
- ⚠️ Микрофон/волны - Web Speech API требует Chrome/Edge + разрешение. Анимация волн работает когда isListening=true
- ⚠️ TTS Лукаса - работает нормально (200 OK). Если нет звука - проверьте громкость браузера

## Preview URL
https://idol-chat-preview.preview.emergentagent.com

## Fish Audio Voice IDs (Новые 15.02.2026)
```
fish_gudkov: 9fef9d9c6c2f435488c0c428edb614ad
fish_varlamov: 0f02a59f480d4969b3dad603bd380cc2
fish_freindlih: fffe8c80fb374b3ba59eaca52f42f5a9
fish_novoseltsev: 266c495d2338409981afcf2f433ba394
fish_harlamov: 2f3218b3b3f8456dbcfce648d01fb33f
fish_martirosyan: d156215a105449f08bdc958a49456225
fish_svetlakov: 9b8b6c63a689426daaf1b51fc1321f9b
fish_stoyanov: 86bf66bd2f614333bfafc3f3cdf9f966
fish_burunov: d40b1d3ce8334ed9a9e63ba19533bf8e
fish_slepakov: 7a1aad9c964e4b1ba8e202180713094b
fish_lebedev: c332f1734fed47a99c99dea921097dc4
fish_troitsky: 380c6b1dcf934e1a9db81ade939141cc
fish_parfenov: f1bbb1d2f3124f819f20fe7324da27be
fish_zemfira: 5874191170124541a56f1f8c689c49af
```
