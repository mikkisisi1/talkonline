import { useCallback, useRef, useState } from 'react';
import { Language } from '@/lib/translations';
import { VoiceId, isFishVoice } from '@/lib/storage';
import { playBlobWithSharedAudio } from '@/lib/audioUnlock';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const FISH_TTS_URL = `${BACKEND_URL}/fish-audio-tts`;

/** Strip emoji and other non-speech symbols from text */
function stripEmoji(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{1F3FB}-\u{1F3FF}\u{E0020}-\u{E007F}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Detect emotion from text content */
function detectEmotion(text: string): string | undefined {
  const lower = text.toLowerCase();
  
  // Flirty/seductive
  if (lower.match(/секретн|альбом|покажу|соблазн|желан|страст|хочу тебя|поцелу/)) {
    return 'flirty';
  }
  // Happy/excited
  if (lower.match(/ха-ха|хаха|круто|класс|ура|обожаю|люблю|счастлив|радост/)) {
    return 'happy';
  }
  // Tender/soft
  if (lower.match(/нежн|милый|дорогой|солнц|родной|скучаю|обним/)) {
    return 'tender';
  }
  // Playful
  if (lower.match(/шутк|прикол|игрив|\?\s*😏|хитр/)) {
    return 'playful';
  }
  // Sad
  if (lower.match(/грустн|печальн|жаль|увы|к сожален/)) {
    return 'sad';
  }
  // Calm (default for long thoughtful messages)
  if (text.length > 200) {
    return 'calm';
  }
  
  return undefined;
}

/** Fetch TTS audio for the full text and return a blob URL */
async function fetchTts(
  text: string,
  language: Language,
  voiceId: VoiceId,
  voiceSpeed: number,
  signal: AbortSignal,
): Promise<string | null> {
  const cleanText = stripEmoji(text);
  const emotion = detectEmotion(text);
  
  // Apply warm, friendly defaults:
  // - Speed capped at 0.95 for warmth (unless user explicitly wants faster)
  // - Volume -3dB for soft, gentle feel
  const warmSpeed = Math.min(voiceSpeed, 0.95);
  
  const body: Record<string, unknown> = {
    text: cleanText,
    language,
    voice: voiceId,
    speed: warmSpeed,
    volume: -3,  // Soft, friendly volume
    emotion: emotion,
    add_breath: true,  // Natural breathing
  };

  const response = await fetch(FISH_TTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    console.error('[TTS] Request failed:', response.status);
    throw new Error('TTS request failed');
  }

  const blob = await response.blob();
  if (blob.size < 100) {
    console.error('[TTS] Empty audio blob:', blob.size);
    throw new Error('Empty audio response');
  }
  return URL.createObjectURL(blob);
}

/** Generate a soft exhale sound via Web Audio API */
export function playExhale(duration = 0.45): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = Math.ceil(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        const envelope = t < 0.05 ? t / 0.05 : Math.pow(1 - (t - 0.05) / 0.95, 2);
        data[i] = (Math.random() * 2 - 1) * envelope * 0.06;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 0.5;

      source.connect(filter);
      filter.connect(ctx.destination);

      source.onended = () => { ctx.close(); resolve(); };
      source.start();
    } catch {
      resolve();
    }
  });
}

export const useSpeechSynthesis = (language: Language, voiceId: VoiceId = 'fish_brad_pitt', voiceSpeed: number = 1.0) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const stopHandleRef = useRef<(() => void) | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef(0);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Cancel any ongoing speech
    if (stopHandleRef.current) {
      stopHandleRef.current();
      stopHandleRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const sid = ++sessionIdRef.current;
    setIsLoading(true);
    setIsSpeaking(false);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const audioUrl = await fetchTts(text, language, voiceId, voiceSpeed, controller.signal);
      if (controller.signal.aborted || sessionIdRef.current !== sid) return;
      if (!audioUrl) {
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSpeaking(true);

      const { stop, ended } = playBlobWithSharedAudio(audioUrl, 1.0, 0.8);
      stopHandleRef.current = stop;

      await ended;
      URL.revokeObjectURL(audioUrl);
      if (sessionIdRef.current !== sid) return;

      await playExhale();
      if (sessionIdRef.current !== sid) return;
      setIsSpeaking(false);
      stopHandleRef.current = null;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('[TTS] Error:', error);
      }
      setIsSpeaking(false);
      setIsLoading(false);
      stopHandleRef.current = null;
    }
  }, [language, voiceId, voiceSpeed]);

  /** Play a soft "хм" cutoff sound */
  const playHmCutoff = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }, []);

  const stop = useCallback(() => {
    const wasSpeaking = isSpeaking;
    sessionIdRef.current++;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (stopHandleRef.current) {
      stopHandleRef.current();
      stopHandleRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoading(false);
    if (wasSpeaking) playHmCutoff();
  }, [isSpeaking, playHmCutoff]);

  return {
    isSupported: true,
    isSpeaking,
    isLoading,
    speak,
    stop,
  };
};
