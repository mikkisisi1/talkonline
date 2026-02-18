import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { ChatView } from '@/components/ChatView';
import { Settings } from '@/components/Settings';
import { LucasWelcomeVideo } from '@/components/LucasWelcomeVideo';
import { useAppState } from '@/hooks/useAppState';
import { generateFriendResponseStream } from '@/lib/friendAgent';
import { getWelcomeMessage, getWelcomeSpeechText, Language } from '@/lib/translations';
import { getWelcomeAudioUrl } from '@/lib/audioCache';
import { playExhale } from '@/hooks/useSpeechSynthesis';
import { useMicroReaction } from '@/hooks/useMicroReaction';
import { unlockAudioOnce } from '@/lib/audioUnlock';
import { toast } from 'sonner';

const Index = () => {
  const {
    messages,
    memory,
    t,
    addMessage,
    updateMessage,
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
    clearAgentChat,
  } = useAppState();

  const { playMicroReaction } = useMicroReaction();
  const activeAgent = getActiveAgent();
  const activeAgentId = memory.activeAgentId;
  const agentMessages = useMemo(
    () => messages.filter(m => m.agentId === activeAgentId),
    [messages, activeAgentId]
  );
  
  // Dynamic welcome message with agent name
  const welcomeMessage = useMemo(() => {
    const agentName = activeAgent?.name || 'Лукас';
    return getWelcomeMessage(memory.language, agentName);
  }, [memory.language, activeAgent?.name]);

  // Handle language change - update welcome message and regenerate audio
  const handleLanguageChange = useCallback((newLang: Language) => {
    setLanguage(newLang);
    // Clear awakened state to trigger new welcome
    setAwakenedAgents(new Set());
    // Clear session storage for welcome heard
    memory.agents.forEach(a => {
      sessionStorage.removeItem(`welcome_heard_${a.id}`);
    });
  }, [setLanguage, memory.agents]);

  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingTtsText, setPendingTtsText] = useState<string | null>(null);
  const [showLucasVideo, setShowLucasVideo] = useState(false);
  const pendingLucasWakeRef = useRef<boolean>(false);

  // Track which agents have been awakened (for visual state in header)
  const [awakenedAgents, setAwakenedAgents] = useState<Set<string>>(() => {
    const set = new Set<string>();
    memory.agents.forEach(a => {
      if (sessionStorage.getItem(`welcome_heard_${a.id}`)) set.add(a.id);
    });
    return set;
  });
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-teal', 'theme-dark');
    root.classList.add(memory.theme === 'dark' ? 'theme-dark' : 'theme-teal');
  }, [memory.theme]);

  // Pre-generate welcome audio for all agents in background
  useEffect(() => {
    if (!memory.voiceEnabled) return;
    memory.agents.forEach(agent => {
      const text = getWelcomeSpeechText(memory.language, agent.name);
      getWelcomeAudioUrl(agent.id, memory.language, text, agent.voiceId, memory.voiceSpeed)
        .then(url => { if (url) URL.revokeObjectURL(url); })
        .catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const welcomeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Play a soft chime on agent tap
  const playTapChime = useCallback(async () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();
      const now = ctx.currentTime;

      // Маленький необычный колокольчик - с лёгким мерцанием
      // Две близкие частоты создают эффект "биения"
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1319, now); // E6
      gain1.gain.setValueAtTime(0.1, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Чуть расстроенная нота - создаёт "мерцание"
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1325, now); // чуть выше - биение
      gain2.gain.setValueAtTime(0.1, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.5);

      // Высокий призвук - "блик"
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(2637, now); // E7
      gain3.gain.setValueAtTime(0.04, now);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now);
      osc3.stop(now + 0.25);
    } catch {}
  }, []);

  // Guard ref to prevent double-firing of wake logic
  const wakingRef = useRef<Set<string>>(new Set());

  // Handle pending welcome from IdolsPage (new idol was added)
  useEffect(() => {
    const pendingWelcome = sessionStorage.getItem('pending_welcome_agent');
    if (!pendingWelcome) return;
    
    try {
      const { agentId, agentName, voiceId } = JSON.parse(pendingWelcome);
      sessionStorage.removeItem('pending_welcome_agent');
      
      // Small delay to let the page render
      setTimeout(async () => {
        unlockAudioOnce();
        
        // Mark as awakened
        sessionStorage.setItem(`welcome_heard_${agentId}`, '1');
        setAwakenedAgents(prev => new Set(prev).add(agentId));
        
        // Add welcome message
        const agentWelcome = getWelcomeMessage(memory.language, agentName);
        addMessage(agentWelcome, 'assistant', undefined, agentId);
        
        // Play chime
        playTapChime();
        
        // Play welcome audio
        if (memory.voiceEnabled) {
          try {
            const welcomeText = getWelcomeSpeechText(memory.language, agentName);
            const audioUrl = await getWelcomeAudioUrl(agentId, memory.language, welcomeText, voiceId, memory.voiceSpeed);
            if (audioUrl) {
              await new Promise(r => setTimeout(r, 500));
              const audio = new Audio(audioUrl);
              welcomeAudioRef.current = audio;
              audio.onended = async () => {
                URL.revokeObjectURL(audioUrl);
                welcomeAudioRef.current = null;
                await playExhale();
              };
              await audio.play();
            }
          } catch (err) {
            console.error('[Welcome Idol] Audio error:', err);
          }
        }
      }, 300);
    } catch (e) {
      sessionStorage.removeItem('pending_welcome_agent');
    }
  }, []);

  // Complete Lucas wake after video ends
  const completeLucasWake = useCallback(async () => {
    setShowLucasVideo(false);
    
    const agent = memory.agents.find(a => a.id === 'ivan');
    if (!agent) return;
    
    // Mark as awakened
    sessionStorage.setItem(`welcome_heard_ivan`, '1');
    setAwakenedAgents(prev => new Set(prev).add('ivan'));
    
    // Add welcome message
    const agentMsgs = messages.filter(m => m.agentId === 'ivan');
    if (agentMsgs.length === 0) {
      const agentWelcome = getWelcomeMessage(memory.language, agent.name);
      addMessage(agentWelcome, 'assistant', undefined, 'ivan');
    }
    
    // Play welcome audio
    if (memory.voiceEnabled) {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        welcomeAudioRef.current = audio;
        
        const agentWelcome = getWelcomeSpeechText(memory.language, agent.name);
        const audioUrl = await getWelcomeAudioUrl('ivan', memory.language, agentWelcome, agent.voiceId, memory.voiceSpeed);
        if (audioUrl) {
          await new Promise(r => setTimeout(r, 500));
          audio.src = audioUrl;
          audio.onended = async () => {
            URL.revokeObjectURL(audioUrl);
            welcomeAudioRef.current = null;
            await playExhale();
          };
          await audio.play();
        }
      } catch (err) {
        console.error('[Lucas Welcome] Audio error:', err);
      }
    }
    
    pendingLucasWakeRef.current = false;
  }, [memory.agents, memory.language, memory.voiceEnabled, memory.voiceSpeed, messages, addMessage]);

  // Handle selecting an agent — if not yet awakened, play chime + welcome audio
  const handleSelectAgent = useCallback(async (agentId: string) => {
    // Selecting an agent is a user gesture — unlock audio early for welcome/TTS.
    unlockAudioOnce();

    const agent = memory.agents.find(a => a.id === agentId);
    if (!agent) return;

    // Prevent double-firing (fast double-tap)
    if (wakingRef.current.has(agentId)) return;

    const isFirstWake = !awakenedAgents.has(agentId);

    // Stop any currently playing welcome audio before switching
    if (welcomeAudioRef.current) {
      try {
        welcomeAudioRef.current.pause();
        welcomeAudioRef.current.currentTime = 0;
        welcomeAudioRef.current.onended = null;
      } catch {}
      welcomeAudioRef.current = null;
    }

    // Play chime on every agent switch
    playTapChime();

    if (isFirstWake) {
      // Guard against double-fire
      wakingRef.current.add(agentId);
      
      // Special case: Lucas (ivan) - show video first
      if (agentId === 'ivan' && !pendingLucasWakeRef.current) {
        pendingLucasWakeRef.current = true;
        setActiveAgent(agentId);
        setShowLucasVideo(true);
        return; // Video will call completeLucasWake when done
      }
      
      // Mark as heard immediately
      sessionStorage.setItem(`welcome_heard_${agentId}`, '1');
      setAwakenedAgents(prev => new Set(prev).add(agentId));

      // Create Audio element in user gesture context
      const audio = new Audio();
      audio.preload = 'auto';
      welcomeAudioRef.current = audio;

      // Switch agent
      setActiveAgent(agentId);

      // Add welcome message
      const agentMsgs = messages.filter(m => m.agentId === agentId);
      if (agentMsgs.length === 0) {
        const agentWelcome = getWelcomeMessage(memory.language, agent.name);
        addMessage(agentWelcome, 'assistant', undefined, agentId);
      }

      // Play welcome audio from cache
      if (memory.voiceEnabled) {
        try {
          const agentWelcome = getWelcomeSpeechText(memory.language, agent.name);
          const audioUrl = await getWelcomeAudioUrl(agentId, memory.language, agentWelcome, agent.voiceId, memory.voiceSpeed);
          if (audioUrl) {
            await new Promise(r => setTimeout(r, 500));
            audio.src = audioUrl;
            audio.onended = async () => {
              URL.revokeObjectURL(audioUrl);
              welcomeAudioRef.current = null;
              await playExhale();
            };
            await audio.play();
          }
        } catch (err) {
          console.error('[Welcome] Audio error:', err);
        }
      }
    } else {
      setActiveAgent(agentId);
    }
  }, [memory.agents, memory.language, memory.voiceEnabled, memory.voiceSpeed, messages, addMessage, setActiveAgent, playTapChime, awakenedAgents, playMicroReaction]);

  // Welcome message is now sent ONLY inside handleSelectAgent to avoid race conditions.
  // No separate useEffect needed.

  // RAF-batched streaming: accumulate chunks in a ref and flush via requestAnimationFrame
  const streamBufferRef = useRef<{ msgId: string; text: string } | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const flushStreamBuffer = useCallback(() => {
    rafIdRef.current = null;
    const buf = streamBufferRef.current;
    if (buf && buf.text) {
      updateMessage(buf.msgId, buf.text);
    }
  }, [updateMessage]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const handleSendMessage = useCallback(async (content: string, imageUrl?: string) => {
    // Sending (or auto-sending after typing) should have audio unlocked already,
    // but calling this is harmless and helps in some browsers.
    unlockAudioOnce();

    const userContent = imageUrl ? (content || (memory.language === 'ru' ? '📷 Фото' : '📷 Photo')) : content;
    addMessage(userContent, 'user', imageUrl, activeAgentId);

    setIsTyping(true);

    // Play thinking "мм" sound while agent is "thinking"
    if (memory.voiceEnabled) {
      playMicroReaction();
    }

    // Small delay for natural feel
    const delay = 400 + Math.random() * 400;
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      const messageForAI = imageUrl
        ? (content || (memory.language === 'ru' ? 'Посмотри на это фото и прокомментируй' : 'Look at this photo and comment'))
        : content;

      // Create placeholder assistant message immediately
      const assistantMsg = addMessage('', 'assistant', undefined, activeAgentId);
      setIsTyping(false);

      // Init stream buffer
      streamBufferRef.current = { msgId: assistantMsg.id, text: '' };

      // Stream the response — skip the first welcome message so the AI doesn't comment on it
      const historyWithoutWelcome = agentMessages.length > 0 && agentMessages[0].role === 'assistant'
        ? agentMessages.slice(1)
        : agentMessages;
      const fullText = await generateFriendResponseStream(
        [...historyWithoutWelcome, { id: 'temp', agentId: activeAgentId, content: messageForAI, role: 'user', timestamp: Date.now() }],
        memory,
        (chunk) => {
          // Batch chunk updates: write to buffer, schedule single RAF
          if (streamBufferRef.current) {
            streamBufferRef.current.text = chunk;
          }
          if (!rafIdRef.current) {
            rafIdRef.current = requestAnimationFrame(flushStreamBuffer);
          }
        },
        activeAgent ? { name: activeAgent.name, gender: activeAgent.gender, personality: activeAgent.personality } : undefined,
        imageUrl
      );

      // Final update: cancel any pending RAF and apply final text
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      streamBufferRef.current = null;

      if (fullText) {
        updateMessage(assistantMsg.id, fullText);
        setPendingTtsText(fullText.replace(/\[video:[^\]]*\]/g, '').trim());
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(memory.language === 'ru' ? 'Ошибка соединения' : 'Connection error');
      setIsTyping(false);
    }
  }, [agentMessages, memory, addMessage, updateMessage, activeAgentId, activeAgent, flushStreamBuffer]);

  const handleClearAgentChat = useCallback((agentId: string) => {
    clearAgentChat(agentId);
    toast.success(t.chatCleared);
    // If clearing active agent's chat, add welcome message
    if (agentId === activeAgentId) {
      setTimeout(() => {
        addMessage(welcomeMessage, 'assistant', undefined, activeAgentId);
      }, 300);
    }
  }, [clearAgentChat, addMessage, t, activeAgentId, welcomeMessage]);

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', maxHeight: '-webkit-fill-available' }}>
      {showSettings ? (
        <Settings
          language={memory.language}
          theme={memory.theme}
          learningMode={memory.learningMode}
          wallpaper={memory.wallpaper}
          onBack={() => setShowSettings(false)}
          onLanguageChange={setLanguage}
          onThemeChange={setTheme}
          onLearningModeToggle={toggleLearningMode}
          onWallpaperChange={setWallpaper}
        />
      ) : (
        <ChatView
          key={activeAgentId}
          messages={agentMessages}
          language={memory.language}
          voiceEnabled={memory.voiceEnabled}
          voiceId={activeAgent?.voiceId || memory.voiceId}
          voiceSpeed={memory.voiceSpeed}
          wallpaper={memory.wallpaper}
          agents={memory.agents}
          activeAgentId={memory.activeAgentId}
          onSendMessage={handleSendMessage}
          onSettingsClick={() => setShowSettings(true)}
          onLanguageChange={handleLanguageChange}
          onAddAgent={addAgent}
          onUpdateAgent={updateAgent}
          onDeleteAgent={deleteAgent}
          onSelectAgent={handleSelectAgent}
          onClearAgentChat={handleClearAgentChat}
          isTyping={isTyping}
          pendingTtsText={pendingTtsText}
          onTtsPlayed={() => setPendingTtsText(null)}
          awakenedAgents={awakenedAgents}
        />
      )}
    </div>
  );
};

export default Index;
