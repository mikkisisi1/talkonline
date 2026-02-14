import { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';

// Global registry: pause all other videos when one starts
const activeVideos = new Set<HTMLVideoElement>();

function pauseAllExcept(current: HTMLVideoElement) {
  activeVideos.forEach(v => {
    if (v !== current && !v.paused) {
      v.pause();
      v.currentTime = 0;
    }
  });
}

interface ChatVideoPlayerProps {
  src: string;
}

export const ChatVideoPlayer = ({ src }: ChatVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Register/unregister video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    activeVideos.add(video);
    return () => {
      activeVideos.delete(video);
      video.pause();
      video.removeAttribute('src');
      video.load(); // release resources
    };
  }, []);

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    if (video.paused) {
      // Stop all other videos first to free resources
      pauseAllExcept(video);
      // Ensure src is set (may have been cleared)
      if (!video.src || video.src === '') {
        video.src = src;
      }
      video.play().then(() => {
        setIsPlaying(true);
        if (!document.fullscreenElement) {
          if ((video as any).webkitEnterFullscreen) {
            (video as any).webkitEnterFullscreen();
          } else if (container.requestFullscreen) {
            container.requestFullscreen().catch(() => {});
          }
        }
      }).catch(() => {
        video.muted = true;
        video.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnded = () => {
      setIsPlaying(false);
      // Exit fullscreen when video ends
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    video.addEventListener('ended', onEnded);
    video.addEventListener('pause', onPause);
    video.addEventListener('play', onPlay);
    return () => {
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('play', onPlay);
    };
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${isFullscreen ? 'flex items-center justify-center bg-black w-full h-full' : ''}`}
      onClick={handleContainerClick}
    >
      <div className={`relative rounded-lg overflow-hidden cursor-pointer ${isFullscreen ? '' : 'max-w-[260px]'}`}>
        <video
          ref={videoRef}
          src={src}
          className={`rounded-lg ${isFullscreen ? 'max-h-screen max-w-full' : 'w-full'}`}
          playsInline
          preload="auto"
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          style={isFullscreen ? {} : { maxHeight: '360px' }}
        />
        {/* Play/Pause overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity">
            <div className="w-12 h-12 bg-primary/90 rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-[hsl(210,10%,20%)] ml-0.5" fill="hsl(210,10%,20%)" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
