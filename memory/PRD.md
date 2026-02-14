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
- **Database**: MongoDB (память агентов)
- **AI/LLM**: OpenRouter API (бесплатные модели с автоматическим fallback)
- **TTS**: Fish Audio API

## Architecture
```
/app
├── backend/
│   ├── .env (DEEPSEEK_API_KEY, FISH_AUDIO_API_KEY, MONGO_URL)
│   ├── requirements.txt
│   └── server.py           # FastAPI: /api/friend-chat, /api/fish-audio-tts
├── frontend/
│   ├── public/
│   │   ├── images/sofia/   # Фото агента София (включая секретный альбом)
│   │   ├── videos/ivan/    # Видео агента Иван
│   │   └── videos/sofia/   # Видео агента София
│   ├── src/
│   │   ├── lib/
│   │   │   ├── agents.ts      # Профили агентов
│   │   │   ├── videoScenes.ts # Метаданные для всех фото и видео
│   │   │   └── talk/          # API логика (stream, tts)
│   │   ├── components/        # UI компоненты
│   │   ├── pages/             # Страницы (Index, IdolsPage, AdminPortal)
│   │   └── App.tsx
│   └── vite.config.ts
```

## Key API Endpoints
- `POST /api/friend-chat` - Streaming chat с DeepSeek API
- `POST /api/fish-audio-tts` - Text-to-Speech с Fish Audio

## What's Implemented ✅
- [x] Миграция проекта с Supabase на FastAPI
- [x] Chat с AI-агентами (Лукас, София)
- [x] Streaming ответы через DeepSeek API
- [x] TTS через Fish Audio API
- [x] Видео контент для агентов (33+ видео Ивана, 5 видео Софии)
- [x] Секретный альбом Софии (10 фото) - обновлено 14.02.2026
- [x] Страница Settings (фон чата, язык, PWA)
- [x] Страница Idols (18 персонажей)
- [x] PWA поддержка
- [x] **Адаптивный дизайн** - обновлено 14.02.2026:
  - iPhone SE (375px): 2 колонки персонажей, 2 колонки обоев
  - iPhone 14 Pro (430px): 2 колонки персонажей, 3 колонки обоев
  - iPad (768px): 3-4 колонки
  - Laptop (1440px): 5-6 колонок
- [x] **Память агентов в MongoDB** - обновлено 14.02.2026:
  - Сохранение: имя, локация, хобби, личные качества
  - Агент помнит пользователя между сессиями
  - Endpoint: POST /api/update-memory, GET /api/memory/{userId}/{agentId}
- [x] **Автоматическая тема** - обновлено 14.02.2026:
  - 06:00-18:00 → светлая тема
  - 18:00-06:00 → тёмная тема
  - Ручное изменение сбрасывается через 6 часов

## Content Library (14.02.2026)
### София - Секретный альбом (10 фото):
- sofia_secret_1.jpg - sofia_secret_10.jpg
- Описания в `/app/frontend/src/lib/videoScenes.ts`

## Not Implemented / Backlog ❌
- [ ] **P1**: Vision capabilities - агент видит фото пользователя (требует multimodal модель)
- [ ] **P2**: Cleanup workspace - удалить /app/talkmee_lovable_app/
- [ ] **P2**: История чата в MongoDB (сейчас только память о пользователе)

## Known Issues
- Chat history не сохраняется между сессиями (критично)
- Multimodal не поддерживается (DeepSeek text-only)

## Preview URL
https://sofia-secrets.preview.emergentagent.com
