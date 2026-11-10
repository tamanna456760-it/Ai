import React, { useState } from 'react';
import {
  Terminal,
  Compass,
  Headphones,
  BarChart2,
  Feather,
  Bot,
  Plus,
  MessageSquare,
  Trash2,
  Search,
  Sparkles,
  Shield,
  Lock,
} from 'lucide-react';
import { BotConfig, ChatSession } from '../types';

interface BotSidebarProps {
  bots: BotConfig[];
  selectedBotId: string;
  onSelectBot: (botId: string) => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenCreateModal: () => void;
  onDeleteCustomBot: (botId: string) => void;
}

export const BotSidebar: React.FC<BotSidebarProps> = ({
  bots,
  selectedBotId,
  onSelectBot,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onOpenCreateModal,
  onDeleteCustomBot,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const getBotIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="w-4 h-4" />;
      case 'Lock':
        return <Lock className="w-4 h-4" />;
      case 'Terminal':
        return <Terminal className="w-4 h-4" />;
      case 'Compass':
        return <Compass className="w-4 h-4" />;
      case 'Headphones':
        return <Headphones className="w-4 h-4" />;
      case 'BarChart2':
        return <BarChart2 className="w-4 h-4" />;
      case 'Feather':
        return <Feather className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const filteredBots = bots.filter((bot) =>
    bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentBotSessions = sessions.filter((s) => s.botId === selectedBotId);

  return (
    <aside className="w-72 shrink-0 border-r border-slate-800 bg-slate-900/50 flex flex-col h-full overflow-hidden select-none">
      {/* Bot Selector Header */}
      <div className="p-3.5 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Bots
          </span>
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Boot Bot</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search bots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Bot List */}
      <div className="p-2 space-y-1 overflow-y-auto max-h-56 border-b border-slate-800">
        {filteredBots.map((bot) => {
          const isSelected = bot.id === selectedBotId;
          return (
            <div
              key={bot.id}
              onClick={() => onSelectBot(bot.id)}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-800/90 text-white shadow-sm ring-1 ring-slate-700/60'
                  : 'hover:bg-slate-800/40 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${bot.avatarColor}`}
                >
                  {getBotIcon(bot.avatarIcon)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold truncate leading-tight">
                      {bot.name}
                    </span>
                    {bot.isCustom && (
                      <span className="text-[10px] text-indigo-400 font-mono">
                        custom
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate leading-tight">
                    {bot.tagline}
                  </p>
                </div>
              </div>

              {bot.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete custom bot "${bot.name}"?`)) {
                      onDeleteCustomBot(bot.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded transition-opacity cursor-pointer shrink-0"
                  title="Delete custom bot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Chat Sessions Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Chat Threads
          </span>
          <button
            onClick={onNewSession}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Start new thread"
          >
            <Plus className="w-3 h-3" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {currentBotSessions.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500">
              No threads yet. Send a message to start!
            </div>
          ) : (
            currentBotSessions.map((session) => {
              const isCurrent = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-md text-xs cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                      : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-slate-400" />
                    <span className="truncate">{session.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded transition-opacity cursor-pointer shrink-0"
                    title="Delete thread"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Model Spec Footer */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Engine: <span className="font-mono text-slate-300">gemini-3.8-flash</span></span>
        <span className="font-mono tabular-nums text-slate-500">{bots.length} Bots</span>
      </div>
    </aside>
  );
};
