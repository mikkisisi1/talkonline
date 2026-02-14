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
│   ├── .env (OPENROUTER_API_KEY, FISH_AUDIO_API_KEY, MONGO_URL)
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
- `POST /api/friend-chat` - Streaming chat с OpenRouter API
- `POST /api/fish-audio-tts` - Text-to-Speech с Fish Audio

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
- [x] **Исправлен баг TTS** - обновлено 14.02.2026:
  - Агенты больше не озвучивают настройки ("warm, friendly tone...")
  - Emotion prefix удалён из текста
- [x] **Обновлён стиль общения** - обновлено 14.02.2026:
  - Короткие и средние ответы (60%/40%)
  - Разговорный стиль ("ну", "ага", "короче")
  - Без поэзии и философии
- [x] **Обновлён UI дизайн** - обновлено 14.02.2026:
  - Cyan обводка (#00D4AA) у активного агента
  - Тёмно-бирюзовый header (#0a3d3d)
  - Сообщения: тёмный фон + cyan текст (#4AEDC4)
  - Аватар агента внутри каждого сообщения
  - Моноширинный шрифт JetBrains Mono
  - Input bar с backdrop blur

## Not Implemented / Backlog ❌
- [ ] **P1**: Полная история чата в MongoDB (сейчас только факты о пользователе)
- [ ] **P2**: Vision capabilities - агент видит фото пользователя
- [ ] **P3**: Уникальные личности для Idols
- [ ] **P3**: Cleanup workspace - удалить /app/talkmee_lovable_app/

## Known Issues
- Chat history не сохраняется между сессиями

## Preview URL
https://chat-with-sofia.preview.emergentagent.com
