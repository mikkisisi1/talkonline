import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Download, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface InstallPromptHandle {
  show: () => void;
}

interface InstallPromptProps {
  language: 'ru' | 'en';
}

export const InstallPrompt = forwardRef<InstallPromptHandle, InstallPromptProps>(
  ({ language }, ref) => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);
    const [installProgress, setInstallProgress] = useState(0);
    const [installComplete, setInstallComplete] = useState(false);

    const t = {
      ru: {
        title: 'В приложении удобнее',
        description: 'Установите TalkMe на главный экран',
        install: 'Установить',
        installing: 'Установка...',
        installed: 'Готово!',
        iosHint: 'Нажмите «Поделиться» → «На экран Домой»',
        browserHint: 'Меню браузера (⋮) → «Установить»',
        later: 'Позже',
      },
      en: {
        title: 'Better as an app',
        description: 'Install TalkMe to your home screen',
        install: 'Install',
        installing: 'Installing...',
        installed: 'Done!',
        iosHint: 'Tap "Share" → "Add to Home Screen"',
        browserHint: 'Browser menu (⋮) → "Install"',
        later: 'Later',
      },
    };

    const texts = t[language];

    // Expose show method to parent
    useImperativeHandle(ref, () => ({
      show: () => {
        if (!isStandalone) {
          // Reset the dismissed state so the prompt shows
          localStorage.removeItem('pwa_prompt_dismissed');
          setShowPrompt(true);
        }
      },
    }), [isStandalone]);

    useEffect(() => {
      // Check if already installed as PWA
      const standalone = window.matchMedia('(display-mode: standalone)').matches
        || (window.navigator as any).standalone === true;
      setIsStandalone(standalone);

      // Check if iOS
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsIOS(iOS);

      // Check if user dismissed prompt before
      const dismissed = localStorage.getItem('pwa_prompt_dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
      const daysPassed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

      // Show again after 7 days
      if (dismissed && daysPassed < 7) {
        return;
      }

      // For iOS, show manual instructions
      if (iOS && !standalone) {
        setTimeout(() => setShowPrompt(true), 1500);
        return;
      }

      // Listen for install prompt
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setTimeout(() => setShowPrompt(true), 1500);
      };

      window.addEventListener('beforeinstallprompt', handler);

      // For browsers that don't fire beforeinstallprompt but support PWA
      if (!iOS && !standalone) {
        setTimeout(() => setShowPrompt(true), 1500);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }, []);

    const simulateProgress = useCallback(() => {
      setInstallProgress(0);
      const interval = setInterval(() => {
        setInstallProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 15 + 5;
        });
      }, 150);
      return interval;
    }, []);

    const handleInstall = async () => {
      if (isInstalling) return;

      if (!deferredPrompt) {
        // iOS - just show the hint, no actual install
        if (isIOS) {
          toast.message(texts.iosHint);
          return;
        }

        // No browser prompt available (common in preview / non-installable contexts)
        // Show explicit instruction instead of doing nothing.
        toast.message(texts.browserHint);
        return;
      }

      setIsInstalling(true);
      const interval = simulateProgress();

      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        clearInterval(interval);

        if (outcome === 'accepted') {
          setInstallProgress(100);
          setInstallComplete(true);
          setTimeout(() => {
            setShowPrompt(false);
          }, 1000);
        } else {
          setIsInstalling(false);
          setInstallProgress(0);
        }
      } catch (error) {
        clearInterval(interval);
        setIsInstalling(false);
        setInstallProgress(0);
      }

      setDeferredPrompt(null);
    };

    const handleDismiss = () => {
      setShowPrompt(false);
      localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    };

    // Don't show if already installed or prompt not ready
    if (isStandalone || !showPrompt) {
      return null;
    }



    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-lg border border-border/50 p-3 max-w-sm mx-auto">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
              {installComplete ? (
                <Check className="w-5 h-5 text-primary-foreground" />
              ) : (
                <Download className="w-5 h-5 text-primary-foreground" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground">{texts.title}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {isInstalling
                  ? (installComplete ? texts.installed : texts.installing)
                  : (isIOS ? texts.iosHint : (deferredPrompt ? texts.description : texts.browserHint))}
              </p>
              {/* Progress bar */}
              {isInstalling && (
                <Progress
                  value={Math.min(installProgress, 100)}
                  className="h-1 mt-1.5"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!isInstalling && (!isIOS || deferredPrompt) && (
                <button
                  onClick={handleInstall}
                  className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium text-xs transition-colors"
                >
                  {texts.install}
                </button>
              )}
              {!isInstalling && (
                <button
                  onClick={handleDismiss}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
                  aria-label={texts.later}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InstallPrompt.displayName = 'InstallPrompt';
