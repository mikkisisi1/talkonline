import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AppState, 
  Message, 
  UserMemory, 
  Wallpaper,
  VoiceId,
  Agent,
  Theme,
  loadState, 
  saveState, 
  generateId,
  clearMessages as storageClearMessages,
  clearMemory as storageClearMemory,
} from '@/lib/storage';
import { Language, getTranslation } from '@/lib/translations';
import { 
  debouncedSave, 
  loadMessagesFromBackend, 
  clearChatHistoryOnBackend 
} from '@/lib/chatHistoryApi';

export const useAppState = () => {
  const [state, setState] = useState<AppState>(loadState);
  const t = getTranslation(state.memory.language);
  
  // Track loaded agents to avoid duplicate loads
  const loadedAgentsRef = useRef<Set<string>>(new Set());
  
  // Load chat history from backend when agent is selected
  useEffect(() => {
    const loadHistory = async () => {
      const agentId = state.memory.activeAgentId;
      if (!agentId || loadedAgentsRef.current.has(agentId)) return;
      
      loadedAgentsRef.current.add(agentId);
      
      try {
        const backendMessages = await loadMessagesFromBackend(agentId);
        if (backendMessages.length > 0) {
          // Merge with local: prefer backend if newer or local is empty
          setState(prev => {
            const localAgentMessages = prev.messages.filter(m => m.agentId === agentId);
            const otherMessages = prev.messages.filter(m => m.agentId !== agentId);
            
            // If backend has more messages, use backend
            if (backendMessages.length > localAgentMessages.length) {
              console.log(`[useAppState] Loaded ${backendMessages.length} messages from backend for ${agentId}`);
              return {
                ...prev,
                messages: [...otherMessages, ...backendMessages],
              };
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('[useAppState] Failed to load history:', error);
      }
    };
    
    loadHistory();
  }, [state.memory.activeAgentId]);

  // Автоматическое переключение темы по времени суток
  useEffect(() => {
    const updateThemeByTime = () => {
      const hour = new Date().getHours();
      // Тёмная тема: 18:00 - 06:00, Светлая: 06:00 - 18:00
      const shouldBeDark = hour >= 18 || hour < 6;
      const currentTheme = state.memory.theme;
      const newTheme = shouldBeDark ? 'dark' : 'light';
      
      // Автоматически переключаем только если пользователь не менял вручную
      const autoThemeKey = 'talkme_auto_theme';
      const lastManualChange = localStorage.getItem('talkme_manual_theme_change');
      const now = Date.now();
      
      // Если прошло более 6 часов с ручного изменения - снова включаем авто
      if (!lastManualChange || (now - parseInt(lastManualChange)) > 6 * 60 * 60 * 1000) {
        if (currentTheme !== newTheme) {
          setState(prev => ({
            ...prev,
            memory: { ...prev.memory, theme: newTheme },
          }));
        }
      }
    };
    
    // Проверяем при загрузке и каждый час
    updateThemeByTime();
    const interval = setInterval(updateThemeByTime, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [state.memory.theme]);

  // One-time migration: ensure all messages have agentId (covers old localStorage + HMR state)
  useEffect(() => {
    setState(prev => {
      const needsMigration = prev.messages.some((m: any) => !m?.agentId);
      if (!needsMigration) return prev;

      const fallbackAgentId = prev.memory.activeAgentId || prev.memory.agents[0]?.id || 'ivan';
      return {
        ...prev,
        messages: prev.messages.map((m: any) => ({
          ...m,
          agentId: m.agentId || fallbackAgentId,
        })),
      };
    });
  }, []);

  useEffect(() => {
    saveState(state);
    
    // Auto-save to backend when messages change (debounced)
    if (state.memory.activeAgentId && state.messages.length > 0) {
      debouncedSave(state.memory.activeAgentId, state.messages);
    }
  }, [state]);

  const addMessage = useCallback(
    (content: string, role: 'user' | 'assistant', imageUrl?: string, agentId?: string) => {
      const agentIdFinal = agentId ?? state.memory.activeAgentId;
      const message: Message = {
        id: generateId(),
        agentId: agentIdFinal,
        content,
        role,
        timestamp: Date.now(),
        imageUrl,
      };
      setState(prev => {
        // Prevent duplicate messages (same content + role within 5s)
        if (content) {
          const last = prev.messages[prev.messages.length - 1];
          if (last && last.role === role && last.content === content && Date.now() - last.timestamp < 5000) {
            return prev;
          }
        }
        return {
          ...prev,
          messages: [...prev.messages, message],
          memory: {
            ...prev.memory,
            lastActive: Date.now(),
          },
        };
      });
      return message;
    },
    [state.memory.activeAgentId]
  );

  const updateMessage = useCallback((messageId: string, content: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m =>
        m.id === messageId ? { ...m, content } : m
      ),
    }));
  }, []);

  const updateMemory = useCallback((updates: Partial<UserMemory>) => {
    setState(prev => ({
      ...prev,
      memory: { ...prev.memory, ...updates },
    }));
  }, []);

  const setLanguage = useCallback((language: Language) => {
    updateMemory({ language });
  }, [updateMemory]);

  const toggleVoice = useCallback(() => {
    setState(prev => ({
      ...prev,
      memory: { ...prev.memory, voiceEnabled: !prev.memory.voiceEnabled },
    }));
  }, []);

  const setWallpaper = useCallback((wallpaper: Wallpaper) => {
    updateMemory({ wallpaper });
  }, [updateMemory]);

  const setVoiceId = useCallback((voiceId: VoiceId) => {
    updateMemory({ voiceId });
  }, [updateMemory]);

  const setVoiceSpeed = useCallback((voiceSpeed: number) => {
    updateMemory({ voiceSpeed });
  }, [updateMemory]);

  const setTheme = useCallback((theme: Theme) => {
    // Отмечаем что пользователь вручную изменил тему
    localStorage.setItem('talkme_manual_theme_change', Date.now().toString());
    updateMemory({ theme });
  }, [updateMemory]);

  // Agent management
  const getActiveAgent = useCallback((): Agent | undefined => {
    return state.memory.agents.find(a => a.id === state.memory.activeAgentId);
  }, [state.memory.agents, state.memory.activeAgentId]);

  const addAgent = useCallback((agent: Omit<Agent, 'id'>) => {
    const newAgent: Agent = {
      ...agent,
      id: generateId(),
    };
    setState(prev => ({
      ...prev,
      memory: {
        ...prev.memory,
        agents: [...prev.memory.agents, newAgent],
        activeAgentId: newAgent.id,
      },
    }));
    return newAgent;
  }, []);

  const updateAgent = useCallback((agentId: string, updates: Partial<Agent>) => {
    setState(prev => ({
      ...prev,
      memory: {
        ...prev.memory,
        agents: prev.memory.agents.map(a => 
          a.id === agentId ? { ...a, ...updates } : a
        ),
      },
    }));
  }, []);

  const deleteAgent = useCallback((agentId: string) => {
    setState(prev => {
      const remainingAgents = prev.memory.agents.filter(a => a.id !== agentId);
      // If deleting active agent, switch to first remaining
      const newActiveId = prev.memory.activeAgentId === agentId 
        ? remainingAgents[0]?.id || ''
        : prev.memory.activeAgentId;
      return {
        ...prev,
        memory: {
          ...prev.memory,
          agents: remainingAgents,
          activeAgentId: newActiveId,
        },
      };
    });
  }, []);

  const setActiveAgent = useCallback((agentId: string) => {
    updateMemory({ activeAgentId: agentId });
  }, [updateMemory]);

  const toggleLearningMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      memory: { ...prev.memory, learningMode: !prev.memory.learningMode },
    }));
  }, []);

  const clearChat = useCallback(() => {
    storageClearMessages();
    setState(prev => ({
      ...prev,
      messages: [],
    }));
  }, []);

  const clearAgentChat = useCallback((agentId: string) => {
    // Clear on backend
    clearChatHistoryOnBackend(agentId);
    // Clear locally
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(m => m.agentId !== agentId),
    }));
  }, []);

  const clearMemory = useCallback(() => {
    storageClearMemory();
    setState(prev => ({
      ...prev,
      memory: {
        language: prev.memory.language,
        theme: prev.memory.theme,
        learningMode: prev.memory.learningMode,
        voiceEnabled: prev.memory.voiceEnabled,
        voiceId: prev.memory.voiceId,
        voiceSpeed: prev.memory.voiceSpeed,
        wallpaper: prev.memory.wallpaper,
        facts: [],
        lastActive: Date.now(),
        agents: prev.memory.agents,
        activeAgentId: prev.memory.activeAgentId,
      },
    }));
  }, []);

  return {
    messages: state.messages,
    memory: state.memory,
    t,
    addMessage,
    updateMessage,
    updateMemory,
    setLanguage,
    setTheme,
    setWallpaper,
    setVoiceId,
    setVoiceSpeed,
    getActiveAgent,
    addAgent,
    updateAgent,
    deleteAgent,
    setActiveAgent,
    toggleVoice,
    toggleLearningMode,
    clearChat,
    clearAgentChat,
    clearMemory,
  };
};
