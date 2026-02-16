import { useRef, useState, useEffect, useCallback } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SPLASH_VIDEO_URL = 'https://customer-assets.emergentagent.com/job_8f3af781-196d-4b20-8cbd-bb3a28818b7f/artifacts/dwzs6jz7_2026-02-15-102527267.mp4';

// Play bell chime sound
const playBellChime = async () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') await ctx.resume();
    const now = ctx.currentTime;
    
    // Bell sound - two oscillators for richer tone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc2.frequency.setValueAtTime(1320, now); // E6
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.8);
    osc2.stop(now + 0.8);
  } catch {}
};

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

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
