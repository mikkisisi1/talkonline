import { useRef, useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SPLASH_VIDEO_URL = 'https://customer-assets.emergentagent.com/job_8f3af781-196d-4b20-8cbd-bb3a28818b7f/artifacts/dwzs6jz7_2026-02-15-102527267.mp4';

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  // Timeout fallback - if video doesn't load in 5 seconds, skip splash
  useEffect(() => {
    const timeout = setTimeout(() => {
      onComplete();
    }, 5000);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  // If video has error, complete immediately
  useEffect(() => {
    if (hasError) {
      onComplete();
    }
  }, [hasError, onComplete]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer"
      onClick={onComplete}
    >
      <video
        ref={videoRef}
        src={SPLASH_VIDEO_URL}
        autoPlay
        muted
        playsInline
        onEnded={onComplete}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
