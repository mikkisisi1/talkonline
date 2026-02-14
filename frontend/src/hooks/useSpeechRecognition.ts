import { useState, useCallback, useRef, useEffect } from 'react';
import { Language } from '@/lib/translations';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const PAUSE_TIMEOUT = 5000;

function getSpeechAPI(): (new () => SpeechRecognition) | null {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * Remove obvious repetition loops from transcript.
 * E.g. "Да София привет Да София привет Да София привет" → "Да София привет"
 */
function deduplicateTranscript(text: string): string {
  if (!text) return text;
  const words = text.split(/\s+/);
  if (words.length < 6) return text;

  // Try phrase lengths from 2 to 8 words
  for (let pLen = 2; pLen <= Math.min(8, Math.floor(words.length / 2)); pLen++) {
    const phrase = words.slice(0, pLen).join(' ').toLowerCase();
    let copies = 0;
    let i = 0;
    while (i + pLen <= words.length) {
      const chunk = words.slice(i, i + pLen).join(' ').toLowerCase();
      if (chunk === phrase) {
        copies++;
        i += pLen;
      } else {
        break;
      }
    }
    if (copies >= 2) {
      // Keep phrase once + remainder
      const remainder = words.slice(copies * pLen).join(' ');
      const cleaned = words.slice(0, pLen).join(' ') + (remainder ? ' ' + remainder : '');
      return deduplicateTranscript(cleaned); // recurse for nested patterns
    }
  }

  // Also remove 3+ consecutive identical words
  let result = text.replace(/(\b\S+\b)(\s+\1){2,}/gi, '$1');
  return result.trim();
}

export const useSpeechRecognition = (language: Language) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported] = useState(() => !!getSpeechAPI());

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const isListeningRef = useRef(false);
  const languageRef = useRef(language);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      isListeningRef.current = false;
      try { recognitionRef.current?.abort(); } catch (_) { /* ignore */ }
      recognitionRef.current = null;
    };
  }, []);

  const clearPauseTimer = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }, []);

  /**
   * Single-session speech recognition.
   * Uses continuous:false to avoid duplication on mobile.
   * No auto-restart — one press = one utterance.
   */
  const startListening = useCallback(() => {
    const API = getSpeechAPI();
    if (!API) {
      console.error('[SR] Speech API not available');
      return;
    }

    console.log('[SR] Starting speech recognition, lang:', languageRef.current);

    if (isListeningRef.current) {
      isListeningRef.current = false;
      try { recognitionRef.current?.abort(); } catch (_) { /* ignore */ }
      recognitionRef.current = null;
      setIsListening(false);
    }

    setTranscript('');

    const recognition = new API();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = languageRef.current === 'ru' ? 'ru-RU' : 'en-US';
    recognitionRef.current = recognition;

    let finalText = '';
    let lastInterim = '';

    const stopFully = () => {
      isListeningRef.current = false;
      clearPauseTimer();
      try { recognition.abort(); } catch (_) { /* ignore */ }
      const cleaned = deduplicateTranscript(finalText || lastInterim);
      if (cleaned) setTranscript(cleaned);
      setIsListening(false);
    };

    const resetPauseTimer = () => {
      clearPauseTimer();
      pauseTimerRef.current = window.setTimeout(() => {
        stopFully();
      }, PAUSE_TIMEOUT);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const text = r[0].transcript.trim();
        if (!text) continue;
        if (r.isFinal) {
          finalText = text; // continuous:false gives one final result
          lastInterim = '';
        } else {
          lastInterim = text;
        }
      }
      const display = finalText || lastInterim;
      if (display) setTranscript(display);
      resetPauseTimer();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[SR] Error:', event.error);
      if (event.error === 'aborted') return;
      if (event.error === 'no-speech') {
        // Just stop gracefully
        stopFully();
        return;
      }
      if (event.error === 'not-allowed') {
        console.error('[SR] Microphone permission denied');
      }
      stopFully();
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        // Clean up and finalize
        const cleaned = deduplicateTranscript(finalText || lastInterim);
        if (cleaned) setTranscript(cleaned);
      }
      isListeningRef.current = false;
      setIsListening(false);
      clearPauseTimer();
    };

    recognition.onstart = () => {
      setIsListening(true);
      resetPauseTimer();
    };

    isListeningRef.current = true;
    try {
      recognition.start();
    } catch (e) {
      console.error('[SR] start error:', e);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [clearPauseTimer]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    clearPauseTimer();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) { /* ignore */ }
    }
    setIsListening(false);
  }, [clearPauseTimer]);

  return { isListening, transcript, isSupported, startListening, stopListening };
};
