# Talkmee - AI Chat Application

## Original Problem Statement
Create a polished AI chat application where users can converse with various AI personalities ("Idols") who have unique characteristics, voices, and knowledge.

## Tech Stack
- **Frontend**: React (Vite, TypeScript, Tailwind CSS, Zustand)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI/LLM**: OpenRouter
- **TTS**: Fish Audio API
- **STT**: Web Speech API

## Architecture
```
/app
├── backend/
│   ├── .env
│   ├── requirements.txt
│   └── server.py         # FastAPI: Chat, TTS, Agent Memory, Chat History
├── frontend/
│   ├── .env
│   └── src/
│       ├── assets/       # Agent photos/videos
│       ├── components/   # ChatHeader, MessageBubble, ChatInput, SplashScreen
│       ├── lib/          # storage.ts (idol data), translations, utils
│       ├── hooks/        # useChat, useSpeechRecognition, useAppState
│       ├── pages/        # ChatView, IdolsPage, SettingsPage
│       └── App.tsx
```

## Key API Endpoints
- `POST /api/friend-chat` - AI chat
- `POST /api/fish-audio-tts` - Text-to-Speech
- `POST /api/chat-history/save` - Save chat history
- `GET /api/chat-history/load` - Load chat history
- `POST /api/chat-history/clear` - Clear chat history

## What's Implemented
- [x] UI/UX design (waves animation, message bubbles, PWA icon)
- [x] 5 agent limit in header + long-press removal
- [x] Splash screen bug fix
- [x] "Lucas" identity bug fix
- [x] 20+ Idols with unique personalities and voices
- [x] Fish Audio TTS integration
- [x] OpenRouter LLM integration
- [x] Chat history persistence
- [x] Agent memory system
- [x] Voice for Verka Serduchka (Dec 2025)

## Pending Issues (P0 - Critical)
1. Page reloads during chat - runtime bug in frontend
2. Agent describes media but sends nothing
3. Video playback broken (play button non-functional)
4. Extra characters in text

## Pending Issues (P1)
- Unnatural TTS voices - check Fish Audio params

## Pending Issues (P2)
- Complete unique welcome messages for all idols
- Idols represent themselves incorrectly on first greeting

## Upcoming Tasks
- Update idol knowledge base with recent news
- Enhance agent memory system
- User-to-agent image sharing

## 3rd Party Integrations
- **OpenRouter**: AI chat (user API key in backend/.env)
- **Fish Audio**: TTS (user API key in backend/.env)

## Voice IDs Updated (Dec 2025)
- `fish_serduchka`: d4a18dce1cb14c049c3526b6d0f7a6f2
