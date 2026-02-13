import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { translations } from '@/lib/translations';
import { Language } from '@/lib/translations';
import { Agent } from '@/lib/storage';
import ivanAvatar from '@/assets/ivan-avatar.jpg';
import { AgentSelectorDialog } from './AgentSelectorDialog';
import saturnLogo from '@/assets/saturn-logo.png';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  language: Language;
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
  const t = translations[language];
  const [showAgentDialog, setShowAgentDialog] = useState(false);
  const [showAgentActions, setShowAgentActions] = useState(false);
  const [actionAgentId, setActionAgentId] = useState<string | null>(null);

  const longPressTimer = useRef<number | null>(null);
  const isLongPress = useRef(false);

  const pressedAgentId = useRef<string | null>(null);

  const closeAgentActions = useCallback(() => {
    setShowAgentActions(false);
    setActionAgentId(null);
  }, []);

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

  // For desktop - simple click switches agent
  const handleAgentClick = useCallback((agentId: string) => (e: React.MouseEvent) => {
    onSelectAgent(agentId);
  }, [onSelectAgent]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const getAgentAvatar = (agent: Agent) => {
    if (agent.avatarUrl) return agent.avatarUrl;
    if (agent.isDefault) return ivanAvatar;
    return undefined;
  };

  return (
    <>
      <header className="bg-header text-header-foreground pl-3 pr-2 py-0 flex items-center gap-1 safe-area-top shadow-sm min-h-[34px] relative border-b border-white/10">

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
          <div className="flex items-center gap-2.5 w-max">
            {agents.map((agent) => {
              const avatar = getAgentAvatar(agent);
              const isActive = agent.id === activeAgentId;
              const isSleeping = awakenedAgents ? !awakenedAgents.has(agent.id) : false;
              return (
                <div
                  key={agent.id}
                  className="flex flex-col items-center cursor-pointer select-none flex-shrink-0 snap-start"
                  onClick={handleAgentClick(agent.id)}
                  onTouchStart={handleAgentTouchStart(agent.id)}
                  onTouchEnd={handleAgentTouchEnd}
                  onTouchCancel={handleAgentTouchEnd}
                  onContextMenu={handleContextMenu}
                >
                  <div className="relative">
                    <div className={`rounded-full overflow-hidden flex-shrink-0 ring-1 ring-[hsl(195,80%,45%)] active:scale-95 transition-all ${
                      isSleeping
                        ? 'w-[39px] h-[39px]'
                        : isActive 
                          ? 'w-[47px] h-[47px]' 
                          : 'w-[39px] h-[39px]'
                    }`}>
                      {avatar ? (
                        <img 
                          src={avatar} 
                          alt={agent.name}
                          className="w-full h-full object-cover scale-[1.2] object-[50%_30%] pointer-events-none"
                          draggable={false}
                          loading="eager"
                          fetchPriority="high"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/30 flex items-center justify-center">
                          <User className={isActive ? 'w-6 h-6 text-header-foreground/80' : 'w-5 h-5 text-header-foreground/80'} />
                        </div>
                      )}
                    </div>
                    {/* Dark overlay for sleeping agents */}
                    {isSleeping && (
                      <div className="absolute inset-0 bg-black/15 rounded-full" />
                    )}
                    {/* Online indicator — only for awakened agents */}
                    {isActive && !isSleeping && (
                      <div className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-[hsl(145,80%,50%)] rounded-full" />
                    )}
                  </div>
                  <span className={`mt-0.5 truncate text-[10.5px] font-normal max-w-[48px] font-mono text-card-foreground`}>
                    {agent.name.split(' ').pop()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>


        {/* + and Saturn aligned like agent columns */}
        <div className="flex flex-col items-center flex-shrink-0">
          <button
            onClick={onSettingsClick}
            className="w-[39px] h-[39px] rounded-full bg-transparent flex items-center justify-center hover:opacity-80 transition-opacity border border-white/20"
            aria-label={t.settings}
          >
            <Plus className="w-5 h-5 text-card-foreground" />
          </button>
          <span className="mt-0.5 text-[10.5px] invisible">_</span>
        </div>

        <div
          className="flex flex-col items-center select-none flex-shrink-0 snap-start cursor-pointer"
          onClick={() => navigate('/idols')}
        >
          <div className="relative">
            <div className="rounded-full overflow-hidden flex-shrink-0 w-[39px] h-[39px]">
              <img 
                src={saturnLogo} 
                alt="Saturn"
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </div>
          <span className="mt-0.5 text-[10.5px] invisible">_</span>
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

            {/* Remove agent (non-default only) */}
            {(() => {
              const agent = agents.find(a => a.id === actionAgentId);
              return agent && !agent.isDefault ? (
                <Button
                  variant="outline"
                  className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => {
                    onDeleteAgent(actionAgentId);
                    closeAgentActions();
                  }}
                >
                  {language === 'ru' ? 'Убрать агента' : 'Remove agent'}
                </Button>
              ) : null;
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
