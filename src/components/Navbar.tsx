import React from 'react';
import { Bot, Plus } from 'lucide-react';
import { ViewMode } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenCreateModal: () => void;
  onOpenPresets: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  onOpenCreateModal,
  onOpenPresets,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur px-6 flex items-center justify-between gap-8 shrink-0 z-20">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
          <Bot className="w-4 h-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-white">
          Boot AI
        </span>
      </div>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
        <button
          onClick={() => onSelectView('playground')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'playground' ? 'text-indigo-400 font-semibold' : ''
          }`}
        >
          Playground
        </button>
        <button
          onClick={() => onSelectView('studio')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'studio' ? 'text-indigo-400 font-semibold' : ''
          }`}
        >
          Bot Studio
        </button>
        <button
          onClick={onOpenPresets}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Presets Library
        </button>
        <button
          onClick={() => onSelectView('embed')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'embed' ? 'text-indigo-400 font-semibold' : ''
          }`}
        >
          Export & Embed
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] rounded-lg transition-all shadow-sm shadow-indigo-600/30 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Boot New Bot</span>
        </button>
      </div>
    </header>
  );
};
