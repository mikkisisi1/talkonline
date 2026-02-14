/**
 * IndexedDB-based audio cache for welcome messages.
 * Generates audio once via Fish Audio TTS, stores blob in IDB, replays from cache.
 */

/** Strip emoji before sending to TTS */
function stripEmoji(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{1F3FB}-\u{1F3FF}\u{E0020}-\u{E007F}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Add prosody-enhancing punctuation for more natural rhythm */
function enhanceProsody(text: string): string {
  return stripEmoji(text)
    .replace(/(\S) (и |а |но |или )/g, '$1, $2')
    .replace(/(\.\s*)(Ну |Вот |Так )/g, '$1... $2')
    .replace(/([^,.:;!?]{55,?}?\S)\s/g, (match, group) => {
      if (/[,.:;!?]/.test(match)) return match;
      return `${group}, `;
    });
}

const DB_NAME = 'talkme-audio-cache';
const STORE_NAME = 'audio';
const DB_VERSION = 6;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getCachedAudio(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCachedAudio(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(blob, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Silently fail
  }
}

/**
 * Get or generate welcome audio.
 * Returns an object URL ready to play, or null on failure.
 */
export async function getWelcomeAudioUrl(
  agentId: string,
  language: string,
  text: string,
  voiceId: string,
  voiceSpeed: number
): Promise<string | null> {
  const cacheKey = `welcome_${agentId}_${language}`;

  const cached = await getCachedAudio(cacheKey);
  if (cached && cached.size > 100) {
    return URL.createObjectURL(cached);
  }

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fish-audio-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Accept': 'audio/mpeg',
          },
          body: JSON.stringify({ text: enhanceProsody(text), language, voice: voiceId, speed: voiceSpeed }),
        }
      );

      if (!response.ok) {
        console.error(`[AudioCache] TTS failed (attempt ${attempt}):`, response.status);
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }
        return null;
      }

      const blob = await response.blob();
      if (blob.size < 100) {
        console.error('[AudioCache] Received empty/tiny audio blob:', blob.size, 'bytes');
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }
        return null;
      }
      await setCachedAudio(cacheKey, blob);
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error(`[AudioCache] Error (attempt ${attempt}):`, error);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
      return null;
    }
  }
  return null;
}
