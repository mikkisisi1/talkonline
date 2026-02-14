import React from 'react';
import { Message } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { VideoEmbed, VideoPlatform, extractVideoInfo } from './VideoEmbed';
import { ChatVideoPlayer } from './ChatVideoPlayer';
import { getVideoUrl, getPhotoUrl } from '@/lib/videoScenes';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  agentAvatarUrl?: string;
  onSpeak?: (text: string) => void;
  onStopSpeaking?: () => void;
  isSpeaking?: boolean;
  isLoadingVoice?: boolean;
  voiceEnabled?: boolean;
}

interface ParsedVideo {
  platform: VideoPlatform;
  id: string;
  title?: string;
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Parse message content to find video links (YouTube, RuTube, VK) and separate text
const parseMessageContent = (content: string): { text: string; videos: ParsedVideo[]; sceneVideos: string[]; scenePhotos: string[] } => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const videos: ParsedVideo[] = [];
  const sceneVideos: string[] = [];
  const scenePhotos: string[] = [];
  
  let text = content;
  
  // Extract [photo:sofia_photo_X] tags
  const photoRegex = /\[photo:(sofia_photo_\d+)\]/g;
  let photoMatch;
  while ((photoMatch = photoRegex.exec(content)) !== null) {
    const photoId = photoMatch[1];
    const url = getPhotoUrl(photoId);
    if (url) scenePhotos.push(url);
    text = text.replace(photoMatch[0], '').trim();
  }
  // Remove malformed photo tags
  text = text.replace(/\[photo:[^\]]*\]/g, '').trim();
  
  // Extract [video:scene_X] tags
  const sceneRegex = /\[video:((?:sofia_)?scene_\d+)\]/g;
  let sceneMatch;
  while ((sceneMatch = sceneRegex.exec(content)) !== null) {
    const sceneId = sceneMatch[1];
    const url = getVideoUrl(sceneId);
    if (url) sceneVideos.push(url);
    text = text.replace(sceneMatch[0], '').trim();
  }
  // Remove malformed/incomplete video tags like [video:] or [video:scene_]
  text = text.replace(/\[video:[^\]]*\]/g, '').trim();
  
  const urls = content.match(urlRegex) || [];
  
  for (const url of urls) {
    const videoInfo = extractVideoInfo(url);
    if (videoInfo) {
      videos.push({ platform: videoInfo.platform, id: videoInfo.id });
      text = text.replace(url, '').trim();
    }
  }
  
  // Clean up extra whitespace
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  
  // Strip Fish Audio emotion tags for display — any (english-word) pattern
  text = text.replace(/\([a-zA-Z][a-zA-Z\s-]*\)\s*/g, '');
  
  return { text, videos, sceneVideos, scenePhotos };
};

export const MessageBubble = React.memo(React.forwardRef<HTMLDivElement, MessageBubbleProps>(({ message, agentAvatarUrl, onSpeak, onStopSpeaking, isSpeaking, isLoadingVoice, voiceEnabled }, ref) => {
  const isUser = message.role === 'user';
  const { text, videos, sceneVideos, scenePhotos } = parseMessageContent(message.content);
  const hasImage = !!message.imageUrl;
  const showSpeaker = !isUser && onSpeak && text;

  const handleSpeakClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking && onStopSpeaking) {
      onStopSpeaking();
    } else if (!isLoadingVoice && onSpeak && text) {
      onSpeak(text);
    }
  };

  // Determine icon state
  const renderSpeakerIcon = () => {
    if (isLoadingVoice) {
      return <Loader2 className="w-4 h-4 text-[hsl(185,100%,65%)] animate-spin" />;
    }
    if (isSpeaking) {
      return <VolumeX className="w-4 h-4 text-[hsl(185,100%,65%)]" />;
    }
    return <Volume2 className="w-4 h-4 text-[hsl(185,100%,65%)]" />;
  };

  return (
    <div
      className={cn(
        'flex animate-message-in items-end gap-1.5',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] overflow-hidden relative',
          hasImage ? 'p-1' : 'px-3 py-2',
          isUser
            ? 'bg-[hsl(200,15%,18%)]/85 backdrop-blur-sm text-[hsl(185,100%,65%)] rounded-t-2xl rounded-bl-2xl rounded-br-md'
            : 'bg-[hsl(200,15%,18%)]/85 backdrop-blur-sm text-[hsl(185,100%,65%)] rounded-t-2xl rounded-br-2xl rounded-bl-md'
        )}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {/* Avatar inside bubble — float top right so text wraps beside it */}
        {!isUser && agentAvatarUrl && (
          <img
            src={agentAvatarUrl}
            alt=""
            className="w-11 h-11 rounded-full object-cover shrink-0 float-right ml-2 mb-1"
          />
        )}

        {/* Speaker icon moved below text — rendered after content */}

        {/* Image */}
        {hasImage && (
          <div className="rounded-lg overflow-hidden mb-1">
            <img 
              src={message.imageUrl} 
              alt="Sent image" 
              className="max-w-full rounded-lg"
              style={{ maxHeight: '300px' }}
              loading="lazy"
            />
          </div>
        )}

        {/* Text Content */}
        {text && (
          <div className={cn(
            "text-[15px] leading-relaxed whitespace-pre-wrap break-words",
            hasImage && "px-2 py-1"
          )}>
            {text}
          </div>
        )}
        
        {/* Video Embeds (YouTube, RuTube, VK Video) */}
        {videos.length > 0 && (
          <div className={cn('space-y-2', (text || hasImage) && 'mt-3', hasImage && 'px-3')}>
            {videos.map((video) => (
              <VideoEmbed 
                key={`${video.platform}-${video.id}`} 
                platform={video.platform} 
                videoId={video.id} 
                title={video.title} 
              />
            ))}
          </div>
        )}

        {/* Agent scene videos */}
        {sceneVideos.length > 0 && (
          <div className={cn('space-y-2', (text || hasImage || videos.length > 0) && 'mt-2', hasImage && 'px-3')}>
            {sceneVideos.map((src) => (
              <ChatVideoPlayer key={src} src={src} />
            ))}
          </div>
        )}

        {/* Agent scene photos */}
        {scenePhotos.length > 0 && (
          <div className={cn('space-y-2', (text || hasImage || videos.length > 0 || sceneVideos.length > 0) && 'mt-2', hasImage && 'px-3')}>
            {scenePhotos.map((src) => (
              <img key={src} src={src} alt="" className="rounded-lg max-w-[260px] w-full" style={{ maxHeight: '360px', objectFit: 'cover' }} loading="lazy" />
            ))}
          </div>
        )}
        
        {/* Timestamp + Speaker row */}
        <div className={cn(
          'flex items-center gap-2 justify-end mt-1',
          hasImage && 'px-2 pb-1'
        )}>
          <span className="text-[11px] leading-none font-mono text-[hsl(185,100%,65%)]/60">
            {formatTime(message.timestamp)}
          </span>
          {/* Speaker icon */}
          {showSpeaker && (
            <button
              onClick={handleSpeakClick}
              disabled={isLoadingVoice}
              className={cn(
                "p-1.5 rounded-full transition-colors",
                isLoadingVoice
                  ? "bg-white/20 cursor-wait"
                  : isSpeaking 
                    ? "bg-white/30 voice-pulse" 
                    : "bg-white/20 hover:bg-white/30"
              )}
              aria-label={isLoadingVoice ? "Loading voice" : isSpeaking ? "Stop voice" : "Play voice"}
            >
              {renderSpeakerIcon()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}));

MessageBubble.displayName = 'MessageBubble';
