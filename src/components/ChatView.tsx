import React, { useRef, useEffect, useState, useCallback, useMemo, forwardRef } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { Message, VoiceId, Wallpaper, Agent } from '@/lib/storage';
import { Language, translations } from '@/lib/translations';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

import wallpaperSaturn from '@/assets/wallpaper-saturn.jpg';
import wallpaperMountains from '@/assets/wallpaper-mountains.jpg';
import wallpaperLagoon from '@/assets/wallpaper-lagoon.jpg';
import wallpaperHorses from '@/assets/wallpaper-horses.jpg';
import wallpaperTurtle from '@/assets/wallpaper-turtle.jpg';
import wallpaperCabin from '@/assets/wallpaper-cabin.jpg';
import wallpaperPeak from '@/assets/wallpaper-peak.jpg';

const wallpaperImages: Record<Wallpaper, string> = {
  saturn: wallpaperSaturn,
  mountains: wallpaperMountains,
  lagoon: wallpaperLagoon,
  horses: wallpaperHorses,
  turtle: wallpaperTurtle,
  cabin: wallpaperCabin,
  peak: wallpaperPeak,
};

const VirtuosoList = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ style, children, ...props }, ref) => (
  <div ref={ref} style={style} {...props} className="max-w-3xl mx-auto px-3 py-4">
    {children}
  </div>
));
VirtuosoList.displayName = 'VirtuosoList';

const virtuosoComponents = { List: VirtuosoList };

interface ChatViewProps {
  messages: Message[];
  language: Language;
  voiceEnabled: boolean;
  voiceId: VoiceId;
  voiceSpeed: number;
  wallpaper: Wallpaper;
  agents: Agent[];
  activeAgentId: string;
  onSendMessage: (content: string, imageUrl?: string) => Promise<void>;
  onSettingsClick: () => void;
  onAddAgent: (agent: Omit<Agent, 'id'>) => Agent;
  onUpdateAgent: (agentId: string, updates: Partial<Agent>) => void;
  onDeleteAgent: (agentId: string) => void;
  onSelectAgent: (agentId: string) => void;
  onClearAgentChat?: (agentId: string) => void;
  isTyping: boolean;
  pendingTtsText?: string | null;
  onTtsPlayed?: () => void;
  awakenedAgents?: Set<string>;
}

export const ChatView = ({
  messages,
  language,
  voiceEnabled,
  voiceId,
  voiceSpeed,
  wallpaper,
  agents,
  activeAgentId,
  onSendMessage,
  onSettingsClick,
  onAddAgent,
  onUpdateAgent,
  onDeleteAgent,
  onSelectAgent,
  onClearAgentChat,
  isTyping,
  pendingTtsText,
  onTtsPlayed,
  awakenedAgents,
}: ChatViewProps) => {
  const activeAgent = agents.find(a => a.id === activeAgentId);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [isSending, setIsSending] = useState(false);
  const lastUserSendRef = useRef<{ content: string; at: number } | null>(null);
  const { 
    isListening, 
    transcript, 
    isSupported, 
    startListening, 
    stopListening 
  } = useSpeechRecognition(language);

  const { speak, stop: stopSpeaking, isSpeaking, isLoading: isLoadingVoice } = useSpeechSynthesis(language, voiceId, voiceSpeed);

  // Use refs for speaking state so renderItem doesn't need to depend on them
  const isSpeakingRef = useRef(isSpeaking);
  const isLoadingVoiceRef = useRef(isLoadingVoice);
  const speakRef = useRef(speak);
  isSpeakingRef.current = isSpeaking;
  isLoadingVoiceRef.current = isLoadingVoice;
  speakRef.current = speak;

  const t = translations[language];

  // Build flat list of items FIRST (before scroll effect that depends on it)
  type ChatItem = { type: 'date'; date: string; timestamp: number } | { type: 'message'; message: Message } | { type: 'typing' };

  const flatItems = useMemo<ChatItem[]>(() => {
    const items: ChatItem[] = [];
    let lastDate = '';
    for (const message of messages) {
      const date = new Date(message.timestamp).toDateString();
      if (date !== lastDate) {
        items.push({ type: 'date', date, timestamp: message.timestamp });
        lastDate = date;
      }
      items.push({ type: 'message', message });
    }
    if (isTyping) {
      items.push({ type: 'typing' });
    }
    return items;
  }, [messages, isTyping]);

  // Track whether user is near the bottom to allow free scrolling upward
  const isAtBottomRef = useRef(true);

  const handleAtBottomChange = useCallback((atBottom: boolean) => {
    isAtBottomRef.current = atBottom;
  }, []);

  // Auto-scroll to bottom only when user is already near the bottom
  const lastMsgContent = messages.length > 0 ? messages[messages.length - 1].content : '';
  useEffect(() => {
    if (flatItems.length > 0 && isAtBottomRef.current) {
      requestAnimationFrame(() => {
        virtuosoRef.current?.scrollToIndex({ index: flatItems.length - 1, behavior: 'smooth', align: 'end' });
      });
    }
  }, [flatItems.length, lastMsgContent]);

  // Stop any playing audio on unmount (agent switch) — use ref to avoid re-running on stop reference change
  const stopSpeakingRef = useRef(stopSpeaking);
  stopSpeakingRef.current = stopSpeaking;
  useEffect(() => {
    return () => {
      stopSpeakingRef.current();
    };
  }, []);

  // Auto-play TTS when streaming completes
  useEffect(() => {
    if (!voiceEnabled || !pendingTtsText) return;
    console.log('[ChatView] Auto-play TTS triggered, text length:', pendingTtsText.length);
    speakRef.current(pendingTtsText);
    onTtsPlayed?.();
  }, [pendingTtsText, voiceEnabled, onTtsPlayed]);

  const handleSend = useCallback(async (content: string) => {
    const trimmed = content.trim();
    console.log('[ChatView] handleSend called:', { trimmed, isSending, isTyping });
    if (!trimmed) return;

    const now = Date.now();
    const last = lastUserSendRef.current;
    if (last && last.content === trimmed && now - last.at < 3500) {
      console.log('[ChatView] De-duped message:', trimmed);
      return;
    }
    lastUserSendRef.current = { content: trimmed, at: now };

    setIsSending(true);
    try {
      await onSendMessage(trimmed);
    } finally {
      setIsSending(false);
    }
  }, [onSendMessage, isSending, isTyping]);

  const handleSendImage = useCallback(async (imageUrl: string) => {
    setIsSending(true);
    try {
      await onSendMessage('', imageUrl);
    } finally {
      setIsSending(false);
    }
  }, [onSendMessage]);

  const formatDateLabel = useCallback((timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t.today;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return t.yesterday;
    }
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'long',
    });
  }, [t.today, t.yesterday, language]);

  const renderItem = useCallback((_index: number, item: ChatItem) => {
    if (item.type === 'date') {
      return (
        <div className="flex justify-start my-3 pl-3">
          <span className="bg-[hsl(220,10%,20%)]/90 backdrop-blur-sm text-[hsl(185,100%,65%)] text-xs px-3 py-1 rounded-full shadow-sm">
            {formatDateLabel(item.timestamp)}
          </span>
        </div>
      );
    }
    if (item.type === 'typing') {
      return <div className="py-1"><TypingIndicator /></div>;
    }
    if (item.type !== 'message') return null;
    return (
      <div className="py-0.5">
        <MessageBubble
          message={item.message}
          agentAvatarUrl={activeAgent?.avatarUrl}
          voiceEnabled={voiceEnabled}
          onSpeak={speak}
          onStopSpeaking={stopSpeaking}
          isSpeaking={isSpeakingRef.current}
          isLoadingVoice={isLoadingVoiceRef.current}
        />
      </div>
    );
  }, [voiceEnabled, speak, stopSpeaking, formatDateLabel]);

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundImage: `url(${wallpaperImages[wallpaper]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <ChatHeader
        language={language}
        onSettingsClick={onSettingsClick}
        agents={agents}
        activeAgentId={activeAgentId}
        onAddAgent={onAddAgent}
        onUpdateAgent={onUpdateAgent}
        onDeleteAgent={onDeleteAgent}
        onSelectAgent={onSelectAgent}
        onClearAgentChat={onClearAgentChat}
        awakenedAgents={awakenedAgents}
      />

      {(() => {
        const noAgentSelected = !activeAgentId;
        return (
          <>
            <div className="flex-1 overflow-hidden relative">
              {/* overlay removed for cleaner colors */}
              {noAgentSelected ? (
                <div className="h-full flex flex-col justify-start relative z-10">
                  <div className="max-w-3xl mx-auto px-3 py-4 w-full">
                    <div className="flex justify-start">
                      <div className="max-w-[85%] shadow-sm px-2.5 py-1 bg-[hsl(var(--chat-input-bg)/0.85)] text-[hsl(var(--chat-input-foreground))] rounded-t-bubble rounded-br-bubble rounded-bl-md">
                        <p className="text-[16px] leading-snug">
                          {language === 'ru' ? '☝️ Нажми на кружок с аватаром чтобы начать диалог' : '☝️ Tap an avatar circle to start a chat'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Virtuoso
                  ref={virtuosoRef}
                  data={flatItems}
                  itemContent={renderItem}
                  followOutput="smooth"
                  atBottomStateChange={handleAtBottomChange}
                  atBottomThreshold={150}
                  initialTopMostItemIndex={flatItems.length - 1}
                  alignToBottom
                  className="h-full relative z-10"
                  style={{ height: '100%' }}
                  components={virtuosoComponents}
                />
              )}
            </div>

            <ChatInput
              onSend={handleSend}
              onSendImage={handleSendImage}
              disabled={isSending || isTyping || noAgentSelected}
              language={language}
              voiceEnabled={voiceEnabled}
              isListening={isListening}
              isVoiceSupported={isSupported}
              onVoiceStart={() => {
                if (isSpeaking) {
                  stopSpeaking();
                }
                startListening();
              }}
              onVoiceStop={stopListening}
              voiceTranscript={transcript}
            />
          </>
        );
      })()}
    </div>
  );
};
