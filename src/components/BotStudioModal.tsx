import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Bot,
  Terminal,
  Compass,
  Headphones,
  BarChart2,
  Feather,
  Plus,
  Trash2,
  BookOpen,
  Check,
  Shield,
  Lock,
} from 'lucide-react';
import { BotConfig } from '../types';

interface BotStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBot: (bot: BotConfig) => void;
  editingBot?: BotConfig | null;
}

const AVAILABLE_ICONS = [
  { name: 'Shield', icon: Shield },
  { name: 'Lock', icon: Lock },
  { name: 'Bot', icon: Bot },
  { name: 'Terminal', icon: Terminal },
  { name: 'Compass', icon: Compass },
  { name: 'Headphones', icon: Headphones },
  { name: 'BarChart2', icon: BarChart2 },
  { name: 'Feather', icon: Feather },
  { name: 'Sparkles', icon: Sparkles },
];

const AVAILABLE_COLORS = [
  { name: 'Cyan', class: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' },
  { name: 'Indigo', class: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' },
  { name: 'Emerald', class: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  { name: 'Sky', class: 'bg-sky-500/20 text-sky-400 border border-sky-500/30' },
  { name: 'Amber', class: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  { name: 'Rose', class: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' },
  { name: 'Purple', class: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
];

const TONE_PRESETS = [
  'Sharp, direct, and concise',
  'Warm, empathetic, and patient',
  'Deeply technical and architectural',
  'Analytical and data-driven',
  'Playful, energetic, and creative',
  'Formal and executive-level',
];

export const BotStudioModal: React.FC<BotStudioModalProps> = ({
  isOpen,
  onClose,
  onSaveBot,
  editingBot,
}) => {
  const [aiIdea, setAiIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<BotConfig['category']>('engineering');
  const [avatarIcon, setAvatarIcon] = useState('Bot');
  const [avatarColor, setAvatarColor] = useState(AVAILABLE_COLORS[0].class);
  const [tone, setTone] = useState(TONE_PRESETS[0]);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [starterPrompts, setStarterPrompts] = useState<string[]>(['', '', '']);

  useEffect(() => {
    if (editingBot) {
      setName(editingBot.name);
      setTagline(editingBot.tagline);
      setCategory(editingBot.category);
      setAvatarIcon(editingBot.avatarIcon || 'Bot');
      setAvatarColor(editingBot.avatarColor || AVAILABLE_COLORS[0].class);
      setTone(editingBot.tone);
      setSystemPrompt(editingBot.systemPrompt);
      setKnowledgeBase(editingBot.knowledgeBase || '');
      setStarterPrompts(
        editingBot.starterPrompts.length > 0
          ? editingBot.starterPrompts
          : ['', '', '']
      );
    } else {
      // Default empty form
      setName('');
      setTagline('');
      setCategory('engineering');
      setAvatarIcon('Bot');
      setAvatarColor(AVAILABLE_COLORS[0].class);
      setTone(TONE_PRESETS[0]);
      setSystemPrompt('');
      setKnowledgeBase('');
      setStarterPrompts([
        'Explain the core concept behind this system',
        'How should I approach troubleshooting this issue?',
        'Give me a step-by-step implementation guide',
      ]);
    }
    setAiIdea('');
    setGenerateError(null);
  }, [editingBot, isOpen]);

  if (!isOpen) return null;

  // Call the server-side auto-prompt blueprint generator
  const handleAIGenerate = async () => {
    if (!aiIdea.trim()) return;
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: aiIdea, category }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate bot blueprint.');
      }

      const blueprint = await res.json();
      if (blueprint.name) setName(blueprint.name);
      if (blueprint.tagline) setTagline(blueprint.tagline);
      if (blueprint.systemPrompt) setSystemPrompt(blueprint.systemPrompt);
      if (blueprint.tone) setTone(blueprint.tone);
      if (Array.isArray(blueprint.starterPrompts)) {
        setStarterPrompts(blueprint.starterPrompts);
      }
    } catch (err: any) {
      console.error(err);
      setGenerateError(err.message || 'Blueprint synthesis error.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptChange = (index: number, val: string) => {
    const updated = [...starterPrompts];
    updated[index] = val;
    setStarterPrompts(updated);
  };

  const handleAddPrompt = () => {
    if (starterPrompts.length < 5) {
      setStarterPrompts([...starterPrompts, '']);
    }
  };

  const handleRemovePrompt = (index: number) => {
    setStarterPrompts(starterPrompts.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanedPrompts = starterPrompts.filter((p) => p.trim().length > 0);

    const savedConfig: BotConfig = {
      id: editingBot ? editingBot.id : `custom-${Date.now()}`,
      name: name.trim(),
      tagline: tagline.trim() || 'Custom AI Bot',
      avatarIcon,
      avatarColor,
      category,
      tone,
      systemPrompt: systemPrompt.trim() || 'You are an intelligent AI assistant.',
      knowledgeBase: knowledgeBase.trim(),
      starterPrompts: cleanedPrompts,
      isCustom: true,
      createdAt: editingBot ? editingBot.createdAt : Date.now(),
    };

    onSaveBot(savedConfig);
    onClose();
  };

  const estimatedTokens = Math.round(
    ((systemPrompt?.length || 0) + (knowledgeBase?.length || 0)) / 4
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {editingBot ? `Configure ${editingBot.name}` : 'Boot a New AI Bot'}
              </h2>
              <p className="text-xs text-slate-400">
                Define personality, tone, system instructions, and reference knowledge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Quick Boot Generator Box */}
        <div className="p-5 bg-gradient-to-r from-indigo-950/40 to-slate-900 border-b border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Quick Boot: Synthesize from an Idea</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiIdea}
              onChange={(e) => setAiIdea(e.target.value)}
              placeholder="e.g. A senior SRE bot that troubleshoots Docker & Kubernetes crash loops"
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAIGenerate();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={isGenerating || !aiIdea.trim()}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
            </button>
          </div>
          {generateError && (
            <p className="text-[11px] text-rose-400">{generateError}</p>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Identity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Bot Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CloudArchitect"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BotConfig['category'])}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none capitalize"
              >
                <option value="security">Security & Ethical Hacking</option>
                <option value="engineering">Engineering</option>
                <option value="business">Business & Strategy</option>
                <option value="support">Customer Support</option>
                <option value="data">Data & Analytics</option>
                <option value="writing">Writing & Copy</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Tagline / Role Subtitle
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Infrastructure Engineer & Distributed Systems Advisor"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
            />
          </div>

          {/* Avatar & Palette Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Avatar Icon
              </label>
              <div className="flex gap-2 flex-wrap">
                {AVAILABLE_ICONS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = avatarIcon === item.name;
                  return (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => setAvatarIcon(item.name)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Badge Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {AVAILABLE_COLORS.map((col) => {
                  const isSelected = avatarColor === col.class;
                  return (
                    <button
                      type="button"
                      key={col.name}
                      onClick={() => setAvatarColor(col.class)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${col.class} ${
                        isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Demeanor & Tone */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Demeanor & Tone
            </label>
            <input
              type="text"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="e.g. Concise, technical, and direct"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {TONE_PRESETS.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTone(t)}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    tone === t
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                System Instructions (Persona & Rules)
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                ~{estimatedTokens} tokens
              </span>
            </div>
            <textarea
              rows={5}
              required
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Define who the bot is, what guidelines it must strictly follow, and the formatting rules it should observe..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none font-mono leading-relaxed resize-y"
            />
          </div>

          {/* Knowledge Base Grounding */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <label className="text-xs font-medium text-slate-300">
                Reference Knowledge Base (Grounding Context)
              </label>
            </div>
            <textarea
              rows={3}
              value={knowledgeBase}
              onChange={(e) => setKnowledgeBase(e.target.value)}
              placeholder="Paste company documentation, product specs, pricing policies, or FAQs here. The bot will reference this context when answering queries."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none font-mono leading-relaxed resize-y"
            />
          </div>

          {/* Starter Prompts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">
                Starter Prompts (Clickable Suggested Questions)
              </label>
              {starterPrompts.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddPrompt}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Prompt</span>
                </button>
              )}
            </div>
            {starterPrompts.map((prompt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => handlePromptChange(idx, e.target.value)}
                  placeholder={`Starter question ${idx + 1}`}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
                />
                {starterPrompts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePrompt(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30 cursor-pointer"
            >
              {editingBot ? 'Save Changes' : 'Boot Bot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
