import React, { useState } from 'react';
import {
  X,
  Terminal,
  Compass,
  Headphones,
  BarChart2,
  Feather,
  Bot,
  Sparkles,
  ArrowRight,
  Shield,
  Lock,
} from 'lucide-react';
import { BotConfig } from '../types';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: BotConfig[];
  onSelectPreset: (bot: BotConfig) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  presets,
  onSelectPreset,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = ['all', 'security', 'engineering', 'business', 'support', 'data', 'writing'];

  const filteredPresets = presets.filter((bot) =>
    activeCategory === 'all' ? true : bot.category === activeCategory
  );

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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-bold text-white">Curated Bot Presets</h2>
            <p className="text-xs text-slate-400">
              Battle-tested prompt architectures tuned for specific tasks
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-3 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Presets' : cat}
            </button>
          ))}
        </div>

        {/* Preset Cards Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          {filteredPresets.map((bot) => (
            <div
              key={bot.id}
              onClick={() => {
                onSelectPreset(bot);
                onClose();
              }}
              className="group p-4 bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all flex flex-col justify-between cursor-pointer space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bot.avatarColor}`}
                  >
                    {getBotIcon(bot.avatarIcon)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {bot.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 capitalize">
                      {bot.category} · {bot.tone}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {bot.tagline}
                </p>

                {bot.starterPrompts && bot.starterPrompts.length > 0 && (
                  <div className="text-[11px] text-slate-500 italic truncate">
                    Ex: "{bot.starterPrompts[0]}"
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-medium">
                <span>Launch in Playground</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
