/**
 * Chat History API - синхронизация истории чата с backend
 */

import { Message } from './storage';

const API_URL = import.meta.env.VITE_BACKEND_URL || '';

// Generate or get persistent user ID
export const getUserId = (): string => {
  let userId = localStorage.getItem('talkme_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('talkme_user_id', userId);
  }
  return userId;
};

/**
 * Save messages to backend
 */
export const saveMessagesToBackend = async (agentId: string, messages: Message[]): Promise<boolean> => {
  try {
    const userId = getUserId();
    
    // Only save messages for this agent
    const agentMessages = messages.filter(m => m.agentId === agentId);
    
    if (agentMessages.length === 0) {
      return true;
    }
    
    // Convert to backend format
    const messagesData = agentMessages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      imageUrl: m.imageUrl || null,
    }));
    
    const response = await fetch(`${API_URL}/chat-history/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        agentId,
        messages: messagesData,
      }),
    });
    
    if (!response.ok) {
      console.error('[ChatHistory] Save failed:', response.status);
      return false;
    }
    
    const result = await response.json();
    console.log(`[ChatHistory] Saved ${result.count} messages for agent ${agentId}`);
    return true;
  } catch (error) {
    console.error('[ChatHistory] Save error:', error);
    return false;
  }
};

/**
 * Load messages from backend
 */
export const loadMessagesFromBackend = async (agentId: string): Promise<Message[]> => {
  try {
    const userId = getUserId();
    
    const response = await fetch(`${API_URL}/chat-history/${userId}/${agentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('[ChatHistory] Load failed:', response.status);
      return [];
    }
    
    const data = await response.json();
    const messages: Message[] = (data.messages || []).map((m: any) => ({
      id: m.id,
      agentId: agentId,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      imageUrl: m.imageUrl,
    }));
    
    console.log(`[ChatHistory] Loaded ${messages.length} messages for agent ${agentId}`);
    return messages;
  } catch (error) {
    console.error('[ChatHistory] Load error:', error);
    return [];
  }
};

/**
 * Clear chat history on backend
 */
export const clearChatHistoryOnBackend = async (agentId: string): Promise<boolean> => {
  try {
    const userId = getUserId();
    
    const response = await fetch(`${API_URL}/chat-history/${userId}/${agentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('[ChatHistory] Clear failed:', response.status);
      return false;
    }
    
    console.log(`[ChatHistory] Cleared history for agent ${agentId}`);
    return true;
  } catch (error) {
    console.error('[ChatHistory] Clear error:', error);
    return false;
  }
};

/**
 * Debounced save - prevents too many API calls
 */
let saveTimeouts: Record<string, ReturnType<typeof setTimeout>> = {};

export const debouncedSave = (agentId: string, messages: Message[], delayMs: number = 2000): void => {
  // Clear existing timeout for this agent
  if (saveTimeouts[agentId]) {
    clearTimeout(saveTimeouts[agentId]);
  }
  
  // Set new timeout
  saveTimeouts[agentId] = setTimeout(() => {
    saveMessagesToBackend(agentId, messages);
    delete saveTimeouts[agentId];
  }, delayMs);
};
