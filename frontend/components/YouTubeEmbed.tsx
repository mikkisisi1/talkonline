import { Play, ExternalLink } from 'lucide-react';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
}

export const YouTubeEmbed = ({ videoId, title }: YouTubeEmbedProps) => {
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  const openYouTube = () => {
    // In some environments (iOS PWA / in-app browsers) target=_blank may fail silently.
    // Use window.open() during the user gesture + fallback to same-tab navigation.
    const win = window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
    if (!win) {
      window.location.assign(youtubeUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={openYouTube}
      className="block w-full max-w-[300px] rounded-xl overflow-hidden bg-black group focus:outline-none focus:ring-2 focus:ring-primary text-left"
      aria-label={title ? `Open YouTube: ${title}` : 'Open YouTube'}
    >
      {/* Thumbnail with play button */}
      <div className="relative aspect-video">
        <img
          src={thumbnailUrl}
          alt={title || 'YouTube video'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="w-14 h-14 bg-destructive rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Footer with YouTube branding */}
      <div className="flex items-center gap-2 px-3 py-2 bg-card/90">
        <div className="w-6 h-6 bg-destructive rounded flex items-center justify-center flex-shrink-0">
          <Play className="w-3 h-3 text-white ml-0.5" fill="currentColor" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{title || 'Смотреть на YouTube'}</p>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ExternalLink className="w-2.5 h-2.5" />
            <span>youtube.com</span>
          </div>
        </div>
      </div>
    </button>
  );
};

