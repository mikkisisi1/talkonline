import { useState, useRef } from 'react';
import { X, Plus, Camera, User, Trash2, Check } from 'lucide-react';
import { Language, translations } from '@/lib/translations';
import { Agent, VoiceId, AgentGender } from '@/lib/storage';
import ivanAvatar from '@/assets/ivan-avatar.jpg';
import { cn } from '@/lib/utils';

interface AgentSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  agents: Agent[];
  activeAgentId: string;
  onAddAgent: (agent: Omit<Agent, 'id'>) => Agent;
  onUpdateAgent: (agentId: string, updates: Partial<Agent>) => void;
  onDeleteAgent: (agentId: string) => void;
  onSelectAgent: (agentId: string) => void;
  onClearAgentChat?: (agentId: string) => void;
}

type DialogMode = 'list' | 'add' | 'edit';

type VoiceCategory = 'male' | 'female' | 'child';

const voiceOptions: { id: VoiceId; name: string; category: VoiceCategory }[] = [
  { id: 'fish_roger', name: 'Roger', category: 'male' },
  { id: 'fish_charlie', name: 'Charlie', category: 'male' },
  { id: 'fish_brad_pitt', name: 'Брэд Питт', category: 'male' },
  { id: 'fish_nasal_90s', name: 'Гнусавый 90-х', category: 'male' },
  { id: 'fish_egirl', name: 'Жириновский', category: 'male' },
  { id: 'fish_tinkov', name: 'Тиньков', category: 'male' },
  { id: 'fish_aria', name: 'Aria', category: 'female' },
  { id: 'fish_sarah', name: 'Sarah', category: 'female' },
  { id: 'fish_alina', name: 'Алина', category: 'female' },
  { id: 'fish_flora', name: 'Фея Флора', category: 'female' },
  { id: 'fish_sobchak', name: 'Собчак', category: 'female' },
  { id: 'fish_egirl_real', name: 'E-girl', category: 'female' },
  { id: 'fish_child', name: 'Детский', category: 'child' },
];

export const AgentSelectorDialog = ({
  isOpen,
  onClose,
  language,
  agents,
  activeAgentId,
  onAddAgent,
  onUpdateAgent,
  onDeleteAgent,
  onSelectAgent,
  onClearAgentChat,
}: AgentSelectorDialogProps) => {
  const [mode, setMode] = useState<DialogMode>('list');
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [voiceId, setVoiceId] = useState<VoiceId>('fish_aria');
  const [gender, setGender] = useState<AgentGender>('female');
  const [personality, setPersonality] = useState('');
  const [confirmClearAgentId, setConfirmClearAgentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    ru: {
      title: 'Агенты',
      addAgent: 'Добавить агента',
      editAgent: 'Редактировать',
      name: 'Имя',
      namePlaceholder: 'Введите имя...',
      voice: 'Голос',
      maleVoices: 'Мужские',
      femaleVoices: 'Женские',
      childVoices: 'Детские',
      changePhoto: 'Фото',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      back: 'Назад',
      clearChat: 'Очистить чат',
      clearChatConfirm: 'Удалить все сообщения с этим агентом?',
      yes: 'Да',
      no: 'Нет',
    },
    en: {
      title: 'Agents',
      addAgent: 'Add Agent',
      editAgent: 'Edit',
      name: 'Name',
      namePlaceholder: 'Enter name...',
      voice: 'Voice',
      maleVoices: 'Male',
      femaleVoices: 'Female',
      childVoices: 'Child',
      changePhoto: 'Photo',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      back: 'Back',
      clearChat: 'Clear chat',
      clearChatConfirm: 'Delete all messages with this agent?',
      yes: 'Yes',
      no: 'No',
    },
  };

  const texts = t[language];

  const resetForm = () => {
    setName('');
    setAvatarUrl(undefined);
    setVoiceId('fish_aria');
    setGender('female');
    setPersonality('');
    setEditingAgent(null);
  };

  const handleClose = () => {
    setMode('list');
    resetForm();
    setConfirmClearAgentId(null);
    onClose();
  };

  const handleClearChat = (agentId: string) => {
    if (onClearAgentChat) {
      onClearAgentChat(agentId);
      setConfirmClearAgentId(null);
    }
  };

  const handleAddClick = () => {
    resetForm();
    setMode('add');
  };

  const handleEditClick = (agent: Agent) => {
    setEditingAgent(agent);
    setName(agent.name);
    setAvatarUrl(agent.avatarUrl);
    setVoiceId(agent.voiceId);
    setGender(agent.gender);
    setPersonality(agent.personality || '');
    setMode('edit');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (mode === 'add') {
      const newAgent = onAddAgent({
        name: name.trim(),
        avatarUrl,
        voiceId,
        gender,
        personality: personality.trim() || undefined,
      });
      onSelectAgent(newAgent.id);
    } else if (mode === 'edit' && editingAgent) {
      onUpdateAgent(editingAgent.id, {
        name: name.trim(),
        avatarUrl,
        voiceId,
        gender,
        personality: personality.trim() || undefined,
      });
    }

    setMode('list');
    resetForm();
  };

  const handleDelete = () => {
    if (editingAgent && !editingAgent.isDefault) {
      onDeleteAgent(editingAgent.id);
      setMode('list');
      resetForm();
    }
  };

  const handleSelectAgent = (agentId: string) => {
    onSelectAgent(agentId);
    handleClose();
  };

  const getAvatarUrl = (agent: Agent) => {
    if (agent.avatarUrl) return agent.avatarUrl;
    if (agent.isDefault) return ivanAvatar;
    return undefined;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 fade-in duration-200 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          {mode !== 'list' ? (
            <button
              onClick={() => { setMode('list'); resetForm(); }}
              className="text-sm text-primary hover:underline"
            >
              {texts.back}
            </button>
          ) : (
            <h2 className="font-semibold text-lg">{texts.title}</h2>
          )}
          <button
            onClick={handleClose}
            className="p-1 hover:bg-accent rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {mode === 'list' ? (
            <div className="p-4 space-y-2">
              {/* Agent List */}
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer',
                    agent.id === activeAgentId
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-muted/50 hover:bg-muted'
                  )}
                  onClick={() => handleSelectAgent(agent.id)}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    {getAvatarUrl(agent) ? (
                      <img
                        src={getAvatarUrl(agent)}
                        alt={agent.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/20">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {voiceOptions.find(v => v.id === agent.voiceId)?.name}
                    </p>
                  </div>

                  {/* Actions */}
                  {agent.id === activeAgentId && (
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                  {onClearAgentChat && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmClearAgentId(agent.id);
                      }}
                      className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                      title={texts.clearChat}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(agent);
                    }}
                    className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="text-xs">{texts.editAgent}</span>
                  </button>
                </div>
              ))}

              {/* Confirm Clear Chat Dialog */}
              {confirmClearAgentId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmClearAgentId(null)} />
                  <div className="relative bg-card rounded-xl p-5 shadow-xl max-w-xs w-full animate-in zoom-in-95">
                    <p className="text-center font-medium mb-4">{texts.clearChatConfirm}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setConfirmClearAgentId(null)}
                        className="flex-1 py-2 px-4 bg-muted hover:bg-accent rounded-lg font-medium transition-colors"
                      >
                        {texts.no}
                      </button>
                      <button
                        onClick={() => handleClearChat(confirmClearAgentId)}
                        className="flex-1 py-2 px-4 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg font-medium transition-colors"
                      >
                        {texts.yes}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Button */}
              <button
                onClick={handleAddClick}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">{texts.addAgent}</span>
              </button>
            </div>
          ) : (
            /* Add/Edit Form */
            <div className="p-4 space-y-5">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-primary/20 bg-muted">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{texts.name}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={texts.namePlaceholder}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={20}
                />
              </div>

              {/* Gender selector (for grammatical purposes) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {language === 'ru' ? 'Пол (для грамматики)' : 'Gender (for grammar)'}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGender('female')}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      gender === 'female'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-accent'
                    )}
                  >
                    {language === 'ru' ? 'Женский' : 'Female'}
                  </button>
                  <button
                    onClick={() => setGender('male')}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      gender === 'male'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-accent'
                    )}
                  >
                    {language === 'ru' ? 'Мужской' : 'Male'}
                  </button>
                </div>
              </div>

              {/* Voice */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{texts.voice}</label>
                
                <p className="text-xs text-muted-foreground">{texts.femaleVoices}</p>
                <div className="flex flex-wrap gap-2">
                  {voiceOptions.filter(v => v.category === 'female').map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setVoiceId(voice.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        voiceId === voice.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-accent'
                      )}
                    >
                      {voice.name}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-2">{texts.maleVoices}</p>
                <div className="flex flex-wrap gap-2">
                  {voiceOptions.filter(v => v.category === 'male').map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setVoiceId(voice.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        voiceId === voice.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-accent'
                      )}
                    >
                      {voice.name}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-2">{texts.childVoices}</p>
                <div className="flex flex-wrap gap-2">
                  {voiceOptions.filter(v => v.category === 'child').map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setVoiceId(voice.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        voiceId === voice.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-accent'
                      )}
                    >
                      {voice.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personality / Behavior notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {language === 'ru' ? 'Характер и стиль' : 'Personality & Style'}
                </label>
                <textarea
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder={language === 'ru' 
                    ? 'Примеры что можно написать:\n• "Саркастичный, любит подкалывать"\n• "Заботливый, всегда спрашивает как дела"\n• "Фанат аниме, часто вставляет отсылки"\n• "Говорит как будто пишет в твиттер"' 
                    : 'Examples of what you can write:\n• "Sarcastic, loves to tease"\n• "Caring, always asks how you\'re doing"\n• "Anime fan, makes references often"\n• "Talks like writing a tweet"'}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm placeholder:text-muted-foreground/50"
                  rows={5}
                  maxLength={300}
                />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    {language === 'ru' ? '💡 Это реально влияет на:' : '💡 This actually affects:'}
                  </p>
                  <ul className="text-xs text-muted-foreground/70 space-y-0.5 pl-4">
                    <li>{language === 'ru' ? '• Стиль речи и сленг' : '• Speech style and slang'}</li>
                    <li>{language === 'ru' ? '• Темы которые поднимает' : '• Topics they bring up'}</li>
                    <li>{language === 'ru' ? '• Как реагирует на твои сообщения' : '• How they react to your messages'}</li>
                    <li>{language === 'ru' ? '• Юмор и шутки' : '• Humor and jokes'}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer for Add/Edit */}
        {mode !== 'list' && (
          <div className="p-4 border-t border-border flex-shrink-0">
            <div className="flex gap-3">
              {mode === 'edit' && editingAgent && !editingAgent.isDefault && (
                <button
                  onClick={handleDelete}
                  className="p-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => { setMode('list'); resetForm(); }}
                className="flex-1 py-3 px-4 bg-muted hover:bg-accent rounded-xl font-medium transition-colors"
              >
                {texts.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="flex-1 py-3 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {texts.save}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};