import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { BotSidebar } from './components/BotSidebar';
import { ChatPlayground } from './components/ChatPlayground';
import { BotStudioModal } from './components/BotStudioModal';
import { PresetsModal } from './components/PresetsModal';
import { ExportModal } from './components/ExportModal';
import { DEFAULT_BOTS } from './data/defaultBots';
import { BotConfig, ChatMessage, ChatSession, ViewMode } from './types';

const STORAGE_KEY_CUSTOM_BOTS = 'boot_ai_custom_bots';
const STORAGE_KEY_SESSIONS = 'boot_ai_chat_sessions';

export default function App() {
  const [bots, setBots] = useState<BotConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_BOTS);
      if (saved) {
        const customBots: BotConfig[] = JSON.parse(saved);
        return [...DEFAULT_BOTS, ...customBots];
      }
    } catch (e) {
      console.error('Failed to load custom bots from localStorage', e);
    }
    return DEFAULT_BOTS;
  });

  const [selectedBotId, setSelectedBotId] = useState<string>(DEFAULT_BOTS[0].id);
  const [currentView, setCurrentView] = useState<ViewMode>('playground');

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load sessions from localStorage', e);
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<BotConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync custom bots to localStorage
  useEffect(() => {
    try {
      const customBots = bots.filter((b) => b.isCustom);
      localStorage.setItem(STORAGE_KEY_CUSTOM_BOTS, JSON.stringify(customBots));
    } catch (e) {
      console.error('Failed to save custom bots', e);
    }
  }, [bots]);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions', e);
    }
  }, [sessions]);

  // Ensure an active session exists for current bot
  useEffect(() => {
    const botSessions = sessions.filter((s) => s.botId === selectedBotId);
    if (botSessions.length > 0) {
      if (!botSessions.some((s) => s.id === activeSessionId)) {
        setActiveSessionId(botSessions[0].id);
      }
    } else {
      // Create an initial empty session for this bot
      const newSession: ChatSession = {
        id: `session-${Date.now()}`,
        botId: selectedBotId,
        title: 'New Conversation',
        messages: [],
        updatedAt: Date.now(),
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
    }
  }, [selectedBotId]);

  const activeBot = bots.find((b) => b.id === selectedBotId) || bots[0];
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || {
      id: 'fallback',
      botId: selectedBotId,
      title: 'New Conversation',
      messages: [],
      updatedAt: Date.now(),
    };

  const handleSelectBot = (botId: string) => {
    setSelectedBotId(botId);
    setCurrentView('playground');
    setError(null);
  };

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      botId: selectedBotId,
      title: 'New Conversation',
      messages: [],
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setError(null);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleClearChat = () => {
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [] } : s))
    );
  };

  const handleSaveBot = (savedBot: BotConfig) => {
    setBots((prev) => {
      const exists = prev.some((b) => b.id === savedBot.id);
      if (exists) {
        return prev.map((b) => (b.id === savedBot.id ? savedBot : b));
      }
      return [savedBot, ...prev];
    });
    setSelectedBotId(savedBot.id);
    setCurrentView('playground');
  };

  const handleDeleteCustomBot = (botId: string) => {
    setBots((prev) => prev.filter((b) => b.id !== botId));
    setSessions((prev) => prev.filter((s) => s.botId !== botId));
    if (selectedBotId === botId) {
      setSelectedBotId(DEFAULT_BOTS[0].id);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    setError(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const currentMessages = activeSession.messages || [];
    const updatedMessages = [...currentMessages, userMessage];

    // Determine thread title if this is the first message
    const threadTitle =
      currentMessages.length === 0
        ? userText.slice(0, 36) + (userText.length > 36 ? '...' : '')
        : activeSession.title;

    // Immediately update UI with user message and empty streaming assistant message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: threadTitle,
              messages: [...updatedMessages, initialAssistantMessage],
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentThreadId = activeSessionId;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          botConfig: {
            name: activeBot.name,
            systemPrompt: activeBot.systemPrompt,
            tone: activeBot.tone,
            knowledgeBase: activeBot.knowledgeBase,
          },
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error ${response.status}: Failed to get response`
        );
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported on this response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let streamBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const events = streamBuffer.split('\n\n');
        streamBuffer = events.pop() || '';

        for (const event of events) {
          const trimmedEvent = event.trim();
          if (trimmedEvent.startsWith('data: ')) {
            const rawJson = trimmedEvent.slice(6);
            try {
              const parsed = JSON.parse(rawJson);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                accumulatedText += parsed.text;
                // Live update assistant message
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === currentThreadId
                      ? {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === assistantMsgId
                              ? { ...m, content: accumulatedText }
                              : m
                          ),
                        }
                      : s
                  )
                );
              }
            } catch (err) {
              console.warn('Could not parse SSE event chunk:', rawJson, err);
            }
          }
        }
      }

      // Flush any trailing data chunk in streamBuffer
      if (streamBuffer.trim().startsWith('data: ')) {
        try {
          const parsed = JSON.parse(streamBuffer.trim().slice(6));
          if (parsed.text) {
            accumulatedText += parsed.text;
          }
        } catch {}
      }

      // Mark streaming as complete
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentThreadId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: accumulatedText || '...', isStreaming: false }
                    : m
                ),
              }
            : s
        )
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        console.error('Error generating response:', err);
        setError(err.message || 'Error communicating with Gemini 3.8.');
        // Remove empty assistant placeholder or indicate error
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content:
                            m.content ||
                            '⚠️ *Generation stopped due to an error. Please verify your GEMINI_API_KEY in Settings > Secrets.*',
                          isStreaming: false,
                        }
                      : m
                  ),
                }
              : s
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleOpenStudioForCurrent = () => {
    setEditingBot(activeBot);
    setIsStudioOpen(true);
  };

  const handleOpenCreateNew = () => {
    setEditingBot(null);
    setIsStudioOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* 3-Zone Top Bar */}
      <Navbar
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          if (view === 'studio') {
            handleOpenStudioForCurrent();
          } else if (view === 'embed') {
            setIsEmbedOpen(true);
          }
        }}
        onOpenCreateModal={handleOpenCreateNew}
        onOpenPresets={() => setIsPresetsOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar: Bots & Thread history */}
        <BotSidebar
          bots={bots}
          selectedBotId={selectedBotId}
          onSelectBot={handleSelectBot}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(sid) => setActiveSessionId(sid)}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onOpenCreateModal={handleOpenCreateNew}
          onDeleteCustomBot={handleDeleteCustomBot}
        />

        {/* Central Chat Viewport */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <ChatPlayground
            bot={activeBot}
            messages={activeSession.messages || []}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            onOpenStudio={handleOpenStudioForCurrent}
            onOpenEmbed={() => setIsEmbedOpen(true)}
            isLoading={isLoading}
            onStopGeneration={handleStopGeneration}
            error={error}
          />
        </main>
      </div>

      {/* Bot Studio Modal (Create / Edit) */}
      <BotStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onSaveBot={handleSaveBot}
        editingBot={editingBot}
      />

      {/* Curated Presets Modal */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        presets={DEFAULT_BOTS}
        onSelectPreset={(preset) => {
          handleSelectBot(preset.id);
        }}
      />

      {/* Export & Embed Modal */}
      <ExportModal
        isOpen={isEmbedOpen}
        onClose={() => setIsEmbedOpen(false)}
        bot={activeBot}
        onImportBot={(imported) => {
          handleSaveBot(imported);
        }}
      />
    </div>
  );
}
