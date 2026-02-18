import { useRef, useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';

interface LucasWelcomeVideoProps {
  onComplete: () => void;
}

const LUCAS_VIDEO_URL = '/welcome/lucas-welcome.mp4';

export const LucasWelcomeVideo = ({ onComplete }: LucasWelcomeVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Skip on error
  useEffect(() => {
    if (hasError) {
      onComplete();
    }
  }, [hasError, onComplete]);

  const handleComplete = useCallback(() => {
    setIsVisible(false);
    setTimeout(onComplete, 300); // Small delay for fade animation
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    handleComplete();
  }, [handleComplete]);

  if (hasError || !isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-all"
        aria-label="Пропустить"
      >
        <X className="w-6 h-6" />
      </button>

      <video
        ref={videoRef}
        src={LUCAS_VIDEO_URL}
        autoPlay
        playsInline
        onEnded={handleComplete}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
      />
      
      {/* Tap to skip hint */}
      <div 
        className="absolute bottom-8 left-0 right-0 flex justify-center"
        onClick={handleSkip}
      >
        <span className="text-white/50 text-sm font-mono animate-pulse">
          Нажмите чтобы пропустить
        </span>
      </div>
    </div>
  );
};
