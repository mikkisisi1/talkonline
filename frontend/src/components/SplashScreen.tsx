import { useRef, useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SPLASH_VIDEO_URL = 'https://customer-assets.emergentagent.com/job_8f3af781-196d-4b20-8cbd-bb3a28818b7f/artifacts/dwzs6jz7_2026-02-15-102527267.mp4';

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  // If video has error, skip splash using useEffect to avoid setState during render
  useEffect(() => {
    if (hasError) {
      onComplete();
    }
  }, [hasError, onComplete]);

  if (hasError) {
    return null;
  }

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
