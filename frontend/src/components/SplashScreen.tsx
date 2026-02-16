import { useRef, useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SPLASH_VIDEO_URL = 'https://customer-assets.emergentagent.com/job_8f3af781-196d-4b20-8cbd-bb3a28818b7f/artifacts/dwzs6jz7_2026-02-15-102527267.mp4';

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showBell, setShowBell] = useState(false);

  // If video has error, show bell instead
  useEffect(() => {
    if (hasError) {
      setShowBell(true);
      setIsLoading(false);
    }
  }, [hasError]);

  // Timeout - if video takes too long, show bell
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setShowBell(true);
        setIsLoading(false);
      }
    }, 5000); // 5 seconds timeout
    return () => clearTimeout(timeout);
  }, [isLoading]);

  const handleVideoLoaded = () => {
    setIsLoading(false);
  };

  const handleVideoEnded = () => {
    setShowBell(true);
  };

  const handleBellClick = () => {
    onComplete();
  };

  // Bell screen after video or on error
  if (showBell) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] flex flex-col items-center justify-center cursor-pointer"
        onClick={handleBellClick}
      >
        <div className="relative">
          {/* Pulsing ring */}
          <div className="absolute inset-0 w-32 h-32 rounded-full bg-[hsl(185,100%,65%)] animate-ping opacity-20" />
          {/* Bell button */}
          <button 
            className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[hsl(185,100%,50%)] to-[hsl(200,100%,40%)] flex items-center justify-center shadow-[0_0_40px_hsl(185,100%,65%,0.5)] hover:scale-105 transition-transform"
          >
            <Bell className="w-16 h-16 text-white animate-bounce" />
          </button>
        </div>
        <p className="mt-8 text-[hsl(185,100%,65%)] text-lg font-light animate-pulse">
          Нажми, чтобы начать ✨
        </p>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer"
      onClick={onComplete}
    >
      {/* Loading indicator while video loads */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a]">
          <div className="w-16 h-16 border-4 border-[hsl(185,100%,65%)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        src={SPLASH_VIDEO_URL}
        autoPlay
        muted
        playsInline
        preload="auto"
        onLoadedData={handleVideoLoaded}
        onEnded={handleVideoEnded}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
    </div>
  );
};
