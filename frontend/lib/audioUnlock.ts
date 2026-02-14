let audioCtx: AudioContext | null = null;
let unlocked = false;

/** Single reusable Audio element — primed during user gesture */
let sharedAudio: HTMLAudioElement | null = null;

/**
 * Get or create a persistent AudioContext.
 */
export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * Call inside a user gesture (tap/click/typing) to unlock audio playback.
 * Creates a shared Audio element and resumes the AudioContext.
 * Safe to call repeatedly.
 */
export function unlockAudioOnce(): void {
  // Always ensure the shared Audio element exists (create on first gesture)
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = 'auto';
    sharedAudio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgLsAAAB3AQACABAAZGF0YQAAAAA=';
    sharedAudio.muted = true;
    sharedAudio.play().then(() => {
      sharedAudio!.pause();
      sharedAudio!.muted = false;
      sharedAudio!.currentTime = 0;
    }).catch(() => {
      // CRITICAL: unmute even if play() fails, otherwise all future playback is silent
      sharedAudio!.muted = false;
      sharedAudio!.currentTime = 0;
    });
  }

  if (unlocked) return;

  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        unlocked = true;
      }).catch(() => {});
    } else {
      unlocked = true;
    }
  } catch {
    // Ignore
  }
}

/**
 * Play an audio blob URL using the shared (pre-primed) Audio element.
 * This bypasses autoplay restrictions because the element was created/played
 * during a user gesture.
 *
 * Returns a handle to stop playback and a promise that resolves on end.
 */
export function playBlobWithSharedAudio(
  blobUrl: string,
  volume = 1.0,
  fadeOutDuration = 0,
): { stop: () => void; ended: Promise<void> } {
  // Reuse the primed shared Audio element when available to avoid
  // mobile browser limits on creating new Audio elements.
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = 'auto';
  }
  const audio = sharedAudio;

  // Reset state from any previous playback
  audio.pause();
  audio.onended = null;
  audio.onerror = null;
  audio.ontimeupdate = null;
  audio.oncanplay = null;
  audio.currentTime = 0;

  const clampedVolume = Math.min(1.0, volume);
  audio.volume = clampedVolume;
  audio.src = blobUrl;

  let stopped = false;

  const ended = new Promise<void>((resolve) => {
    const cleanup = () => {
      if (stopped) return;
      stopped = true;
      audio.onended = null;
      audio.onerror = null;
      audio.ontimeupdate = null;
      audio.oncanplay = null;
      resolve();
    };

    audio.onended = cleanup;
    audio.onerror = () => {
      console.error('[Audio] Playback error');
      cleanup();
    };

    // Schedule fade-out near the end
    if (fadeOutDuration > 0) {
      audio.ontimeupdate = () => {
        if (audio.duration && audio.currentTime > audio.duration - fadeOutDuration) {
          const remaining = audio.duration - audio.currentTime;
          audio.volume = Math.max(0, (remaining / fadeOutDuration) * clampedVolume);
        }
      };
    }

    // Wait for audio to be ready, then play
    const doPlay = () => {
      audio.play().catch(() => {
        cleanup();
      });
    };

    // If readyState is already sufficient, play immediately
    if (audio.readyState >= 3) {
      doPlay();
    } else {
      audio.oncanplay = () => {
        audio.oncanplay = null;
        doPlay();
      };
      audio.load();
    }
  });

  return {
    stop: () => {
      if (!stopped) {
        stopped = true;
        audio.pause();
        audio.onended = null;
        audio.onerror = null;
        audio.ontimeupdate = null;
        audio.oncanplay = null;
        audio.currentTime = 0;
      }
    },
    ended,
  };
}
