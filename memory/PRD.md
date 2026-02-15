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
- [x] Страница Idols (18 персонажей)
- [x] PWA поддержка
- [x] Адаптивный дизайн для всех устройств
- [x] Память агентов в MongoDB
- [x] Автоматическая тема (день/ночь)
- [x] OpenRouter интеграция с fallback на 7 моделей
- [x] **ПОЛНАЯ ИСТОРИЯ ЧАТА В MongoDB** - 14.02.2026:
  - API endpoints для сохранения/загрузки/удаления
  - Авто-синхронизация с localStorage
  - Debounced сохранение (2 сек)
  - Тесты: 17/17 пройдено
- [x] **Исправлен баг приветствия** - 14.02.2026:
  - Текст отображается правильно: "...отправится мне ✨"
- [x] **UI/UX ДИЗАЙН ЗАКРЕПЛЁН** - НЕ МЕНЯТЬ без запроса:
  - Шрифт JetBrains Mono везде
  - Cyan обводка у активного агента
  - Тёмно-бирюзовый header
  - Сообщения: тёмный фон + cyan текст
- [x] **Удалена устаревшая папка** /app/talkmee_lovable_app/

## Not Implemented / Backlog ❌
- [ ] **P1**: Vision capabilities - агент видит фото пользователя
- [ ] **P2**: Уникальные личности для Idols
- [ ] **P2**: Улучшение памяти агентов (LLM-суммаризация)

## Known Issues
- ⚠️ Fish Audio TTS - INSUFFICIENT BALANCE (402). Пользователю нужно пополнить баланс API ключа
- ⚠️ Микрофон - зависит от браузера (Web Speech API)

## Preview URL
https://tts-fix-lucas.preview.emergentagent.com

## Test Status (14.02.2026)
- Backend: 100% (17/17 tests passed)
- Frontend: 100% - loads correctly, chat works
- Test report: /app/test_reports/iteration_1.json
