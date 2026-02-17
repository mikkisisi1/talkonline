import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Plus, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { translations, languageNames, languageFlags } from '@/lib/translations';
import { Language } from '@/lib/translations';
import { Agent } from '@/lib/storage';
import ivanAvatar from '@/assets/ivan-avatar.jpg';
import { AgentSelectorDialog } from './AgentSelectorDialog';
import saturnLogo from '@/assets/saturn-logo.png';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSettingsClick: () => void;
  onBackClick?: () => void;
  showBack?: boolean;
  agents: Agent[];
  activeAgentId: string;
  onAddAgent: (agent: Omit<Agent, 'id'>) => Agent;
  onUpdateAgent: (agentId: string, updates: Partial<Agent>) => void;
  onDeleteAgent: (agentId: string) => void;
  onSelectAgent: (agentId: string) => void;
  onClearAgentChat?: (agentId: string) => void;
  awakenedAgents?: Set<string>;
}

export const ChatHeader = ({ 
  language, 
  onLanguageChange,
  onSettingsClick, 
  onBackClick, 
  showBack,
  agents,
  activeAgentId,
  onAddAgent,
  onUpdateAgent,
  onDeleteAgent,
  onSelectAgent,
  onClearAgentChat,
  awakenedAgents,
}: ChatHeaderProps) => {
  const navigate = useNavigate();
  const t = translations[language] || translations['en'];
  const [showAgentDialog, setShowAgentDialog] = useState(false);
  const [showAgentActions, setShowAgentActions] = useState(false);
  const [actionAgentId, setActionAgentId] = useState<string | null>(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const longPressTimer = useRef<number | null>(null);
  const isLongPress = useRef(false);

  const pressedAgentId = useRef<string | null>(null);

  const closeAgentActions = useCallback(() => {
    setShowAgentActions(false);
    setActionAgentId(null);
  }, []);

  const allLanguages: Language[] = ['ru', 'en', 'uk', 'kk', 'uz', 'be', 'fr', 'de', 'id', 'pt', 'es'];

  const handleAgentTouchStart = useCallback((agentId: string) => (e: React.TouchEvent) => {
    pressedAgentId.current = agentId;
    isLongPress.current = false;
    longPressTimer.current = window.setTimeout(() => {
      isLongPress.current = true;
      setActionAgentId(agentId);
      setShowAgentActions(true);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  }, []);

  const handleAgentTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // Short tap - switch agent
    if (!isLongPress.current && pressedAgentId.current) {
      onSelectAgent(pressedAgentId.current);
    }
    pressedAgentId.current = null;
  }, [activeAgentId, onSelectAgent]);

  // For desktop - simple click switches agent, long press opens menu
  const handleAgentMouseDown = useCallback((agentId: string) => (e: React.MouseEvent) => {
    pressedAgentId.current = agentId;
    isLongPress.current = false;
    longPressTimer.current = window.setTimeout(() => {
      isLongPress.current = true;
      setActionAgentId(agentId);
      setShowAgentActions(true);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  }, []);

  const handleAgentMouseUp = useCallback((e: React.MouseEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // Short click - switch agent
    if (!isLongPress.current && pressedAgentId.current) {
      onSelectAgent(pressedAgentId.current);
    }
    pressedAgentId.current = null;
  }, [onSelectAgent]);

  const handleAgentMouseLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    pressedAgentId.current = null;
  }, []);

  const handleContextMenu = useCallback((agentId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActionAgentId(agentId);
    setShowAgentActions(true);
  }, []);

  const getAgentAvatar = (agent: Agent) => {
    if (agent.avatarUrl) return agent.avatarUrl;
    if (agent.isDefault) return ivanAvatar;
    return undefined;
  };

  return (
    <>
      <header className="bg-[hsl(185,100%,35%)] text-[hsl(200,10%,20%)] pl-3 pr-4 pt-2 pb-1 flex items-end gap-1 shadow-lg relative border-b border-[hsl(200,10%,25%)]">

        {showBack && onBackClick ? (
          <button
            onClick={onBackClick}
            className="p-1 -ml-1 hover:bg-header-foreground/10 rounded-full transition-colors self-center"
            aria-label={t.back}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : null}


        {/* All agents — horizontally scrollable */}
        <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
          <div className="flex items-end gap-2.5 w-max">
            {agents.map((agent) => {
              const avatar = getAgentAvatar(agent);
              const isActive = agent.id === activeAgentId;
              const isSleeping = awakenedAgents ? !awakenedAgents.has(agent.id) : false;
              return (
                <div
                  key={agent.id}
                  className="flex flex-col items-center cursor-pointer select-none flex-shrink-0 snap-start"
                  onMouseDown={handleAgentMouseDown(agent.id)}
                  onMouseUp={handleAgentMouseUp}
                  onMouseLeave={handleAgentMouseLeave}
                  onTouchStart={handleAgentTouchStart(agent.id)}
                  onTouchEnd={handleAgentTouchEnd}
                  onTouchCancel={handleAgentTouchEnd}
                  onContextMenu={handleContextMenu(agent.id)}
                >
                  <div className="relative">
                    {/* Thin graphite ring for all agents */}
                    <div className={`rounded-full overflow-hidden flex-shrink-0 active:scale-95 transition-all ring-[1px] ring-[hsl(200,10%,25%)] ${
                      isActive
                        ? 'w-[50px] h-[50px]'
                        : 'w-[45px] h-[45px]'
                    }`}>
                      {avatar ? (
                        <img 
                          src={avatar} 
                          alt={agent.name}
                          className="w-full h-full object-cover object-[50%_20%] pointer-events-none"
                          draggable={false}
                          loading="eager"
                          fetchPriority="high"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/30 flex items-center justify-center">
                          <User className={isActive ? 'w-6 h-6 text-[hsl(200,10%,25%)]' : 'w-5 h-5 text-[hsl(200,10%,25%)]'} />
                        </div>
                      )}
                    </div>
                    {/* Gray transparent overlay for sleeping agents */}
                    {isSleeping && (
                      <div className="absolute inset-0 bg-gray-700/25 rounded-full pointer-events-none" />
                    )}
                    {/* Green neon online indicator on the ring line */}
                    {isActive && !isSleeping && (
                      <div 
                        className="absolute bottom-[2px] right-[2px] w-[5px] h-[5px] rounded-full"
                        style={{
                          backgroundColor: '#00FF66',
                          boxShadow: '0 0 4px #00FF66, 0 0 8px #00FF66',
                          border: '0.5px solid hsl(200,10%,25%)'
                        }}
                      />
                    )}
                  </div>
                  <span className={`mt-0.5 truncate text-[10px] font-normal max-w-[52px] font-mono text-[hsl(200,10%,20%)]`}>
                    {agent.name.split(' ').pop()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>


        {/* Language selector - minimalist icon */}
        <div className="flex flex-col items-center flex-shrink-0 -ml-16 mr-1 relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="w-[36px] h-[36px] rounded-full flex items-center justify-center hover:opacity-70 transition-all"
            aria-label="Language"
          >
            <Globe className="w-5 h-5 text-[#2d3436]" strokeWidth={1.5} />
          </button>
          <span className="mt-0.5 text-[9px] text-[#2d3436] font-medium uppercase">{language}</span>
          
          {/* Language dropdown */}
          {showLanguageMenu && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-black/20" 
                onClick={() => setShowLanguageMenu(false)}
              />
              <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 py-2 min-w-[160px] max-h-[350px] overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                  Язык / Language
                </div>
                {allLanguages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      onLanguageChange(lang);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left hover:bg-cyan-50 flex items-center gap-3 text-sm transition-colors ${
                      language === lang ? 'bg-cyan-100 text-cyan-800 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{languageFlags[lang]}</span>
                    <span>{languageNames[lang]}</span>
                    {language === lang && <span className="ml-auto text-cyan-600">✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col items-center flex-shrink-0 mr-2">
          <button
            onClick={onSettingsClick}
            className="w-[42px] h-[42px] rounded-full bg-transparent flex items-center justify-center hover:opacity-80 transition-opacity"
            aria-label={t?.settings || 'Settings'}
          >
            <Plus className="w-6 h-6 text-[#2d3436]" strokeWidth={1.5} />
          </button>
          <span className="mt-0.5 text-[10px] invisible">_</span>
        </div>

        <div
          className="flex flex-col items-center select-none flex-shrink-0 snap-start cursor-pointer -ml-1"
          onClick={() => navigate('/idols')}
        >
          <div className="w-[42px] h-[42px] flex items-center justify-center overflow-visible text-[#2d3436]">
            <svg width="42" height="42" viewBox="0 0 47 47" overflow="visible" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="23.5" cy="23.5" r="21" stroke="currentColor" strokeWidth="1.8" fill="none" />
              <ellipse cx="23.5" cy="23.5" rx="28" ry="8" stroke="currentColor" strokeWidth="1.5" fill="none" transform="rotate(-20 23.5 23.5)" />
              <circle cx="43" cy="24" r="2" fill="#00FF66" />
            </svg>
          </div>
          <span className="mt-0.5 text-[10px] invisible">_</span>
        </div>
      </header>

      {/* Long-press actions */}
      {showAgentActions && actionAgentId && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            onClick={closeAgentActions}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            aria-label={t.cancel}
          />

          <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl shadow-lg p-4 space-y-3">
            <div className="text-sm font-medium text-foreground">
              {language === 'ru' ? 'Действия' : 'Actions'}
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                onClearAgentChat?.(actionAgentId);
                closeAgentActions();
              }}
              disabled={!onClearAgentChat}
            >
              {t.clearChat}
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                closeAgentActions();
                setShowAgentDialog(true);
              }}
            >
              {language === 'ru' ? 'Настроить агента' : 'Customize agent'}
            </Button>

            {/* Remove agent - works for all agents */}
            {(() => {
              const agent = agents.find(a => a.id === actionAgentId);
              if (!agent) return null;
              const isDefaultAgent = agent.isDefault || agent.name === 'Лукас' || agent.name === 'София';
              return (
                <Button
                  variant="outline"
                  className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => {
                    onDeleteAgent(actionAgentId);
                    closeAgentActions();
                  }}
                >
                  {language === 'ru' 
                    ? (isDefaultAgent ? 'Убрать в раздел кумиры' : 'Убрать агента')
                    : (isDefaultAgent ? 'Move to Idols' : 'Remove agent')
                  }
                </Button>
              );
            })()}

            <Button variant="outline" className="w-full" onClick={closeAgentActions}>
              {t.cancel}
            </Button>
          </div>
        </div>
      )}

      <AgentSelectorDialog
        isOpen={showAgentDialog}
        onClose={() => setShowAgentDialog(false)}
        language={language}
        agents={agents}
        activeAgentId={activeAgentId}
        onAddAgent={onAddAgent}
        onUpdateAgent={onUpdateAgent}
        onDeleteAgent={onDeleteAgent}
        onSelectAgent={onSelectAgent}
        onClearAgentChat={onClearAgentChat}
      />
    </>
  );
};
