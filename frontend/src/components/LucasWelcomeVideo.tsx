import { useRef, useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';

interface LucasWelcomeVideoProps {
  onComplete: () => void;
  avatarUrl?: string;
}

const LUCAS_VIDEO_URL = '/welcome/lucas-welcome.mp4';

export const LucasWelcomeVideo = ({ onComplete, avatarUrl }: LucasWelcomeVideoProps) => {
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
    setTimeout(onComplete, 300);
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
      className={`fixed inset-0 z-50 bg-white flex flex-col items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleSkip}
    >
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all"
        aria-label="Пропустить"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Video container - same size as header avatar */}
      <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-[hsl(185,100%,35%)] shadow-lg">
        <video
          ref={videoRef}
          src={LUCAS_VIDEO_URL}
          autoPlay
          playsInline
          muted
          onEnded={handleComplete}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Name label */}
      <p className="mt-3 text-sm font-medium text-gray-700 font-mono">Лукас</p>
      
      {/* Tap to skip hint */}
      <p className="absolute bottom-8 text-gray-400 text-xs font-mono animate-pulse">
        Нажмите чтобы пропустить
      </p>
    </div>
  );
};
