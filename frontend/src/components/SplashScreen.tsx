import { useRef, useState, useEffect, useCallback } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SPLASH_VIDEO_URL = 'https://customer-assets.emergentagent.com/job_8f3af781-196d-4b20-8cbd-bb3a28818b7f/artifacts/dwzs6jz7_2026-02-15-102527267.mp4';

// Global audio context for bell
let audioCtx: AudioContext | null = null;

// Unlock audio on any user interaction
const unlockAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

// Play bell chime sound
const playBellChime = async (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const now = ctx.currentTime;
      
      // Bell sound - crystal clear chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Bell frequencies (C6, E6, G6 - C major chord)
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc3.type = 'sine';
      osc1.frequency.setValueAtTime(1047, now); // C6
      osc2.frequency.setValueAtTime(1319, now); // E6
      osc3.frequency.setValueAtTime(1568, now); // G6
      
      // Loud and clear
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      
      osc1.connect(gain);
      osc2.connect(gain);
      osc3.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
      osc3.stop(now + 1.2);
      
      // Resolve after sound plays
      setTimeout(resolve, 300);
    } catch {
      resolve();
    }
  });
};

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  // Unlock audio on mount and any interaction
  useEffect(() => {
    unlockAudio();
    const handler = () => unlockAudio();
    document.addEventListener('touchstart', handler, { once: true });
    document.addEventListener('click', handler, { once: true });
    return () => {
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('click', handler);
    };
  }, []);

  const handleComplete = useCallback(async () => {
    await playBellChime(); // Дзинь!
    onComplete();
  }, [onComplete]);

  // If video has error, skip splash
  useEffect(() => {
    if (hasError) {
      handleComplete();
    }
  }, [hasError, handleComplete]);

  if (hasError) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer"
      onClick={handleComplete}
    >
      <video
        ref={videoRef}
        src={SPLASH_VIDEO_URL}
        autoPlay
        muted
        playsInline
        onEnded={handleComplete}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
