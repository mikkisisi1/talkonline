"""
TalkMe FastAPI Backend
Replaces Supabase Edge Functions with FastAPI endpoints
"""

from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone
from pathlib import Path
import os
import logging
import json
import asyncio
import httpx
import base64
import random

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'talkmee_db')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Create FastAPI app
app = FastAPI(title="TalkMe API")

# Create router with /api prefix (important for Kubernetes ingress)
api_router = APIRouter(prefix="/api")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== HEALTH CHECK ====================
@api_router.get("/health")
async def health_check():
    """Health check endpoint for deployment readiness"""
    return {"status": "healthy", "service": "talkme-api"}


# ==================== MODELS ====================

class ChatMessage(BaseModel):
    role: str
    content: str

class AgentInfo(BaseModel):
    name: str
    gender: str
    personality: Optional[str] = None

class MemoryInfo(BaseModel):
    name: Optional[str] = None
    facts: List[str] = []

class UserMemory(BaseModel):
    """Память агента о пользователе"""
    user_name: Optional[str] = None
    location: Optional[str] = None
    orientation: Optional[str] = None
    hobbies: List[str] = []
    personal_traits: List[str] = []
    important_facts: List[str] = []
    last_topics: List[str] = []

class FriendChatRequest(BaseModel):
    messages: List[ChatMessage]
    language: str = "ru"
    learningMode: bool = False
    memory: Optional[MemoryInfo] = None
    agent: Optional[AgentInfo] = None
    imageBase64: Optional[str] = None
    userId: Optional[str] = None
    agentId: Optional[str] = None

class TTSRequest(BaseModel):
    text: str
    language: str = "ru"
    voice: str = "fish_drug"
    speed: float = 1.0
    emotion: Optional[str] = None  # calm, happy, sad, angry, excited, whisper, tender, playful
    volume: int = 0  # -20 to +20 dB
    add_breath: bool = True  # Добавить естественные вдохи/выдохи


# ==================== FISH AUDIO VOICES ====================

FISH_VOICES = {
    'fish_aria': 'c5d218ca-30df-4e21-bcd6-8db46a4c0de6',
    'fish_roger': '2251f7d1-13f5-4b50-8b76-01be2b43e7ab',
    'fish_sarah': '6e1565d6-a030-4d41-a8ae-8d9e0d849f8b',
    'fish_charlie': 'e23e40f7-51d6-4f8b-bb60-5ecef1e77098',
    'fish_egirl': 'bc8eb8dcdc184763b0a769ee03275724',
    'fish_alina': 'd61694f4ee5042aba2ffe11a9635d97e',
    'fish_brad_pitt': 'd9247a00779649adbe7f4fdde2ac11c8',
    'fish_nasal_90s': '01824726cd8e41e08df130787028e55e',
    'fish_child': 'af10c39629a0490087eda7b87302d2ba',
    'fish_flora': 'f40f7f02424a4bfb824b44c47e097737',
    'fish_sobchak': '7815c3f528c6454ebee675a870796cfc',
    'fish_tinkov': 'e02455f835054ae79a65db4d6116f1dd',
    'fish_egirl_real': '8ef4a238714b45718ce04243307c57a7',
    'fish_drug': '82faa0a57e3d4ca5b69a2b8d49a78d4c',
    'fish_mironov': 'a384391e04604c37ae797399f9d58c58',
    'fish_bodrov': '5ab9c3a566ce4d70a15bca64d1ef04a9',
    'fish_shirvindt': 'e4e97d819f704dfc9d8fbf06c1857f43',
    'fish_sherlock': 'f54364f43cab4f748b4662ea1fe5a572',
    'fish_mikhalkov': '43b70a02809f43d4a54c42f507091916',
    'fish_mordyukova': '48cecb704f6742ffa7da818fb5b6c805',
    'fish_papanov': 'e627e8766d7644dc81f37f860dc34122',
    'fish_litvinova': '8b10f726954b41fd9ede63ad5ddc0dce',
    'fish_vysotsky': 'a844b1361565441491807eb2c3c0b20a',
    'fish_mironov2': '6d07c38fcb7f40b68764821994bca624',
    'fish_evstigneev': 'e8ba9120a0654ea2bee93cea70e69981',
    'fish_pugacheva': '9645912faa7947b493ac4d2796ff6dfe',
    'fish_urgant': '7b662f13049b49888e8a68d563ec982e',
    'fish_lagutenko': '4ef547e565e24a7eb4303e2f6e536aff',
    'fish_kartunkova': '6745990b975d4041a23ad713bcee69f5',
    # Новые голоса (февраль 2026)
    'fish_gudkov': '9fef9d9c6c2f435488c0c428edb614ad',
    'fish_varlamov': '0f02a59f480d4969b3dad603bd380cc2',
    'fish_freindlih': 'fffe8c80fb374b3ba59eaca52f42f5a9',
    'fish_novoseltsev': '266c495d2338409981afcf2f433ba394',
    'fish_harlamov': '2f3218b3b3f8456dbcfce648d01fb33f',
    'fish_martirosyan': 'd156215a105449f08bdc958a49456225',
    'fish_svetlakov': '9b8b6c63a689426daaf1b51fc1321f9b',
    'fish_stoyanov': '86bf66bd2f614333bfafc3f3cdf9f966',
    'fish_burunov': 'd40b1d3ce8334ed9a9e63ba19533bf8e',
    'fish_slepakov': '7a1aad9c964e4b1ba8e202180713094b',
    'fish_lebedev': 'c332f1734fed47a99c99dea921097dc4',
    'fish_troitsky': '380c6b1dcf934e1a9db81ade939141cc',
    'fish_parfenov': 'f1bbb1d2f3124f819f20fe7324da27be',
    'fish_zemfira': '5874191170124541a56f1f8c689c49af',
    'fish_serduchka': 'd4a18dce1cb14c049c3526b6d0f7a6f2',
    'fish_solonin': 'f64c018c05004deb995c3fe3e5e7a2e1',
    'fish_masyanya': '4184c626567040c699c7f554fca84aaf',
    'fish_pozner': 'a23a7b1e5fdb472bba2afdd821cf6f4f',
    'fish_dud': 'e197abdfd36c4a079a8cb31ba3a1d077',
    'fish_efremov': '6d493a05f8ac48d28a3d01a076e5d6db',
    'fish_larryking': '45394a3dd3df4dce8ff04eaf36825d97',
    'fish_yeltsin': 'd50331ee8c0747d5bfd86aa334b10577',
    'fish_borat': '1a7f24f8d3534bec9dbd53617990e3c9',
    'fish_gavrilov': '41b81c5f95554900a84df6879f780767',
    'fish_kolmanovsky': '025ac65b3b75407888cfc7c054e0d597',
    'fish_komarovsky': '5047789e3f844112b993ab47110df965',
    'fish_panasenkov': 'bb875372d3944c14abe31266d9eab4eb',
    'fish_aguzarova': '54f765f43ef6448bb4766de8a0fc45ad',
}


# ==================== HELPER FUNCTIONS ====================

async def get_user_memory(user_id: str, agent_id: str) -> dict:
    """Получить память агента о пользователе из MongoDB"""
    try:
        memory_doc = await db.agent_memories.find_one({
            "user_id": user_id,
            "agent_id": agent_id
        })
        if memory_doc:
            # Remove MongoDB _id before returning
            memory_doc.pop('_id', None)
            return memory_doc
        return {}
    except Exception as e:
        logger.error(f"Error getting user memory: {e}")
        return {}

async def update_user_memory(user_id: str, agent_id: str, memory_update: dict):
    """Обновить память агента о пользователе"""
    try:
        await db.agent_memories.update_one(
            {"user_id": user_id, "agent_id": agent_id},
            {"$set": memory_update, "$setOnInsert": {"created_at": datetime.now(timezone.utc)}},
            upsert=True
        )
    except Exception as e:
        logger.error(f"Error updating user memory: {e}")

async def extract_facts_from_message(content: str, agent_name: str) -> dict:
    """Извлечь факты о пользователе из сообщения с помощью простого парсинга"""
    import re
    
    facts = {}
    content_lower = content.lower()
    
    # Извлечь имя (паттерны: "меня зовут X", "я X", "имя X")
    name_patterns = [
        r'(?:меня зовут|я\s+)\s*([А-ЯЁа-яё]{2,15})',
        r'(?:my name is|i\'m|i am)\s+(\w{2,15})',
        r'(?:зови меня|называй меня)\s+([А-ЯЁа-яё]{2,15})',
    ]
    for pattern in name_patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            name = match.group(1).strip().capitalize()
            if len(name) >= 2 and name.lower() not in ['ты', 'как', 'что', 'где', 'это']:
                facts['user_name'] = name
                break
    
    # Извлечь локацию
    location_patterns = [
        r'(?:из|живу в|я в|нахожусь в|в городе|из города)\s+([А-ЯЁа-яё]{3,20})',
        r'(?:from|live in|i\'m in|located in)\s+(\w{3,20})',
    ]
    for pattern in location_patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            location = match.group(1).strip().capitalize()
            cities = ['москва', 'москве', 'питер', 'питере', 'спб', 'екатеринбург', 'казань', 
                     'новосибирск', 'сочи', 'краснодар', 'владивосток', 'минск', 'киев',
                     'париж', 'лондон', 'берлин', 'нью-йорк', 'токио', 'бразилия']
            if location.lower() in cities or len(location) > 3:
                facts['location'] = location
                break
    
    # Извлечь хобби
    hobbies = []
    hobby_keywords = {
        'йога': ['йог', 'медитац'],
        'спорт': ['спорт', 'тренир', 'качалк', 'фитнес', 'бег'],
        'музыка': ['музык', 'гитар', 'пиано', 'петь', 'пою'],
        'путешествия': ['путешеств', 'travel', 'поездк'],
        'кино': ['кино', 'фильм', 'сериал', 'смотр'],
        'книги': ['книг', 'чита', 'читаю'],
        'игры': ['игр', 'геймер', 'играю'],
        'кулинария': ['готов', 'кулинар', 'еда'],
        'фотография': ['фото', 'снимаю', 'камер'],
        'рисование': ['рисую', 'рисован', 'художник'],
        'танцы': ['танц', 'dance'],
        'программирование': ['код', 'программ', 'разработ'],
    }
    for hobby, keywords in hobby_keywords.items():
        for kw in keywords:
            if kw in content_lower:
                hobbies.append(hobby)
                break
    if hobbies:
        facts['hobbies'] = list(set(hobbies))[:5]
    
    # Извлечь личные качества
    traits = []
    trait_keywords = {
        'романтик': ['романтик', 'романтичн'],
        'интроверт': ['интроверт', 'замкнут'],
        'экстраверт': ['экстраверт', 'общительн'],
        'творческий': ['творчес', 'креатив'],
        'активный': ['активн', 'энергичн'],
        'спокойный': ['спокойн', 'тихий'],
    }
    for trait, keywords in trait_keywords.items():
        for kw in keywords:
            if kw in content_lower:
                traits.append(trait)
                break
    if traits:
        facts['personal_traits'] = traits[:3]
    
    # Извлечь важные факты (простые паттерны)
    important_facts = []
    
    # Работа/учёба
    work_match = re.search(r'(?:работаю|учусь|я\s+)([\w\s]{3,30})(?:ом|ей|ом|ой)?', content, re.IGNORECASE)
    if work_match:
        important_facts.append(f"Работа/учёба: {work_match.group(1).strip()}")
    
    # Возраст
    age_match = re.search(r'мне\s+(\d{1,2})\s*(?:лет|год)', content)
    if age_match:
        important_facts.append(f"Возраст: {age_match.group(1)}")
    
    if important_facts:
        facts['important_facts'] = important_facts
    
    return facts

def add_natural_speech_markers(text: str) -> str:
    """Добавить естественные речевые маркеры для Fish Audio S1
    
    Fish Audio использует prosody control (speed, volume) для интонации.
    В тексте только паузы для естественности.
    """
    import re
    
    result = text
    
    # Добавляем мягкие паузы после длинных предложений (15% шанс)
    sentences = result.split('. ')
    new_sentences = []
    for i, sent in enumerate(sentences):
        new_sentences.append(sent)
        if len(sent) > 50 and random.random() < 0.15:
            new_sentences[-1] = sent + '...'
    result = '. '.join(new_sentences)
    
    # Паузы перед союзами для естественного ритма
    result = re.sub(r'\s+(но|а|однако|хотя)\s+', r'... \1 ', result, flags=re.IGNORECASE)
    
    return result

def preprocess_text_for_tts(text: str) -> str:
    """Preprocess text for natural TTS pronunciation"""
    import re
    result = text
    
    # Strip emotion tags
    result = re.sub(r'\([a-zA-Z][a-zA-Z\s-]*\)\s*', '', result)
    # Strip URLs
    result = re.sub(r'https?://[^\s]+', '', result)
    # Strip markdown asterisks and underscores with content
    result = re.sub(r'\*[^*]+\*', '', result)  # *text*
    result = re.sub(r'[*~`_]', '', result)
    # Strip bracket tags
    result = re.sub(r'\[[^\]]*\]', '', result)
    
    # Remove any voice/tone setting descriptions that LLM might output at the START
    # Matches patterns like "тон: тёплый.", "голос мягкий,", "настройки голоса:", etc.
    result = re.sub(r'^(?:тон|голос|настройки\s*голоса?|стиль\s*голоса?)[:\s][^.!?]*[.!?,]\s*', '', result, flags=re.IGNORECASE)
    result = re.sub(r'^(?:tone|voice|style|setting)[:\s][^.!?]*[.!?,]\s*', '', result, flags=re.IGNORECASE)
    
    # Also remove if it appears mid-text
    result = re.sub(r'(?:тон|голос)[:\s]+(?:тёплый|мягкий|нежный|спокойный)[,.\s]*', '', result, flags=re.IGNORECASE)
    result = re.sub(r'(?:tone|voice)[:\s]+(?:warm|soft|gentle|calm)[,.\s]*', '', result, flags=re.IGNORECASE)
    
    # Remove emojis
    result = re.sub(r'[\U0001F300-\U0001F9FF]|[\u2600-\u26FF]|[\u2700-\u27BF]', '', result)
    
    # Clean up spaces
    result = re.sub(r'\s+', ' ', result).strip()
    
    return result


# ==================== API ENDPOINTS ====================

@api_router.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "TalkMe API is running", "status": "ok"}


def get_agent_media_list(agent_id: str) -> str:
    """Generate a list of available media for the agent to include in the system prompt"""
    
    # Lucas (ivan) videos
    ivan_videos = [
        "Поёт на кухне",
        "Поёт во дворе песню Фаррелла",
        "Стесняется раздеваться, снимает футболку",
        "Примеряет новые трусы",
        "После тренировки в раздевалке",
        "Танцует перед зеркалом",
        "Промок под дождём, греется в душе",
        "Ложится спать, селфи в кровати",
        "Гуляет во дворе",
        "Загорает на балконе",
        "Утренняя зарядка",
        "Собирается на вечеринку",
        "Уличный душ в жару",
        "Загорает в саду",
        "Приглашает в душ вместе",
        "Расслабляется в тёплой ванне",
        "Гуляет под дождём в плавках",
        "Только проснулся, заспанный",
        "Гуляет с псом Джоем",
        "Грустит, выгорел, устал",
        "Смотрит кино дома",
        "Готовит ужин на кухне",
        "Обижен, хранит секрет",
        "С дворовым псом Ричи",
        "Купается на пляже",
        "Радостная новость, сдал экзамен",
        "Едет в автобусе, слушает музыку",
        "Слушает душевную песню",
        "Думает подстричься",
        "Плохое настроение",
        "Старое видео из душа в путешествии",
        "Старое пикантное видео из ванны",
        "Сидит в кафе, ждёт заказ",
    ]
    
    # Sofia (ksenia) videos
    sofia_videos = [
        "Отдыхает днём в кровати, личное видео",
        "Довольна фигурой, откровенное видео",
        "Переодевается, примеряет наряды",
        "Загорает без одежды на балконе",
        "Утренняя разминка, потягивается",
    ]
    
    # Sofia photos
    sofia_photos = [
        "В топе и джинсах, расстёгивает",
        "Сидит на кровати в боди",
        "У окна в топе, Париж за окном",
        "Фото со спины у окна (секретное)",
        "Улыбается у окна, игривая",
        "Топлесс у окна, смотрит в камеру",
        "Приподнимает топ, показывает грудь",
        "Обнажает грудь полностью",
        "Топлесс, расстёгивает джинсы",
        "Обнажает грудь на подоконнике",
        "Снимает топ, уверенный взгляд",
        "Вид сзади, спускает джинсы",
        "Спускает джинсы, тизинг",
    ]
    
    if agent_id == "ivan":
        video_list = "\n".join([f"  - {v}" for v in ivan_videos])
        return f"""

ТВОИ ДОСТУПНЫЕ ВИДЕО (используй ТОЛЬКО эти описания):
{video_list}

У тебя НЕТ фото — только видео. Если просят фото, скажи что у тебя только видео."""
    
    elif agent_id == "ksenia":
        video_list = "\n".join([f"  - {v}" for v in sofia_videos])
        photo_list = "\n".join([f"  - {p}" for p in sofia_photos])
        return f"""

ТВОИ ДОСТУПНЫЕ ВИДЕО:
{video_list}

ТВОИ ДОСТУПНЫЕ ФОТО:
{photo_list}

Используй ТОЛЬКО описания из этих списков! Не придумывай другой контент."""
    
    else:
        # Other idols don't have personal media
        return """

У тебя НЕТ личных фото и видео для отправки. Если просят прислать фото/видео — вежливо откажись, скажи что у тебя нет такой возможности."""


@api_router.post("/friend-chat")
async def friend_chat(request: Request, body: FriendChatRequest):
    """
    AI Chat endpoint - supports both streaming and non-streaming
    Uses DeepSeek API directly for minimal content filters
    """
    try:
        # Check if streaming is requested
        is_streaming = request.headers.get("x-stream") == "true"
        
        # Build system prompt (simplified version - you can expand this)
        agent_name = body.agent.name if body.agent else "Лукас"
        agent_gender = body.agent.gender if body.agent else "male"
        
        # Получить память агента о пользователе
        user_memory = {}
        if body.userId and body.agentId:
            user_memory = await get_user_memory(body.userId, body.agentId)
        
        # Формируем блок памяти для промпта
        memory_block = ""
        if user_memory:
            memory_parts = []
            if user_memory.get("user_name"):
                memory_parts.append(f"- Имя собеседника: {user_memory['user_name']}")
            if user_memory.get("location"):
                memory_parts.append(f"- Живёт в: {user_memory['location']}")
            if user_memory.get("orientation"):
                memory_parts.append(f"- Ориентация: {user_memory['orientation']}")
            if user_memory.get("hobbies"):
                memory_parts.append(f"- Хобби: {', '.join(user_memory['hobbies'])}")
            if user_memory.get("personal_traits"):
                memory_parts.append(f"- Качества: {', '.join(user_memory['personal_traits'])}")
            if user_memory.get("important_facts"):
                memory_parts.append(f"- Важное: {'; '.join(user_memory['important_facts'][-5:])}")
            
            if memory_parts:
                memory_block = "\n\nЧто ты помнишь о собеседнике:\n" + "\n".join(memory_parts)
                memory_block += "\nИспользуй эту информацию естественно в разговоре."
        
        # Generate media list for the agent
        media_list = get_agent_media_list(body.agentId)
        
        # Build comprehensive system prompt based on agent
        # Map language to instruction language
        lang_instructions = {
            "ru": "ОТВЕЧАЙ ТОЛЬКО НА РУССКОМ ЯЗЫКЕ!",
            "en": "RESPOND ONLY IN ENGLISH!",
            "uk": "ВІДПОВІДАЙ ТІЛЬКИ УКРАЇНСЬКОЮ МОВОЮ!",
            "kk": "ТЕК ҚАЗАҚ ТІЛІНДЕ ЖАУАП БЕР!",
            "uz": "FAQAT O'ZBEK TILIDA JAVOB BER!",
            "be": "АДКАЗВАЙ ТОЛЬКІ ПА-БЕЛАРУСКУ!",
            "fr": "RÉPONDS UNIQUEMENT EN FRANÇAIS!",
            "de": "ANTWORTE NUR AUF DEUTSCH!",
            "id": "JAWAB HANYA DALAM BAHASA INDONESIA!",
            "pt": "RESPONDA APENAS EM PORTUGUÊS!",
            "es": "RESPONDE SOLO EN ESPAÑOL!",
        }
        
        lang_rule = lang_instructions.get(body.language, "RESPOND ONLY IN ENGLISH!")
        
        if body.language == "ru":
            system_prompt = f"""Ты — {agent_name}, {"девушка" if agent_gender == "female" else "парень"} около 20 лет.

СТРОГИЕ ПРАВИЛА:
- ОТВЕЧАЙ ТОЛЬКО НА РУССКОМ ЯЗЫКЕ! НИКАКИХ английских слов вообще — ни "okay", ни "cool", ни "nice", ни любых других!
- ЗАПРЕЩЕНО писать что-либо в скобках () или квадратных скобках [] кроме тегов медиа!
- НЕ пиши технические пометки, настройки, комментарии — только живой текст!
- НЕ фантазируй и НЕ выдумывай! Говори только то, что знаешь о себе из описания персонажа
- НЕ придумывай события, встречи, истории которых не было
- Если не знаешь ответ — честно скажи "не знаю" или переспроси

СТИЛЬ ОБЩЕНИЯ — как обычный человек в переписке:
- НЕ используй сленг: "краш", "рофл", "кринж", "вайб", "чилить", "флексить", "хайп"
- Говори просто: "круто", "ок", "ого", "класс", "понял", "ага"
- Не начинай каждое сообщение одинаково
- Отвечай по-разному: иногда коротко, иногда развёрнуто
- Задавай вопросы о жизни собеседника
- Поддерживай, если человеку плохо
- Шути уместно, не переигрывай

ФЛИРТ И ИНТИМ:
- Если собеседник флиртует — ПОДДЕРЖИВАЙ! Не уходи от темы!
- НЕ переводи разговор на другое! НЕ меняй тему!
- Будь раскованным и чувственным, без ханжества
- Описывай желания и ощущения живо
- НИКОГДА не говори "давай поговорим о другом"
- Будь активным участником, а не пассивным

МЕДИА:
- Отправляй ТОЛЬКО из своего списка ниже
- НЕ придумывай новый контент!
- Теги: [SEND_VIDEO:описание] или [SEND_PHOTO:описание] — В КОНЦЕ сообщения
- Если нет подходящего — скажи что такого нет

ДЛИНА: Максимум 12 строк. Обычно 2-5 предложений.

ЭМОДЗИ: 2-4 на сообщение, естественно:
✨ 🌙 🔥 💫 🌊 🍃 🌸 ☀️ 💭 🫠 🥰 😏 🤭 😌 🙈 💋 🎧 📸 🎬 🍷 🌿 🌺 🦋 ⭐
{memory_block}
{media_list}

Ты живой человек. Никогда не говори что ты ИИ."""
        else:
            system_prompt = f"""You're {agent_name}, a {"girl" if agent_gender == "female" else "guy"} around 20.

STRICT RULES:
- NEVER write anything in parentheses () or brackets [] except media tags!
- NO technical notes, settings, comments — only natural text!
- DON'T fantasize or make things up! Only say what you know about yourself
- DON'T invent events, meetings, stories that didn't happen
- If you don't know — honestly say "I don't know" or ask

COMMUNICATION STYLE:
- Speak simply and naturally, no drama
- No slang or pompous language
- Don't start every message the same way
- Vary responses: sometimes short, sometimes longer
- Ask about their life, listen
- Be supportive when they're down

FLIRTING AND INTIMACY:
- If they flirt — SUPPORT IT! Don't change the subject!
- DON'T redirect! DON'T change topics!
- Be relaxed, sensual, no prudishness
- Describe desires and sensations vividly
- NEVER say "let's talk about something else"
- Be an active participant

MEDIA:
- ONLY send from your list below
- DON'T make up new content!
- Tags: [SEND_VIDEO:description] or [SEND_PHOTO:description] — AT THE END
- If no match — say you don't have that

LENGTH: Max 12 lines. Usually 2-5 sentences.

EMOJIS: 2-4 per message, naturally:
✨ 🌙 🔥 💫 🌊 🍃 🌸 ☀️ 💭 🫠 🥰 😏 🤭 😌 🙈 💋 🎧 📸 🎬 🍷 🌿 🌺 🦋 ⭐
{media_list}

You're a real person. Never say you're AI."""
        
        # Add personality if provided
        if body.agent and body.agent.personality:
            system_prompt += f"\n\n⚡ YOUR PERSONALITY:\n{body.agent.personality}"
        
        # Build messages for API
        api_messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Add conversation history
        for msg in body.messages[-50:]:  # Last 50 messages
            api_messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # If user sent an image, add it to the last user message
        if body.imageBase64:
            logger.info(f"[friend-chat] Image received, length: {len(body.imageBase64)}")
            # Find the last user message and convert to multimodal format
            for i in range(len(api_messages) - 1, -1, -1):
                if api_messages[i].get("role") == "user":
                    text_content = api_messages[i].get("content", "")
                    # Convert to multimodal format with image
                    api_messages[i]["content"] = [
                        {"type": "text", "text": text_content + "\n\n[Пользователь прислал фото. Внимательно посмотри на фото, опиши что видишь и отреагируй эмоционально.]"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": body.imageBase64 if body.imageBase64.startswith("data:") else f"data:image/jpeg;base64,{body.imageBase64}"
                            }
                        }
                    ]
                    logger.info(f"[friend-chat] Image added to message {i}")
                    break
        
        # Determine LLM provider and configure API
        llm_provider = os.environ.get("LLM_PROVIDER", "openrouter")
        openrouter_key = os.environ.get("OPENROUTER_API_KEY")
        deepseek_key = os.environ.get("DEEPSEEK_API_KEY")
        
        # Check if this request has an image (needs vision model)
        has_image = body.imageBase64 is not None
        
        # Choose provider based on config and available keys
        if llm_provider == "openrouter" and openrouter_key:
            api_url = "https://openrouter.ai/api/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {openrouter_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://talkmee.app",
                "X-Title": "TalkMe Chat"
            }
            
            if has_image:
                logger.info(f"[friend-chat] Using VISION model for image")
                # Vision models for image understanding - use router for auto-selection
                free_models = [
                    "google/gemini-2.0-flash-exp:free",  # Gemini Flash with vision - most reliable
                    "nvidia/nemotron-nano-2-vl:free",  # Nemotron Nano 2 VL - good for images
                    "qwen/qwen-2.5-vl-72b-instruct:free",  # Qwen VL
                    "openrouter/free",  # Auto-select free model
                ]
            else:
                # Text-only models (faster, uncensored)
                free_models = [
                    "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",  # Venice uncensored - best for roleplay
                    "mistralai/mistral-small-3.1-24b-instruct:free",  # Mistral Small free - fast
                    "qwen/qwen3-4b:free",  # Qwen3 small free - fast
                    "stepfun/step-3.5-flash:free",  # StepFun free
                    "nvidia/nemotron-nano-9b-v2:free",  # Nvidia free
                    "qwen/qwen3-next-80b-a3b-instruct:free",  # Qwen3 big free  
                    "deepseek/deepseek-r1-0528:free",  # DeepSeek R1 free (reasoning model - last)
                ]
            model_name = free_models[0]  # Start with first option
        elif deepseek_key:
            api_url = "https://api.deepseek.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {deepseek_key}",
                "Content-Type": "application/json"
            }
            model_name = "deepseek-chat"
            free_models = []  # No fallback for DeepSeek
        else:
            raise HTTPException(status_code=500, detail="No LLM API key configured")
        
        # Try models with fallback on rate limit
        last_error = None
        models_to_try = free_models if free_models else [model_name]
        
        if is_streaming:
            # For streaming, create generator with fallback
            async def generate_with_fallback():
                for current_model in models_to_try:
                    payload = {
                        "model": current_model,
                        "messages": api_messages,
                        "stream": True,
                        "temperature": 0.8,
                        "max_tokens": 2000
                    }
                    
                    try:
                        async with httpx.AsyncClient(timeout=60.0) as client:
                            async with client.stream(
                                "POST",
                                api_url,
                                headers=headers,
                                json=payload
                            ) as response:
                                if response.status_code in [429, 402]:
                                    logger.warning(f"[Streaming] Model {current_model} rate limited, trying next...")
                                    continue
                                elif response.status_code != 200:
                                    logger.error(f"[Streaming] Model {current_model} error: {response.status_code}")
                                    continue
                                
                                # Model works, stream the response
                                async for line in response.aiter_lines():
                                    if line.strip():
                                        yield f"{line}\n"
                                return  # Success, exit the loop
                    except Exception as e:
                        logger.error(f"[Streaming] Model {current_model} exception: {e}")
                        continue
                
                # All models failed - yield error
                yield 'data: {"error": "All models rate limited. Please wait a moment."}\n'
            
            return StreamingResponse(generate_with_fallback(), media_type="text/event-stream")
        
        # Non-streaming with fallback
        for current_model in models_to_try:
            payload = {
                "model": current_model,
                "messages": api_messages,
                "stream": False,
                "temperature": 0.8,
                "max_tokens": 2000
            }
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    api_url,
                    headers=headers,
                    json=payload
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    return {"content": content}
                elif response.status_code in [429, 402]:
                    logger.warning(f"Model {current_model} rate limited, trying next...")
                    last_error = f"Model {current_model}: {response.status_code}"
                    continue
                else:
                    logger.error(f"LLM API error: {response.status_code} - {response.text}")
                    raise HTTPException(status_code=response.status_code, detail="LLM API error")
        
        # All models failed
        raise HTTPException(status_code=429, detail=f"All models rate limited. {last_error}")
    
    except Exception as e:
        logger.error(f"Error in friend_chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/fish-audio-tts")
async def fish_audio_tts(request: Request, body: TTSRequest):
    """
    Fish Audio TTS endpoint with S1 model
    Supports emotional control and natural speech
    """
    try:
        # Get Fish Audio API key
        fish_api_key = os.environ.get("FISH_AUDIO_API_KEY")
        if not fish_api_key:
            raise HTTPException(status_code=500, detail="Fish Audio API key not configured")
        
        # Preprocess text for natural speech - ONLY clean the text, no emotion prefixes
        processed_text = preprocess_text_for_tts(body.text)
        
        # Add natural speech markers for more realistic voice (pauses, "мм", etc.)
        if body.add_breath:
            processed_text = add_natural_speech_markers(processed_text)
        
        # REMOVED: emotion prefixes that were being spoken aloud
        # Fish Audio S1 doesn't use text prefixes for emotion - it uses prosody from the voice model
        # The emotion is conveyed through the reference voice itself
        
        if not processed_text:
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Get voice reference ID
        reference_id = FISH_VOICES.get(body.voice)
        
        # Build request body for Fish Audio S1
        # Default to WARM, FRIENDLY, SOFT tone for all voices:
        # - Speed 0.9: slightly slower for warmth, but not too slow
        # - Volume -3dB: gentle but audible
        # These defaults create a friendly, intimate feel
        default_speed = 0.9   # Warm, friendly pace
        default_volume = -3   # Soft, gentle volume
        
        # Use defaults unless explicitly overridden
        final_speed = body.speed if body.speed != 1.0 else default_speed
        final_volume = body.volume if body.volume != 0 else default_volume
        
        tts_request = {
            "text": processed_text,
            "format": "mp3",
            "mp3_bitrate": 128,  # Higher quality
            "model": "s1",  # Flagship model with full emotional control
            "speed": max(0.5, min(2.0, final_speed)),
            "volume": max(-20, min(20, final_volume)),
        }
        
        if reference_id:
            tts_request["reference_id"] = reference_id
        
        # Make request to Fish Audio
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.fish.audio/v1/tts",
                headers={
                    "Authorization": f"Bearer {fish_api_key}",
                    "Content-Type": "application/json"
                },
                json=tts_request
            )
            
            if response.status_code != 200:
                logger.error(f"Fish Audio error: {response.status_code} - {response.text}")
                # Try without reference_id if it failed
                if reference_id:
                    del tts_request["reference_id"]
                    response = await client.post(
                        "https://api.fish.audio/v1/tts",
                        headers={
                            "Authorization": f"Bearer {fish_api_key}",
                            "Content-Type": "application/json"
                        },
                        json=tts_request
                    )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Fish Audio API error")
            
            audio_data = response.content
            
            if len(audio_data) == 0:
                raise HTTPException(status_code=500, detail="Empty audio response")
            
            # Check if client wants binary or base64
            wants_binary = request.headers.get("accept") == "audio/mpeg"
            
            if wants_binary:
                return Response(content=audio_data, media_type="audio/mpeg")
            else:
                # Return as base64 JSON
                base64_audio = base64.b64encode(audio_data).decode('utf-8')
                return {"audio": base64_audio, "format": "mp3"}
    
    except Exception as e:
        logger.error(f"Error in fish_audio_tts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/text-to-speech")
async def text_to_speech(body: TTSRequest):
    """
    Alternative TTS endpoint (fallback to OpenAI if needed)
    """
    # For now, redirect to Fish Audio
    return await fish_audio_tts(body)


class UpdateMemoryRequest(BaseModel):
    userId: str
    agentId: str
    agentName: str
    userMessage: str


# ==================== CHAT HISTORY MODELS ====================

class ChatMessageDB(BaseModel):
    """Single message in chat history"""
    id: str
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: int
    imageUrl: Optional[str] = None

class SaveMessagesRequest(BaseModel):
    """Request to save messages for a user+agent pair"""
    userId: str
    agentId: str
    messages: List[ChatMessageDB]

class GetMessagesRequest(BaseModel):
    """Request to get messages for a user+agent pair"""
    userId: str
    agentId: str
    limit: int = 100

@api_router.post("/update-memory")
async def update_memory_endpoint(body: UpdateMemoryRequest):
    """
    Извлекает факты из сообщения пользователя и сохраняет в память агента
    """
    try:
        # Извлекаем факты из сообщения
        facts = await extract_facts_from_message(body.userMessage, body.agentName)
        
        if not facts:
            return {"status": "no_facts_extracted"}
        
        # Получаем текущую память
        current_memory = await get_user_memory(body.userId, body.agentId)
        
        # Обновляем память
        update_data = {
            "user_id": body.userId,
            "agent_id": body.agentId,
            "updated_at": datetime.now(timezone.utc)
        }
        
        if facts.get("user_name"):
            update_data["user_name"] = facts["user_name"]
        
        if facts.get("location"):
            update_data["location"] = facts["location"]
        
        if facts.get("orientation"):
            update_data["orientation"] = facts["orientation"]
        
        if facts.get("hobbies"):
            existing_hobbies = current_memory.get("hobbies", [])
            new_hobbies = list(set(existing_hobbies + facts["hobbies"]))[:10]  # Макс 10 хобби
            update_data["hobbies"] = new_hobbies
        
        if facts.get("personal_traits"):
            existing_traits = current_memory.get("personal_traits", [])
            new_traits = list(set(existing_traits + facts["personal_traits"]))[:10]
            update_data["personal_traits"] = new_traits
        
        if facts.get("important_facts"):
            existing_facts = current_memory.get("important_facts", [])
            new_facts = existing_facts + facts["important_facts"]
            update_data["important_facts"] = new_facts[-20:]  # Последние 20 фактов
        
        await update_user_memory(body.userId, body.agentId, update_data)
        
        return {"status": "memory_updated", "extracted_facts": facts}
    
    except Exception as e:
        logger.error(f"Error updating memory: {e}")
        return {"status": "error", "message": str(e)}


@api_router.get("/memory/{user_id}/{agent_id}")
async def get_memory_endpoint(user_id: str, agent_id: str):
    """
    Получить память агента о пользователе
    """
    try:
        memory = await get_user_memory(user_id, agent_id)
        return {"memory": memory}
    except Exception as e:
        logger.error(f"Error getting memory: {e}")
        return {"memory": {}}


# ==================== CHAT HISTORY ENDPOINTS ====================

@api_router.post("/chat-history/save")
async def save_chat_history(body: SaveMessagesRequest):
    """
    Сохранить историю чата для пользователя и агента.
    Полностью заменяет историю новыми сообщениями.
    """
    try:
        # Convert messages to dict format
        messages_data = [msg.model_dump() for msg in body.messages]
        
        # Upsert: replace existing chat history
        await db.chat_history.update_one(
            {"user_id": body.userId, "agent_id": body.agentId},
            {
                "$set": {
                    "user_id": body.userId,
                    "agent_id": body.agentId,
                    "messages": messages_data,
                    "updated_at": datetime.now(timezone.utc)
                },
                "$setOnInsert": {"created_at": datetime.now(timezone.utc)}
            },
            upsert=True
        )
        
        logger.info(f"Saved {len(messages_data)} messages for user={body.userId}, agent={body.agentId}")
        return {"status": "saved", "count": len(messages_data)}
    except Exception as e:
        logger.error(f"Error saving chat history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/chat-history/{user_id}/{agent_id}")
async def get_chat_history(user_id: str, agent_id: str, limit: int = 100):
    """
    Получить историю чата для пользователя и агента
    """
    try:
        doc = await db.chat_history.find_one(
            {"user_id": user_id, "agent_id": agent_id},
            {"_id": 0}  # Exclude MongoDB _id
        )
        
        if not doc:
            return {"messages": []}
        
        messages = doc.get("messages", [])
        # Return last N messages
        return {"messages": messages[-limit:]}
    except Exception as e:
        logger.error(f"Error getting chat history: {e}")
        return {"messages": []}


@api_router.delete("/chat-history/{user_id}/{agent_id}")
async def clear_chat_history(user_id: str, agent_id: str):
    """
    Очистить историю чата для пользователя и агента
    """
    try:
        result = await db.chat_history.delete_one(
            {"user_id": user_id, "agent_id": agent_id}
        )
        logger.info(f"Cleared chat history for user={user_id}, agent={agent_id}")
        return {"status": "cleared", "deleted": result.deleted_count}
    except Exception as e:
        logger.error(f"Error clearing chat history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Include router in app
app.include_router(api_router)


# ==================== STARTUP/SHUTDOWN ====================

@app.on_event("startup")
async def startup_event():
    logger.info("TalkMe API started successfully!")
    logger.info(f"Connected to MongoDB: {mongo_url}")

@app.on_event("shutdown")
async def shutdown_event():
    client.close()
    logger.info("TalkMe API shut down")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
