import { useCallback, useRef, useState } from 'react';
import { Language } from '@/lib/translations';
import { VoiceId, isFishVoice } from '@/lib/storage';
import { playBlobWithSharedAudio } from '@/lib/audioUnlock';

const TTS_URL = `${import.meta.env.VITE_BACKEND_URL}/api/text-to-speech`;
const FISH_TTS_URL = `${import.meta.env.VITE_BACKEND_URL}/api/fish-audio-tts`;

/** Strip emoji and other non-speech symbols from text */
function stripEmoji(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{1F3FB}-\u{1F3FF}\u{E0020}-\u{E007F}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Fetch TTS audio for the full text and return a blob URL */
async function fetchTts(
  text: string,
  language: Language,
  voiceId: VoiceId,
  voiceSpeed: number,
  signal: AbortSignal,
): Promise<string | null> {
  const isFish = isFishVoice(voiceId);
  const url = isFish ? FISH_TTS_URL : TTS_URL;

  const body: Record<string, unknown> = {
    text: stripEmoji(text),
    language,
    voice: voiceId,
    speed: voiceSpeed,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      'Accept': isFish ? 'audio/mpeg' : 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) throw new Error('TTS request failed');

  if (isFish) {
    const blob = await response.blob();
    if (blob.size < 100) {
      console.error('[TTS] Empty audio blob from Fish TTS:', blob.size);
      throw new Error('Empty audio response');
    }
    return URL.createObjectURL(blob);
  } else {
    const data = await response.json();
    if (!data.audio) return null;
    const audioBytes = atob(data.audio);
    const audioArray = new Uint8Array(audioBytes.length);
    for (let i = 0; i < audioBytes.length; i++) {
      audioArray[i] = audioBytes.charCodeAt(i);
    }
    const audioBlob = new Blob([audioArray], { type: 'audio/mp3' });
    return URL.createObjectURL(audioBlob);
  }
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
