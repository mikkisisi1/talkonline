import { Language } from './translations';
import { Message, UserMemory, AgentGender } from './storage';

export interface AgentInfo {
  name: string;
  gender: AgentGender;
  personality?: string;
}

// Non-streaming fallback
export const generateFriendResponse = async (
  messages: Message[],
  memory: UserMemory,
  agent?: AgentInfo,
  imageBase64?: string
): Promise<string> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/friend-chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          language: memory.language,
          learningMode: memory.learningMode,
          memory: { name: memory.name, facts: memory.facts },
          agent: agent ? { name: agent.name, gender: agent.gender, personality: agent.personality } : undefined,
          imageBase64: imageBase64 || undefined,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        return memory.language === 'ru'
          ? 'Слишком много запросов. Давай немного подождём?'
          : 'Too many requests. Let\'s wait a moment?';
      }
      if (response.status === 402) {
        return memory.language === 'ru'
          ? 'Нужно пополнить баланс для продолжения.'
          : 'Credits needed to continue.';
      }
      throw new Error(errorData.error || 'API error');
    }

    const data = await response.json();
    return data.content || getFallbackResponse(memory.language);
  } catch (error) {
    console.error('Error generating response:', error);
    return getFallbackResponse(memory.language);
  }
};

// Streaming version — calls onChunk with accumulated text as it arrives
const MAX_RETRIES = 2;

export const generateFriendResponseStream = async (
  messages: Message[],
  memory: UserMemory,
  onChunk: (accumulatedText: string) => void,
  agent?: AgentInfo,
  imageBase64?: string
): Promise<string> => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await _doStream(messages, memory, onChunk, agent, imageBase64);
      return result;
    } catch (error) {
      console.error(`[friendAgent] attempt ${attempt + 1} failed:`, error);
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
        continue;
      }
      return getFallbackResponse(memory.language);
    }
  }
  return getFallbackResponse(memory.language);
};

const _doStream = async (
  messages: Message[],
  memory: UserMemory,
  onChunk: (accumulatedText: string) => void,
  agent?: AgentInfo,
  imageBase64?: string
): Promise<string> => {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/friend-chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        'x-stream': 'true',
      },
      body: JSON.stringify({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        language: memory.language,
        learningMode: memory.learningMode,
        memory: { name: memory.name, facts: memory.facts },
        agent: agent ? { name: agent.name, gender: agent.gender, personality: agent.personality } : undefined,
        imageBase64: imageBase64 || undefined,
      }),
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      const msg = memory.language === 'ru'
        ? 'Слишком много запросов. Давай немного подождём?'
        : 'Too many requests. Let\'s wait a moment?';
      onChunk(msg);
      return msg;
    }
    if (response.status === 402) {
      const msg = memory.language === 'ru'
        ? 'Нужно пополнить баланс для продолжения.'
        : 'Credits needed to continue.';
      onChunk(msg);
      return msg;
    }
    throw new Error(`API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No readable stream');
  }

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const json = JSON.parse(trimmed.slice(6));
        const delta = json.choices?.[0]?.delta?.content || '';
        if (delta) {
          fullText += delta;

          const loopTrimmed = detectRepetitionLoop(fullText);
          if (loopTrimmed !== null) {
            fullText = loopTrimmed;
            onChunk(cleanFinalText(fullText));
            reader.cancel();
            return cleanFinalText(fullText) || getFallbackResponse(memory.language);
          }

          onChunk(fullText);
        }
      } catch {
        // Skip malformed chunks
      }
    }
  }

  const cleaned = cleanFinalText(fullText, messages);
  if (cleaned !== fullText) {
    onChunk(cleaned);
  }

  return cleaned || getFallbackResponse(memory.language);
};

/**
 * Detect if the model is stuck in a repetition loop.
 * Returns trimmed text if loop found, null otherwise.
 */
function detectRepetitionLoop(text: string): string | null {
  if (text.length < 80) return null;
  const words = text.split(/\s+/);
  if (words.length < 20) return null;

  // Only detect real loops: the SAME phrase must appear 3+ times consecutively at the tail
  for (let wLen = 3; wLen <= Math.min(6, Math.floor(words.length / 3)); wLen++) {
    const tail = words.slice(-wLen).join(' ').toLowerCase();
    // Check if this phrase appears at least 3 times at the end
    let copies = 0;
    let pos = words.length;
    while (pos >= wLen) {
      const chunk = words.slice(pos - wLen, pos).join(' ').toLowerCase();
      if (chunk === tail) {
        copies++;
        pos -= wLen;
      } else {
        break;
      }
    }
    if (copies >= 3) {
      // Keep text up to the first occurrence of this repeated block
      const keepUntil = pos + wLen;
      return words.slice(0, keepUntil).join(' ').trim();
    }
  }
  return null;
}

/**
 * Clean final text: remove consecutive duplicate words (3+) and repeated short phrases.
 */
function cleanFinalText(text: string, previousMessages?: Message[]): string {
  let result = text.trim();
  if (!result) return result;

  // 1. Keep only the FIRST [video:scene_X] tag, remove duplicates and everything after
  const allVideoTags = [...result.matchAll(/\[video:scene_\d+\]/g)];
  if (allVideoTags.length > 1) {
    const firstEnd = allVideoTags[0].index! + allVideoTags[0][0].length;
    result = result.substring(0, firstEnd).trim();
  } else if (allVideoTags.length === 1) {
    result = result.substring(0, allVideoTags[0].index! + allVideoTags[0][0].length).trim();
  }

  // 1b. Remove video tag only if it was used in the IMMEDIATELY PREVIOUS assistant message
  // (allow re-use of scenes across conversation, just prevent back-to-back repeats)
  if (previousMessages) {
    const currentTag = result.match(/\[video:(scene_\d+)\]/);
    if (currentTag) {
      const currentScene = currentTag[1];
      // Find the last assistant message that had a video tag
      for (let i = previousMessages.length - 1; i >= 0; i--) {
        const msg = previousMessages[i];
        if (msg.role === 'assistant' && msg.content) {
          const lastTag = msg.content.match(/\[video:(scene_\d+)\]/);
          if (lastTag && lastTag[1] === currentScene) {
            // Same scene as the very last video — remove to avoid back-to-back repeat
            result = result.replace(/\n*\[video:scene_\d+\]/, '').trim();
          }
          break; // Only check the most recent assistant message with a video
        }
      }
    }
  }

  // 2. Remove leaked "видео"/"video"/"scene_N" references OUTSIDE of valid [video:scene_X] tags
  // First, temporarily replace valid tags with placeholders
  const validTags: string[] = [];
  result = result.replace(/\[video:(?:sofia_)?scene_\d+\]/g, (match) => {
    validTags.push(match);
    return `__VIDEO_TAG_${validTags.length - 1}__`;
  });
  result = result.replace(/\[photo:sofia_photo_\d+\]/g, (match) => {
    validTags.push(match);
    return `__VIDEO_TAG_${validTags.length - 1}__`;
  });

  result = result.replace(/(?:видео|video)\s*(?:(?:сцен[аыуе]?|scenes?|синс|scene_?\d*)\s*)?[\d\s,]+/gi, '').trim();
  result = result.replace(/[,.\s]*(?:видео|video|сцен[аыуе]?|scenes?|синс|scene_?\d+)\s*$/gi, '').trim();
  result = result.replace(/\s+(?:видео|video)\s*$/gi, '').trim();

  // 2b. Remove standalone leaked numbers at end (e.g. "... 7 10 15")
  result = result.replace(/\s+[\d\s,]{2,}$/g, '').trim();
  // 2c. Remove scene_N references without [video:] wrapper
  result = result.replace(/\bscene_\d+\b/gi, '').trim();

  // Restore valid tags
  validTags.forEach((tag, i) => {
    result = result.replace(`__VIDEO_TAG_${i}__`, tag);
  });

  // Remove 3+ consecutive identical words: "почему почему почему почему" → "почему"
  result = result.replace(/(\b\S+\b)(\s+\1){2,}/gi, '$1');

  // Remove repeated 2-4 word phrases (e.g. "как дела как дела как дела" → "как дела")
  for (let pLen = 2; pLen <= 4; pLen++) {
    const words = result.split(/\s+/);
    if (words.length < pLen * 2) continue;
    const out: string[] = [];
    let i = 0;
    while (i < words.length) {
      if (i + pLen * 2 <= words.length) {
        const phrase = words.slice(i, i + pLen).join(' ').toLowerCase();
        let copies = 1;
        let j = i + pLen;
        while (j + pLen <= words.length && words.slice(j, j + pLen).join(' ').toLowerCase() === phrase) {
          copies++;
          j += pLen;
        }
        if (copies >= 2) {
          // Keep phrase once, skip duplicates
          out.push(...words.slice(i, i + pLen));
          i = j;
          continue;
        }
      }
      out.push(words[i]);
      i++;
    }
    result = out.join(' ');
  }

  return result.trim();
}

const getFallbackResponse = (language: Language): string => {
  return language === 'ru'
    ? 'Прости, я немного задумался. Повтори, пожалуйста?'
    : 'Sorry, I got lost in thought. Could you repeat that?';
};
