import { Play, ExternalLink, Music, Headphones, Film } from 'lucide-react';

export type VideoPlatform = 'youtube' | 'youtubemusic' | 'rutube' | 'vkvideo' | 'spotify' | 'soundcloud' | 'music' | 'trailer';

interface VideoEmbedProps {
  platform: VideoPlatform;
  videoId: string;
  title?: string;
}

const platformConfig = {
  youtube: {
    name: 'YouTube',
    domain: 'youtube.com',
    color: 'bg-red-600',
    icon: 'play',
    getUrl: (id: string) => `https://www.youtube.com/watch?v=${id}`,
    getThumbnail: (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
  },
  youtubemusic: {
    name: 'YouTube Music',
    domain: 'music.youtube.com',
    color: 'bg-rose-500',
    icon: 'music',
    getUrl: (id: string) => `https://music.youtube.com/watch?v=${id}`,
    getThumbnail: (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
  },
  rutube: {
    name: 'RuTube',
    domain: 'rutube.ru',
    color: 'bg-emerald-600',
    icon: 'play',
    getUrl: (id: string) => `https://rutube.ru/video/${id}/`,
    getThumbnail: (id: string) => `https://pic.rutube.ru/video/${id}`,
  },
  vkvideo: {
    name: 'VK Видео',
    domain: 'vk.com',
    color: 'bg-sky-500',
    icon: 'play',
    getUrl: (id: string) => `https://vk.com/video${id}`,
    getThumbnail: () => null,
  },
  spotify: {
    name: 'Spotify',
    domain: 'open.spotify.com',
    color: 'bg-[#1DB954]',
    icon: 'headphones',
    getUrl: (query: string) => `https://open.spotify.com/search/${encodeURIComponent(query)}`,
    getThumbnail: () => null,
  },
  soundcloud: {
    name: 'SoundCloud',
    domain: 'soundcloud.com',
    color: 'bg-[#FF5500]',
    icon: 'headphones',
    getUrl: (query: string) => `https://soundcloud.com/search?q=${encodeURIComponent(query)}`,
    getThumbnail: () => null,
  },
  // Special combined music card
  music: {
    name: 'Music',
    domain: '',
    color: 'bg-gradient-to-r from-[#1DB954] to-[#FF5500]',
    icon: 'headphones',
    getUrl: () => '',
    getThumbnail: () => null,
  },
  // Special trailer card
  trailer: {
    name: 'YouTube',
    domain: 'youtube.com',
    color: 'bg-red-600',
    icon: 'film',
    getUrl: (query: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    getThumbnail: () => null,
  },
};

const IconComponent = ({ type, className, fill }: { type: string; className: string; fill?: string }) => {
  if (type === 'music') {
    return <Music className={className} />;
  }
  if (type === 'headphones') {
    return <Headphones className={className} />;
  }
  if (type === 'film') {
    return <Film className={className} />;
  }
  return <Play className={className} fill={fill} />;
};

// Simple Spotify button - opens search in new window
const SpotifyButton = ({ query }: { query: string; title?: string }) => {
  const openSpotify = () => {
    const url = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) window.location.assign(url);
  };

  return (
    <button
      type="button"
      onClick={openSpotify}
      className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1DB954]/50"
      aria-label={`Слушать "${query}" на Spotify`}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
      Spotify
    </button>
  );
};

// Trailer card - just a YouTube button
const TrailerCard = ({ videoId }: { videoId: string; title?: string }) => {
  const openTrailer = () => {
    // videoId can be a direct video ID or a full URL
    const isFullUrl = videoId.includes('youtube.com') || videoId.includes('youtu.be');
    const url = isFullUrl ? videoId : `https://www.youtube.com/watch?v=${videoId}`;
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) window.location.assign(url);
  };

  return (
    <button
      type="button"
      onClick={openTrailer}
      className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-destructive/50"
      aria-label="Смотреть на YouTube"
    >
      <Play className="w-4 h-4" fill="currentColor" />
      Смотреть на YouTube
    </button>
  );
};

// YouTube button - opens in new window
const YouTubeButton = ({ videoId }: { videoId: string }) => {
  const openYouTube = () => {
    // videoId can be a direct video ID or a full URL
    const isFullUrl = videoId.includes('youtube.com') || videoId.includes('youtu.be');
    const url = isFullUrl ? videoId : `https://www.youtube.com/watch?v=${videoId}`;
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) window.location.assign(url);
  };

  return (
    <button
      type="button"
      onClick={openYouTube}
      className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-destructive/50"
      aria-label="Смотреть на YouTube"
    >
      <Play className="w-4 h-4" fill="currentColor" />
      YouTube
    </button>
  );
};

export const VideoEmbed = ({ platform, videoId, title }: VideoEmbedProps) => {
  // Music - single Spotify button
  if (platform === 'music' || platform === 'spotify' || platform === 'soundcloud') {
    return <SpotifyButton query={videoId} title={title} />;
  }

  // Trailer / YouTube - button opens in new window
  if (platform === 'trailer' || platform === 'youtube') {
    return <YouTubeButton videoId={videoId} />;
  }

  const config = platformConfig[platform];
  const isMusic = config.icon === 'music';
  const videoUrl = config.getUrl(videoId);
  const thumbnailUrl = config.getThumbnail(videoId);

  const openVideo = () => {
    const win = window.open(videoUrl, '_blank', 'noopener,noreferrer');
    if (!win) {
      window.location.assign(videoUrl);
    }
  };

  // Card for RuTube, VK, YouTube Music (external links)
  return (
    <button
      type="button"
      onClick={openVideo}
      className="block w-full max-w-[300px] rounded-xl overflow-hidden bg-black group focus:outline-none focus:ring-2 focus:ring-primary text-left"
      aria-label={title ? `Открыть ${config.name}: ${title}` : `Открыть ${config.name}`}
    >
      {/* Thumbnail with play button */}
      <div className="relative aspect-video bg-muted">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title || `${config.name} video`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className={`w-14 h-14 ${config.color} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
            <IconComponent type={config.icon} className={`w-7 h-7 text-white ${isMusic ? '' : 'ml-1'}`} fill={isMusic ? undefined : "currentColor"} />
          </div>
        </div>
      </div>

      {/* Footer with platform branding */}
      <div className="flex items-center gap-2 px-3 py-2 bg-card/90">
        <div className={`w-6 h-6 ${config.color} rounded flex items-center justify-center flex-shrink-0`}>
          <IconComponent type={config.icon} className={`w-3 h-3 text-white ${isMusic ? '' : 'ml-0.5'}`} fill={isMusic ? undefined : "currentColor"} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {title || `Смотреть на ${config.name}`}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ExternalLink className="w-2.5 h-2.5" />
            <span>{config.domain}</span>
          </div>
        </div>
      </div>
    </button>
  );
};

// URL parsing utilities
export const extractVideoInfo = (url: string): { platform: VideoPlatform; id: string } | null => {

  // Spotify search link: open.spotify.com/search/QUERY
  const spotifySearchPattern = /open\.spotify\.com\/search\/(.+?)(?:\?|$)/;
  const spotifySearchMatch = url.match(spotifySearchPattern);
  if (spotifySearchMatch) return { platform: 'music', id: decodeURIComponent(spotifySearchMatch[1]) };

  // SoundCloud search link: soundcloud.com/search?q=QUERY
  const soundcloudSearchPattern = /soundcloud\.com\/search\?q=(.+?)(?:&|$)/;
  const soundcloudSearchMatch = url.match(soundcloudSearchPattern);
  if (soundcloudSearchMatch) return { platform: 'music', id: decodeURIComponent(soundcloudSearchMatch[1]) };

  // YouTube Music patterns (check first, more specific)
  const youtubeMusicPattern = /music\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/;
  const youtubeMusicMatch = url.match(youtubeMusicPattern);
  if (youtubeMusicMatch) return { platform: 'youtubemusic', id: youtubeMusicMatch[1] };

  // YouTube search results (for trailers) - return full URL as id
  const youtubeSearchPattern = /youtube\.com\/results\?search_query=(.+?)(?:&|$)/;
  const youtubeSearchMatch = url.match(youtubeSearchPattern);
  if (youtubeSearchMatch) return { platform: 'trailer', id: url };

  // YouTube direct video patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) return { platform: 'youtube', id: match[1] };
  }

  // RuTube patterns: rutube.ru/video/VIDEO_ID/
  const rutubePattern = /rutube\.ru\/video\/([a-zA-Z0-9]+)/;
  const rutubeMatch = url.match(rutubePattern);
  if (rutubeMatch) return { platform: 'rutube', id: rutubeMatch[1] };

  // VK Video patterns: vk.com/video-123_456 or vk.com/video123_456
  const vkPattern = /vk\.com\/video(-?\d+_\d+)/;
  const vkMatch = url.match(vkPattern);
  if (vkMatch) return { platform: 'vkvideo', id: vkMatch[1] };

  // VK Video clip patterns: vk.com/clip-123_456
  const vkClipPattern = /vk\.com\/clip(-?\d+_\d+)/;
  const vkClipMatch = url.match(vkClipPattern);
  if (vkClipMatch) return { platform: 'vkvideo', id: vkClipMatch[1] };

  return null;
};

// Helper to create a Spotify search URL from a song query
export const createSpotifySearchUrl = (query: string): string => {
  return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
};

// Helper to create a SoundCloud search URL from a song query
export const createSoundCloudSearchUrl = (query: string): string => {
  return `https://soundcloud.com/search?q=${encodeURIComponent(query)}`;
};
