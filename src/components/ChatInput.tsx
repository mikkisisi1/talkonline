import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, MicOff, Camera, Paperclip, Smile, X, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language, translations } from '@/lib/translations';
import { useMicroReaction } from '@/hooks/useMicroReaction';
import { unlockAudioOnce } from '@/lib/audioUnlock';

interface ChatInputProps {
  onSend: (message: string) => void;
  onSendImage?: (imageUrl: string) => void;
  disabled?: boolean;
  language: Language;
  voiceEnabled: boolean;
  isListening: boolean;
  isVoiceSupported: boolean;
  onVoiceStart: () => void;
  onVoiceStop: () => void;
  voiceTranscript: string;
  onMicroReaction?: () => void;
}

const AUTO_SEND_DELAY = 2000; // 2 seconds
const MICRO_REACTION_DELAY = 450; // ~400-500ms after send

export const ChatInput = ({
  onSend,
  onSendImage,
  disabled,
  language,
  voiceEnabled,
  isListening,
  isVoiceSupported,
  onVoiceStart,
  onVoiceStop,
  voiceTranscript,
  onMicroReaction,
}: ChatInputProps) => {
  const [text, setText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const autoSendTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { playMicroReaction } = useMicroReaction();
  const t = translations[language];

  // Keep latest values in refs so voice auto-send doesn't re-trigger on `disabled` changes
  const latestDisabledRef = useRef<boolean>(!!disabled);
  const latestPreviewImageRef = useRef<string | null>(previewImage);
  const latestOnSendRef = useRef(onSend);
  const latestOnMicroReactionRef = useRef(onMicroReaction);

  const lastVoiceScheduledRef = useRef<string>('');
  const lastVoiceSentRef = useRef<string>('');

  useEffect(() => {
    latestDisabledRef.current = !!disabled;
  }, [disabled]);

  useEffect(() => {
    latestPreviewImageRef.current = previewImage;
  }, [previewImage]);

  useEffect(() => {
    latestOnSendRef.current = onSend;
  }, [onSend]);

  useEffect(() => {
    latestOnMicroReactionRef.current = onMicroReaction;
  }, [onMicroReaction]);

  // Clear auto-send timer on unmount
  useEffect(() => {
    return () => {
      if (autoSendTimerRef.current) {
        clearTimeout(autoSendTimerRef.current);
      }
    };
  }, []);

  // Auto-send logic: send after 2 seconds of no typing
  // Uses refs to avoid stale closure issues when parent re-renders during the timer
  const handleTextChange = useCallback((newText: string) => {
    // Typing is a user gesture — use it to unlock audio for upcoming TTS.
    unlockAudioOnce();

    setText(newText);
    
    // Clear existing timer
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }
    
    // Only set timer if there's text and not disabled
    const trimmed = newText.trim();
    if (trimmed && !latestDisabledRef.current && !latestPreviewImageRef.current) {
      autoSendTimerRef.current = setTimeout(() => {
        // Use refs to get latest callbacks (avoids stale closures)
        if (latestDisabledRef.current) return;

        latestOnSendRef.current(trimmed);
        setText('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
        
        // Play micro-reaction after delay
        setTimeout(() => {
          playMicroReaction();
          latestOnMicroReactionRef.current?.();
        }, MICRO_REACTION_DELAY);
        
      }, AUTO_SEND_DELAY);
    }
  }, [playMicroReaction]);

  // Voice: sync transcript into input and schedule ONE auto-send when listening stops.
  // Important: do NOT depend on `disabled` here, otherwise the effect re-runs when the agent starts/finishes replying,
  // which can schedule duplicate sends for the same transcript.
  useEffect(() => {
    if (!voiceTranscript || isListening) return;

    const trimmed = voiceTranscript.trim();
    setText(trimmed);

    if (!trimmed) return;

    // Prevent re-scheduling the same final transcript (some browsers emit it multiple times)
    if (trimmed === lastVoiceScheduledRef.current || trimmed === lastVoiceSentRef.current) return;

    lastVoiceScheduledRef.current = trimmed;

    // Clear any existing timer
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }

    // Only schedule if allowed right now (same rules as typed input)
    if (!latestDisabledRef.current && !latestPreviewImageRef.current) {
      autoSendTimerRef.current = setTimeout(() => {
        // Mark as sent to avoid later re-sends
        lastVoiceSentRef.current = trimmed;

        if (latestDisabledRef.current) return;

        latestOnSendRef.current(trimmed);
        setText('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }

        setTimeout(() => {
          playMicroReaction();
          latestOnMicroReactionRef.current?.();
        }, MICRO_REACTION_DELAY);
      }, AUTO_SEND_DELAY);
    }
  }, [voiceTranscript, isListening, playMicroReaction]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    // Manual send is also a user gesture — unlock audio.
    unlockAudioOnce();

    // Clear auto-send timer on manual submit
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }
    
    if (previewImage) {
      onSendImage?.(previewImage);
      setPreviewImage(null);
      return;
    }
    
    const trimmed = text.trim();
    if (trimmed && !latestDisabledRef.current) {
      latestOnSendRef.current(trimmed);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Play micro-reaction after manual send too
      setTimeout(() => {
        playMicroReaction();
        latestOnMicroReactionRef.current?.();
      }, MICRO_REACTION_DELAY);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const playMicChime = useCallback(async () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }, []);

  const handleVoiceClick = () => {
    // Mic button is a user gesture — unlock audio for upcoming TTS.
    unlockAudioOnce();

    if (isListening) {
      onVoiceStop();
    } else {
      // CRITICAL: start recognition FIRST (needs user gesture), chime after
      onVoiceStart();
      playMicChime();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
        setShowAttachMenu(false);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        // Auto-send immediately
        onSendImage?.(dataUrl);
        setShowAttachMenu(false);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  const showVoiceButton = voiceEnabled && isVoiceSupported && !text.trim() && !previewImage && !disabled;
  const canSend = (text.trim() || previewImage) && !disabled;

  return (
    <div className="pl-2 pr-1 pt-1.5 pb-2 safe-area-bottom">
      {/* Image Preview */}
      {previewImage && (
        <div className="mb-1.5 relative inline-block">
          <img 
            src={previewImage} 
            alt="Preview" 
            className="max-h-24 rounded-lg"
          />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Attachment Menu */}
      {showAttachMenu && (
        <div className="absolute bottom-16 left-3 bg-[hsl(210,10%,18%/0.95)] backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-1.5 flex gap-1.5 z-50">
          <button
            onClick={() => { fileInputRef.current?.click(); setShowAttachMenu(false); }}
            className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[hsl(185,100%,35%)] flex items-center justify-center">
              <Image className="w-5 h-5 text-white stroke-[1.5]" />
            </div>
            <span className="text-[10px] text-[hsl(185,100%,65%)]">
              {language === 'ru' ? 'Галерея' : 'Gallery'}
            </span>
          </button>
          <button
            onClick={() => { cameraInputRef.current?.click(); setShowAttachMenu(false); }}
            className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[hsl(185,100%,35%)] flex items-center justify-center">
              <Camera className="w-5 h-5 text-white stroke-[1.5]" />
            </div>
            <span className="text-[10px] text-[hsl(185,100%,65%)]">
              {language === 'ru' ? 'Камера' : 'Camera'}
            </span>
          </button>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />

      <div className="flex items-center gap-1">
        {/* Input Field with Icons */}
        <div className="flex-1 min-w-0 bg-[hsl(var(--chat-input-bg)/0.85)] border border-white/10 rounded-3xl flex items-center min-h-[48px]">
          {/* Emoji Button */}
          <button
            className="p-2.5 hover:opacity-70 transition-opacity flex-shrink-0"
            aria-label="Emoji"
          >
            <Smile className="w-[18px] h-[18px] stroke-[1.5]" />
          </button>

          {isListening ? (
            <div className="flex-1 flex items-center justify-center py-3">
              <svg viewBox="0 0 200 40" className="w-full h-6 max-w-[240px]" preserveAspectRatio="none">
                <path
                  d="M0,20 Q10,5 20,20 Q30,35 40,20 Q50,5 60,20 Q70,35 80,20 Q90,5 100,20 Q110,35 120,20 Q130,5 140,20 Q150,35 160,20 Q170,5 180,20 Q190,35 200,20"
                  fill="none"
                  stroke="hsl(185,100%,65%)"
                  strokeWidth="1.5"
                  className="animate-[waveShift_1.2s_ease-in-out_infinite]"
                />
                <path
                  d="M0,20 Q10,30 20,20 Q30,10 40,20 Q50,30 60,20 Q70,10 80,20 Q90,30 100,20 Q110,10 120,20 Q130,30 140,20 Q150,10 160,20 Q170,30 180,20 Q190,10 200,20"
                  fill="none"
                  stroke="hsl(185,100%,65%)"
                  strokeWidth="1"
                  opacity="0.5"
                  className="animate-[waveShift_1.5s_ease-in-out_infinite_reverse]"
                />
              </svg>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.typeMessage}
              disabled={disabled}
              rows={2}
              className="flex-1 min-w-0 bg-transparent resize-none outline-none text-[hsl(var(--chat-input-foreground))] placeholder:text-[hsl(var(--chat-input-foreground))]/40 text-[16px] leading-5 max-h-[100px] py-2.5"
            />
          )}

          {/* Attachment Button */}
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 hover:opacity-70 transition-opacity flex-shrink-0"
            aria-label="Attach"
          >
            <Paperclip className="w-[18px] h-[18px] stroke-[1.5]" />
          </button>

          {/* Camera Button (only when no text) */}
          {!text.trim() && (
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2 pr-3 hover:opacity-70 transition-opacity flex-shrink-0"
              aria-label="Camera"
            >
              <Camera className="w-[18px] h-[18px] stroke-[1.5]" />
            </button>
          )}
        </div>

        {/* Mic / Send button — OUTSIDE input field so it never clips */}
        {showVoiceButton ? (
          <button
            onClick={handleVoiceClick}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0',
              isListening
                ? 'bg-[hsl(185,100%,65%)] text-[hsl(210,10%,20%)] voice-pulse shadow-[0_0_20px_hsl(185,100%,65%/0.5)]'
                : 'bg-[hsl(var(--chat-input-bg)/0.85)] text-[hsl(var(--chat-input-foreground))]'
            )}
            aria-label={isListening ? t.listening : t.tapToSpeak}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0',
              canSend
                ? 'bg-[hsl(var(--chat-input-bg)/0.85)] text-[hsl(var(--chat-input-foreground))]'
                : 'bg-[hsl(var(--chat-input-bg)/0.5)] text-[hsl(var(--chat-input-foreground))]/30'
            )}
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Click outside to close menu */}
      {showAttachMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowAttachMenu(false)}
        />
      )}
    </div>
  );
};
