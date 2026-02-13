import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Image, Languages, Sun, Moon, Check, Download, Smartphone } from 'lucide-react';
import { Language, translations } from '@/lib/translations';
import { Wallpaper, Theme } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';



import wallpaperMountains from '@/assets/wallpaper-mountains.jpg';
import wallpaperLagoon from '@/assets/wallpaper-lagoon.jpg';
import wallpaperHorses from '@/assets/wallpaper-horses.jpg';
import wallpaperTurtle from '@/assets/wallpaper-turtle.jpg';
import wallpaperCabin from '@/assets/wallpaper-cabin.jpg';
import wallpaperPeak from '@/assets/wallpaper-peak.jpg';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface SettingsProps {
  language: Language;
  theme: Theme;
  learningMode: boolean;
  wallpaper: Wallpaper;
  onBack: () => void;
  onLanguageChange: (lang: Language) => void;
  onThemeChange: (theme: Theme) => void;
  onLearningModeToggle: () => void;
  onWallpaperChange: (wallpaper: Wallpaper) => void;
}

const wallpapers: { id: Wallpaper; image: string; labelRu: string; labelEn: string }[] = [
  
  { id: 'mountains', image: wallpaperMountains, labelRu: 'Горы', labelEn: 'Mountains' },
  { id: 'lagoon', image: wallpaperLagoon, labelRu: 'Лагуна', labelEn: 'Lagoon' },
  { id: 'horses', image: wallpaperHorses, labelRu: 'Лошади', labelEn: 'Horses' },
  { id: 'turtle', image: wallpaperTurtle, labelRu: 'Черепаха', labelEn: 'Turtle' },
  { id: 'cabin', image: wallpaperCabin, labelRu: 'Домик', labelEn: 'Cabin' },
  { id: 'peak', image: wallpaperPeak, labelRu: 'Пик', labelEn: 'Peak' },
];

export const Settings = ({
  language,
  theme,
  learningMode,
  wallpaper,
  onBack,
  onLanguageChange,
  onThemeChange,
  onLearningModeToggle,
  onWallpaperChange,
}: SettingsProps) => {
  const t = translations[language];
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installComplete, setInstallComplete] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [showInstallHint, setShowInstallHint] = useState<string | null>(null);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // If the install prompt fired before Settings was opened, reuse it.
    if (window.__talkmeDeferredInstallPrompt) {
      setDeferredPrompt(window.__talkmeDeferredInstallPrompt as BeforeInstallPromptEvent);
    }

    // If user installed via browser menu, this event can fire without our prompt flow.
    if (window.__talkmeAppInstalled) {
      setInstallComplete(true);
    }

    // Persist install status across sessions (best-effort)
    try {
      if (localStorage.getItem('talkme_pwa_installed') === '1') {
        setInstallComplete(true);
      }
    } catch {
      // ignore
    }

    const handler = (e: Event) => {
      e.preventDefault();
      window.__talkmeDeferredInstallPrompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      window.__talkmeAppInstalled = true;
      window.__talkmeDeferredInstallPrompt = undefined;
      setInstallComplete(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Simulate installation progress
  const simulateProgress = useCallback(() => {
    setInstallProgress(0);
    const interval = setInterval(() => {
      setInstallProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.random() * 12 + 3;
      });
    }, 120);
    return interval;
  }, []);

  const handleBannerInstall = async () => {
    if (isStandalone || installComplete || isInstalling) return;

    // If we have the native prompt, use it directly
    if (deferredPrompt) {
      setIsInstalling(true);
      const progressInterval = simulateProgress();

      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        clearInterval(progressInterval);

        if (outcome === 'accepted') {
          setInstallProgress(100);
          setInstallComplete(true);
          
          // Brief delay to show 100%, then the app should auto-open
          setTimeout(() => {
            toast.success(
              language === 'ru'
                ? '✓ Установлено! Открываем...'
                : '✓ Installed! Opening...',
              { duration: 2000 }
            );
          }, 300);
        } else {
          setIsInstalling(false);
          setInstallProgress(0);
        }
      } catch (err) {
        console.error('[PWA] Prompt error:', err);
        clearInterval(progressInterval);
        setIsInstalling(false);
        setInstallProgress(0);
        
        toast.error(
          language === 'ru'
            ? 'Меню (⋮) → «Установить приложение». Не ⬇️!'
            : 'Menu (⋮) → "Install app". Not ⬇️!'
        );
      } finally {
        setDeferredPrompt(null);
      }
      return;
    }

    // iOS - show specific instructions
    if (isIOS) {
      setShowInstallHint(language === 'ru'
        ? '⬆️ Нажмите «Поделиться» → «На экран Домой»'
        : '⬆️ Tap "Share" → "Add to Home Screen"');
      return;
    }

    // No native prompt - show instruction inline
    setShowInstallHint(language === 'ru'
      ? 'Нажмите ⋮ (меню браузера) → «Установить приложение»'
      : 'Tap ⋮ (browser menu) → "Install app"');
  };

  const toggleTheme = () => {
    onThemeChange(theme === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    onLanguageChange(language === 'ru' ? 'en' : 'ru');
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[hsl(220,10%,15%)]">
      <header className="bg-header text-header-foreground pl-3 pr-4 py-0 flex items-center gap-1 safe-area-top shadow-sm min-h-[30px] relative border-b border-[hsl(0,0%,25%)]">
        <button
          onClick={onBack}
          className="p-1 -ml-1 hover:bg-header-foreground/10 rounded-full transition-colors"
          aria-label={t.back}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-normal text-[10.5px] font-mono flex-1 text-card-foreground ml-1">{t.settings}</h1>
        <button
          onClick={toggleLanguage}
          className="p-2 hover:bg-header-foreground/10 rounded-full transition-colors flex items-center justify-center"
          aria-label="Toggle language"
        >
          <span className="text-[10.5px] font-normal font-mono text-card-foreground">{language === 'ru' ? 'EN' : 'RU'}</span>
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-header-foreground/10 rounded-full transition-colors"
          aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4 text-card-foreground" /> : <Sun className="w-4 h-4 text-card-foreground" />}
        </button>
      </header>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Wallpaper Selection */}
        <div className="bg-[hsl(220,10%,20%)] rounded-xl p-4 shadow-sm text-foreground">
          <div className="flex items-center gap-3 mb-4">
            <Image className="w-5 h-5 text-primary" />
            <span className="font-medium">{language === 'ru' ? 'Фон чата' : 'Chat Background'}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {wallpapers.map((wp) => (
              <button
                key={wp.id}
                onClick={() => onWallpaperChange(wp.id)}
                className={cn(
                  'relative aspect-[9/16] rounded-lg overflow-hidden transition-all',
                  'w-[90%] mx-auto',
                  wallpaper === wp.id
                    ? 'ring-1 ring-[hsl(185,100%,65%)]'
                    : 'hover:opacity-80'
                )}
              >
                <img
                  src={wp.image}
                  alt={language === 'ru' ? wp.labelRu : wp.labelEn}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-1 px-2">
                  <span className="text-xs text-white font-medium">
                    {language === 'ru' ? wp.labelRu : wp.labelEn}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bilingual Learning Mode */}
        <div className="bg-[hsl(220,10%,20%)] rounded-xl p-4 shadow-sm text-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5 text-primary" />
              <div>
                <span className="font-medium">{t.learningMode}</span>
                <p className="text-xs text-muted-foreground">{t.learningModeDescription}</p>
              </div>
            </div>
            <Switch checked={learningMode} onCheckedChange={onLearningModeToggle} />
          </div>
        </div>

      </div>

      {/* Install Section at Bottom */}
      {!isStandalone && (
        <div className="p-4 border-t border-border/20 bg-[hsl(220,10%,18%)] safe-area-bottom">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20">
            {/* Header with icon */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                {installComplete ? (
                  <Check className="w-5 h-5 text-primary-foreground" />
                ) : isInstalling ? (
                  <Download className="w-5 h-5 text-primary-foreground animate-pulse" />
                ) : (
                  <Smartphone className="w-5 h-5 text-primary-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">
                  {language === 'ru' ? 'В приложении удобнее' : 'Better as an app'}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {installComplete
                    ? (language === 'ru' ? 'Установлено! Ищите на главном экране' : 'Installed! Find on home screen')
                    : isInstalling
                      ? (language === 'ru' ? 'Устанавливаем...' : 'Installing...')
                      : (language === 'ru' ? 'Быстрый доступ, работает оффлайн' : 'Quick access, works offline')}
                </p>
              </div>
            </div>

            {/* Progress bar when installing */}
            {isInstalling && (
              <div className="mb-3">
                <Progress value={Math.min(installProgress, 100)} className="h-2" />
              </div>
            )}

            {/* Install hint */}
            {showInstallHint && !installComplete && !isInstalling && (
              <div className="mb-3 p-3 bg-primary/20 border border-primary/30 rounded-xl text-sm text-foreground text-center">
                {showInstallHint}
              </div>
            )}

            {/* Install button */}
            {!installComplete && !isInstalling && (
              <button
                onClick={handleBannerInstall}
                className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {language === 'ru' ? 'Скачать' : 'Download'}
              </button>
            )}

            {/* Success state */}
            {installComplete && (
              <div className="flex items-center justify-center gap-2 py-2 text-primary font-medium text-sm">
                <Check className="w-4 h-4" />
                {language === 'ru' ? 'Готово!' : 'Done!'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
