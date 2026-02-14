import { useState } from 'react';
import { Play, Square, Check, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/translations';
import { VoiceId, isFishVoice } from '@/lib/storage';

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`;
const FISH_TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fish-audio-tts`;

type VoiceCategory = 'male' | 'female' | 'child' | 'premium';

interface Voice {
  id: VoiceId;
  name: string;
  description: { ru: string; en: string };
  category: VoiceCategory;
  isPremium?: boolean;
}

const voices: Voice[] = [
  // Fish Audio Premium voices
  { 
    id: 'fish_aria', 
    name: 'Aria ✨', 
    description: { ru: 'Реалистичный, мягкий женский', en: 'Realistic, soft female' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_roger', 
    name: 'Roger ✨', 
    description: { ru: 'Реалистичный, уверенный мужской', en: 'Realistic, confident male' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_sarah', 
    name: 'Sarah ✨', 
    description: { ru: 'Тёплый, дружелюбный женский', en: 'Warm, friendly female' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_charlie', 
    name: 'Charlie ✨', 
    description: { ru: 'Молодой, энергичный мужской', en: 'Young, energetic male' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_egirl', 
    name: 'Жириновский ✨', 
    description: { ru: 'Эмоциональный, громкий', en: 'Emotional, loud' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_alina', 
    name: 'Алина ✨', 
    description: { ru: 'Реалистичный женский', en: 'Realistic female' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_brad_pitt', 
    name: 'Брэд Питт ✨', 
    description: { ru: 'Дубляж Кузнецова', en: 'Kuznetsov dubbing style' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_nasal_90s', 
    name: 'Гнусавый 90-х ✨', 
    description: { ru: 'Ретро-дубляж', en: 'Retro 90s dubbing' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_child', 
    name: 'Детский ✨', 
    description: { ru: 'Детский голос', en: 'Child voice' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_flora', 
    name: 'Фея Флора ✨', 
    description: { ru: 'Сказочный женский', en: 'Fairy tale female' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_sobchak', 
    name: 'Собчак ✨', 
    description: { ru: 'ТВ-ведущая', en: 'TV host style' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_tinkov' as VoiceId, 
    name: 'Тиньков ✨', 
    description: { ru: 'Бизнес, дерзкий', en: 'Business, bold' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_egirl_real' as VoiceId, 
    name: 'E-girl ✨', 
    description: { ru: 'Кавайный, игривый', en: 'Kawaii, playful' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_drug' as VoiceId, 
    name: 'Друг ✨', 
    description: { ru: 'Голос Лукаса — тёплый, дружеский', en: 'Lucas\'s voice — warm, friendly' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_mironov' as VoiceId, 
    name: 'Андрей Миронов ✨', 
    description: { ru: 'Обаятельный, ироничный', en: 'Charming, ironic' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_bodrov' as VoiceId, 
    name: 'Сергей Бодров ✨', 
    description: { ru: 'Спокойный, мужественный', en: 'Calm, masculine' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_shirvindt' as VoiceId, 
    name: 'Анатолий Ширвиндт ✨', 
    description: { ru: 'Остроумный, интеллигентный', en: 'Witty, intelligent' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_sherlock' as VoiceId, 
    name: 'Шерлок Холмс ✨', 
    description: { ru: 'Аналитичный, загадочный', en: 'Analytical, mysterious' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_mikhalkov' as VoiceId, 
    name: 'Никита Михалков ✨', 
    description: { ru: 'Авторитетный, барский', en: 'Authoritative, lordly' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_mordyukova' as VoiceId, 
    name: 'Нонна Мордюкова ✨', 
    description: { ru: 'Сильный, народный женский', en: 'Strong, folk female' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_papanov' as VoiceId, 
    name: 'Анатолий Папанов ✨', 
    description: { ru: 'Характерный, комедийный', en: 'Distinctive, comedic' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_litvinova' as VoiceId, 
    name: 'Рената Литвинова ✨', 
    description: { ru: 'Томный, загадочный женский', en: 'Languid, mysterious female' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_vysotsky' as VoiceId, 
    name: 'Владимир Высоцкий ✨', 
    description: { ru: 'Хриплый, надрывный', en: 'Raspy, intense' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_mironov2' as VoiceId, 
    name: 'Андрей Миронов (2) ✨', 
    description: { ru: 'Обаятельный, театральный', en: 'Charming, theatrical' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_evstigneev' as VoiceId, 
    name: 'Евгений Евстигнеев ✨', 
    description: { ru: 'Мудрый, проникновенный', en: 'Wise, soulful' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_pugacheva' as VoiceId, 
    name: 'Алла Пугачёва ✨', 
    description: { ru: 'Яркий, звёздный женский', en: 'Bright, star female' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_urgant' as VoiceId, 
    name: 'Иван Ургант ✨', 
    description: { ru: 'Весёлый, телеведущий', en: 'Fun, TV host' }, 
    category: 'premium',
    isPremium: true,
  },
  { 
    id: 'fish_lagutenko' as VoiceId, 
    name: 'Илья Лагутенко ✨', 
    description: { ru: 'Эксцентричный, музыкальный', en: 'Eccentric, musical' }, 
    category: 'premium',
    isPremium: true,
  },
];
// Example phrases showing voice character/personality
const voiceExamples: Record<VoiceId, { ru: string; en: string }> = {
  fish_aria: { 
    ru: '"Знаешь, иногда лучше просто поговорить..."', 
    en: '"You know, sometimes it\'s better to just talk..."' 
  },
  fish_roger: { 
    ru: '"Слушай, у меня есть идея получше"', 
    en: '"Listen, I\'ve got a better idea"' 
  },
  fish_sarah: { 
    ru: '"Расскажи мне всё, я внимательно слушаю"', 
    en: '"Tell me everything, I\'m listening carefully"' 
  },
  fish_charlie: { 
    ru: '"Оу, это круто! Давай попробуем!"', 
    en: '"Oh, that\'s cool! Let\'s try it!"' 
  },
  fish_egirl: { 
    ru: '"Однозначно! Я вам точно говорю!"', 
    en: '"Absolutely! I\'m telling you for sure!"' 
  },
  fish_alina: { 
    ru: '"Привет! Как прошёл твой день?"', 
    en: '"Hi! How was your day?"' 
  },
  fish_brad_pitt: { 
    ru: '"Знаешь, я тут подумал..."', 
    en: '"You know, I was thinking..."' 
  },
  fish_nasal_90s: { 
    ru: '"Ну что, погнали, чувак!"', 
    en: '"Alright, let\'s roll, dude!"' 
  },
  fish_child: { 
    ru: '"А давай поиграем! Будет весело!"', 
    en: '"Let\'s play! It\'ll be fun!"' 
  },
  fish_flora: { 
    ru: '"Волшебство повсюду, нужно лишь поверить ✨"', 
    en: '"Magic is everywhere, you just need to believe ✨"' 
  },
  fish_sobchak: { 
    ru: '"Окей, давай разберёмся в этом!"', 
    en: '"Okay, let\'s figure this out!"' 
  },
  fish_tinkov: { 
    ru: '"Хватит ныть, иди и делай бизнес!"', 
    en: '"Stop whining, go and do business!"' 
  },
  fish_egirl_real: { 
    ru: '"Ой, ну привеeet! Ты такой милый~"', 
    en: '"Omg hiiii! You\'re so cute~"' 
  },
  fish_drug: { 
    ru: '"Слушай, я рядом. Всё будет нормально"', 
    en: '"Hey, I\'m here. Everything will be fine"' 
  },
  fish_mironov: { 
    ru: '"Ну что вы, право, какие пустяки!"', 
    en: '"Oh come on, what trifles!"' 
  },
  fish_bodrov: { 
    ru: '"В чём сила, брат? Сила в правде"', 
    en: '"What is strength, brother? Strength is in truth"' 
  },
  fish_shirvindt: { 
    ru: '"Знаете, юмор — это серьёзная вещь"', 
    en: '"You know, humor is a serious thing"' 
  },
  fish_sherlock: { 
    ru: '"Элементарно, мой дорогой Ватсон"', 
    en: '"Elementary, my dear Watson"' 
  },
  fish_mikhalkov: { 
    ru: '"Я вам так скажу, друзья мои..."', 
    en: '"I\'ll tell you this, my friends..."' 
  },
  fish_mordyukova: { 
    ru: '"Ничего, мы люди привычные"', 
    en: '"It\'s alright, we\'re used to it"' 
  },
  fish_papanov: { 
    ru: '"Шутить изволите? Ну-ну..."', 
    en: '"You dare joke? Well well..."' 
  },
  fish_litvinova: { 
    ru: '"Это так... волнующе и странно"', 
    en: '"This is so... exciting and strange"' 
  },
  fish_vysotsky: { 
    ru: '"Я не люблю, когда мне лезут в душу"', 
    en: '"I don\'t like when they pry into my soul"' 
  },
  fish_mironov2: { 
    ru: '"Позвольте, я вам всё объясню!"', 
    en: '"Allow me, I\'ll explain everything!"' 
  },
  fish_evstigneev: { 
    ru: '"Тут, понимаете ли, такое дело..."', 
    en: '"You see, the thing is..."' 
  },
  fish_pugacheva: { 
    ru: '"Всё, хватит! Позвоните мне, позвоните"', 
    en: '"Enough! Call me, call me"' 
  },
  fish_urgant: { 
    ru: '"Вечерний Ургант приветствует вас!"', 
    en: '"Evening Urgant welcomes you!"' 
  },
  fish_lagutenko: { 
    ru: '"Ты знаешь, мне снились дельфины..."', 
    en: '"You know, I dreamed of dolphins..."' 
  },
  fish_kartunkova: { 
    ru: '"Ой, ну ты меня рассмешил!"', 
    en: '"Oh, you made me laugh!"' 
  },
};

const sampleTexts = {
  ru: 'Привет! Я рад, что ты здесь. Можем просто поговорить или помолчать вместе.',
  en: "Hi! I'm glad you're here. We can just talk or sit in silence together.",
};

interface VoiceSelectorProps {
  language: Language;
  selectedVoice: VoiceId;
  onVoiceChange: (voice: VoiceId) => void;
}

export const VoiceSelector = ({ language, selectedVoice, onVoiceChange }: VoiceSelectorProps) => {
  const [playingVoice, setPlayingVoice] = useState<VoiceId | null>(null);
  const [loadingVoice, setLoadingVoice] = useState<VoiceId | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  const playPreview = async (voiceId: VoiceId) => {
    // Stop current audio if playing
    if (audioRef) {
      audioRef.pause();
      setAudioRef(null);
    }

    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      return;
    }

    setLoadingVoice(voiceId);

    try {
      // Choose endpoint based on voice type
      const isFish = isFishVoice(voiceId);
      const url = isFish ? FISH_TTS_URL : TTS_URL;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          text: sampleTexts[language], 
          language,
          voice: voiceId,
        }),
      });

      if (!response.ok) throw new Error('TTS request failed');

      const data = await response.json();
      
      if (data.audio) {
        const audioUrl = `data:audio/mp3;base64,${data.audio}`;
        const audio = new Audio(audioUrl);
        setAudioRef(audio);

        audio.onended = () => {
          setPlayingVoice(null);
          setAudioRef(null);
        };

        audio.onerror = () => {
          setPlayingVoice(null);
          setAudioRef(null);
        };

        setPlayingVoice(voiceId);
        await audio.play();
      }
    } catch (error) {
      console.error('Preview error:', error);
    } finally {
      setLoadingVoice(null);
    }
  };

  const stopPreview = () => {
    if (audioRef) {
      audioRef.pause();
      setAudioRef(null);
    }
    setPlayingVoice(null);
  };

  const t = {
    ru: { title: 'Голос', select: 'Выбрать' },
    en: { title: 'Voice', select: 'Select' },
  };

  const renderVoiceList = (voiceList: Voice[]) => (
    <div className="grid gap-2">
      {voiceList.map((voice) => (
        <div
          key={voice.id}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg border transition-all',
            selectedVoice === voice.id
              ? 'border-primary bg-primary/5'
              : 'border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent hover:border-amber-500/50'
          )}
        >
          <button
            onClick={() => playingVoice === voice.id ? stopPreview() : playPreview(voice.id)}
            disabled={loadingVoice !== null && loadingVoice !== voice.id}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              playingVoice === voice.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
            )}
          >
            {loadingVoice === voice.id ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : playingVoice === voice.id ? (
              <Square className="w-4 h-4" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium flex items-center gap-1.5">
              {voice.name}
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-sm text-muted-foreground">{voice.description[language]}</div>
            <div className="text-xs text-muted-foreground/60 italic mt-1">
              {voiceExamples[voice.id][language]}
            </div>
          </div>

          <button
            onClick={() => onVoiceChange(voice.id)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              selectedVoice === voice.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
            )}
          >
            {selectedVoice === voice.id ? (
              <Check className="w-4 h-4" />
            ) : (
              t[language].select
            )}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h3 className="font-medium text-sm text-amber-600 dark:text-amber-400">{t[language].title}</h3>
        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Fish Audio</span>
      </div>
      {renderVoiceList(voices)}
    </div>
  );
};

// Re-export VoiceId from storage for backwards compatibility
export type { VoiceId } from '@/lib/storage';
