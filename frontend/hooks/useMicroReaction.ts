import { useCallback, useRef } from 'react';

// Natural "breath in" / thinking sounds via Web Audio API
// Simulates agent taking a breath before responding
export const useMicroReaction = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playMicroReaction = useCallback(() => {
    try {
      // Create audio context on first use
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      
      // === Breath-in sound (inhale) ===
      // White noise filtered to sound like breathing
      const bufferSize = ctx.sampleRate * 0.5; // 500ms
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      // Generate pink-ish noise (more natural than white)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
      
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      
      // Bandpass filter to make it sound like breath
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(0.5, now);
      
      // Gain envelope - quick inhale feel
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.06, now + 0.08);
      gainNode.gain.linearRampToValueAtTime(0.04, now + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      
      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      noiseSource.start(now);
      noiseSource.stop(now + 0.5);
      
      // === Optional soft "mm" undertone ===
      const oscillator = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(150, now + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(130, now + 0.4);
      
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.02, now + 0.15);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      oscillator.connect(oscGain);
      oscGain.connect(ctx.destination);
      
      oscillator.start(now + 0.1);
      oscillator.stop(now + 0.45);
      
    } catch {
      // Silently fail - audio is enhancement, not critical
    }
  }, []);

  return { playMicroReaction };
};
