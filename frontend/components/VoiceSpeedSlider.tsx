import { Slider } from '@/components/ui/slider';
import { Language } from '@/lib/translations';

interface VoiceSpeedSliderProps {
  language: Language;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const speedLabels = {
  ru: { slow: 'Медленно', normal: 'Нормально', fast: 'Быстро', label: 'Скорость речи' },
  en: { slow: 'Slow', normal: 'Normal', fast: 'Fast', label: 'Speech speed' },
};

export const VoiceSpeedSlider = ({ language, speed, onSpeedChange }: VoiceSpeedSliderProps) => {
  const t = speedLabels[language];

  const getSpeedLabel = (value: number) => {
    if (value <= 0.8) return t.slow;
    if (value >= 1.2) return t.fast;
    return t.normal;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t.label}</span>
        <span className="text-sm text-muted-foreground">{getSpeedLabel(speed)}</span>
      </div>
      <Slider
        value={[speed]}
        onValueChange={([value]) => onSpeedChange(value)}
        min={0.7}
        max={1.3}
        step={0.1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0.7x</span>
        <span>1.0x</span>
        <span>1.3x</span>
      </div>
    </div>
  );
};
