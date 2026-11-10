import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Terminal,
  Compass,
  Headphones,
  BarChart2,
  Feather,
  Bot,
  Sparkles,
  Sliders,
  Share2,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  Square,
  Shield,
  Lock,
} from 'lucide-react';
import { BotConfig, ChatMessage } from '../types';
import { MarkdownView } from './MarkdownView';
import { SecuritySystemsDrawer } from './SecuritySystemsDrawer';

interface ChatPlaygroundProps {
  bot: BotConfig;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  onOpenStudio: () => void;
  onOpenEmbed: () => void;
  isLoading: boolean;
  onStopGeneration?: () => void;
  error: string | null;
}

export const ChatPlayground: React.FC<ChatPlaygroundProps> = ({
  bot,
  messages,
  onSendMessage,
  onClearChat,
  onOpenStudio,
  onOpenEmbed,
  isLoading,
  onStopGeneration,
  error,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isSecuritySuiteOpen, setIsSecuritySuiteOpen] = useState(bot.category === 'security');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsSecuritySuiteOpen(bot.category === 'security');
  }, [bot.id, bot.category]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleInjectPrompt = (promptText: string) => {
    if (promptText.includes('[PASTE') || promptText.includes('[TARGET')) {
      setInputText(promptText);
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
      }
    } else {
      onSendMessage(promptText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const copyMessageText = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const getBotIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      case 'Lock':
        return <Lock className="w-5 h-5" />;
      case 'Terminal':
        return <Terminal className="w-5 h-5" />;
      case 'Compass':
        return <Compass className="w-5 h-5" />;
      case 'Headphones':
        return <Headphones className="w-5 h-5" />;
      case 'BarChart2':
        return <BarChart2 className="w-5 h-5" />;
      case 'Feather':
        return <Feather className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
      {/* Bot Header Ribbon */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/60 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bot.avatarColor}`}
          >
            {getBotIcon(bot.avatarIcon)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white truncate">{bot.name}</h2>
              <span className="text-[11px] text-slate-400 capitalize hidden sm:inline">
                · {bot.category}
              </span>
              <span className="text-[11px] text-slate-400 hidden md:inline">
                · Tone: {bot.tone}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">{bot.tagline}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenStudio}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            title="Configure persona, tone, and knowledge context"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Configure</span>
          </button>
          <button
            onClick={onOpenEmbed}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            title="Export widget code"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Embed</span>
          </button>
          <button
            onClick={onClearChat}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-md transition-colors cursor-pointer"
            title="Clear chat thread"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Error notification banner */}
      {error && (
        <div className="bg-rose-500/10 border-b border-rose-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Ethical Hacking Systems Suite Bar for Security Bots */}
      {bot.category === 'security' && (
        <SecuritySystemsDrawer
          isOpen={isSecuritySuiteOpen}
          onToggle={() => setIsSecuritySuiteOpen((prev) => !prev)}
          onInjectPrompt={handleInjectPrompt}
        />
      )}

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto py-10 px-4 text-center space-y-6">
            <div
              className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center shadow-lg ${bot.avatarColor}`}
            >
              {getBotIcon(bot.avatarIcon)}
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white">{bot.name} is booted & armed</h1>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                {bot.tagline}. Armed with complete ethical hacking systems for vulnerability auditing, penetration testing, threat modeling, and defensive remediation.
              </p>
            </div>

            {/* If Security Bot: 9 Core Systems Summary Matrix */}
            {bot.category === 'security' && (
              <div className="p-3.5 bg-slate-900/70 border border-cyan-500/20 rounded-xl text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>9 Integrated Ethical Hacking Systems</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    NIST SP 800-115 & OWASP Aligned
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] text-slate-300">
                  <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800">
                    🛡️ OWASP Web & API Top 10
                  </div>
                  <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800">
                    💻 SAST & Source Review
                  </div>
                  <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800">
                    🔐 Cryptography & Secrets
                  </div>
                  <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800">
                    ☁️ Cloud & Container K8s
                  </div>
                  <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800">
                    🔍 OSINT & Reconnaissance
                  </div>
                  <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800">
                    🌐 Network & Firewall Rules
                  </div>
                  <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800">
                    🔒 Strict CSP & CORS Headers
                  </div>
                  <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800">
                    🚨 Incident Response & DFIR
                  </div>
                  <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800">
                    📋 Pentest Report Generator
                  </div>
                </div>
              </div>
            )}

            {/* Quick Starter Prompts */}
            {bot.starterPrompts && bot.starterPrompts.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Quick System Prompts
                </span>
                <div className="grid gap-2 max-w-lg mx-auto text-left">
                  {bot.starterPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleInjectPrompt(prompt)}
                      className="p-3 text-xs text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 rounded-lg transition-all text-left flex items-start gap-2.5 cursor-pointer shadow-sm group"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="leading-relaxed">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => {
              const isUser = message.role === 'user';
              const isCopied = copiedMsgId === message.id;

              return (
                <div
                  key={message.id}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${bot.avatarColor}`}
                    >
                      {getBotIcon(bot.avatarIcon)}
                    </div>
                  )}

                  <div className={`space-y-1.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-xl px-4 py-3 text-sm shadow-sm ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      ) : (
                        <div className="relative">
                          <MarkdownView content={message.content} />
                          {message.isStreaming && (
                            <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse align-middle" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Message metadata & actions */}
                    {!isUser && (
                      <div className="flex items-center gap-3 px-1 text-[11px] text-slate-400">
                        <span>
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>·</span>
                        <button
                          onClick={() => copyMessageText(message.content, message.id)}
                          className="hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Composer Ribbon */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-slate-900 border border-slate-800 focus-within:border-indigo-500/70 rounded-xl transition-all shadow-inner">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleInputResize}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${bot.name}... (Press Enter to send, Shift+Enter for new line)`}
              className="w-full bg-transparent px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none max-h-44 leading-relaxed pr-24"
            />
            <div className="absolute right-2.5 bottom-2 flex items-center gap-1.5">
              {isLoading && onStopGeneration ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  className="p-2 bg-rose-600/80 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
                  title="Stop generation"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!inputText.trim()}
                  className={`p-2 rounded-lg transition-all cursor-pointer shadow-sm ${
                    inputText.trim()
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500">
            <span>
              Persona: <span className="text-slate-400">{bot.name}</span>
            </span>
            <span>Gemini 3.8 Flash · Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
};
