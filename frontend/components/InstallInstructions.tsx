import { useState } from 'react';
import { Check, MoreVertical, Share, ChevronRight } from 'lucide-react';
import { Language } from '@/lib/translations';
import { cn } from '@/lib/utils';

interface InstallInstructionsProps {
  language: Language;
  isIOS: boolean;
  onConfirmInstalled: () => void;
}

export const InstallInstructions = ({
  language,
  isIOS,
  onConfirmInstalled,
}: InstallInstructionsProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const iosSteps = language === 'ru'
    ? [
        { icon: Share, text: 'Нажмите «Поделиться» ⬆ внизу экрана' },
        { icon: ChevronRight, text: 'Выберите «На экран Домой»' },
        { icon: Check, text: 'Нажмите «Добавить»' },
      ]
    : [
        { icon: Share, text: 'Tap "Share" ⬆ at the bottom' },
        { icon: ChevronRight, text: 'Select "Add to Home Screen"' },
        { icon: Check, text: 'Tap "Add"' },
      ];

  const androidSteps = language === 'ru'
    ? [
        { icon: MoreVertical, text: 'Откройте меню (⋮) браузера' },
        { icon: ChevronRight, text: 'Нажмите иконку ⬇️ загрузки вверху меню' },
        { icon: Check, text: 'Нажмите «Установить»' },
      ]
    : [
        { icon: MoreVertical, text: 'Open browser menu (⋮)' },
        { icon: ChevronRight, text: 'Tap the ⬇️ download icon at the top' },
        { icon: Check, text: 'Tap "Install"' },
      ];

  const steps = isIOS ? iosSteps : androidSteps;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <button
              key={index}
              onClick={() => setCurrentStep(index + 1)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all',
                isActive && 'bg-primary/10 ring-2 ring-primary',
                isCompleted && 'bg-muted opacity-60',
                !isActive && !isCompleted && 'bg-muted/50'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className={cn('text-sm', isActive && 'font-medium')}>
                {step.text}
              </span>
            </button>
          );
        })}
      </div>

      {currentStep >= steps.length && (
        <button
          onClick={onConfirmInstalled}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          {language === 'ru' ? 'Готово, я установил(а)!' : "Done, I've installed it!"}
        </button>
      )}

      {currentStep < steps.length && (
        <p className="text-xs text-muted-foreground text-center">
          {language === 'ru'
            ? 'Нажимайте на шаги по мере выполнения'
            : 'Tap each step as you complete it'}
        </p>
      )}
    </div>
  );
};
